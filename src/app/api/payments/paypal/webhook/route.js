import { NextResponse } from "next/server"
import { headers } from "next/headers"
import connectToDatabase from "../../../../../lib/db"
import Transaction from "../../../../../models/Transaction"
import Job from "../../../../../models/Job"
import User from "../../../../../models/User"
import Notification from "../../../../../models/Notification"
import { sendNotification } from "../../../../../lib/websocket-utils"

export async function POST(req) {
  try {
    await connectToDatabase()

    const headersList = headers()
    const transmissionId = headersList.get("paypal-transmission-id")
    const certUrl = headersList.get("paypal-cert-url")
    const transmissionSig = headersList.get("paypal-transmission-sig")
    const transmissionTime = headersList.get("paypal-transmission-time")
    const authAlgo = headersList.get("paypal-auth-algo")
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    const requestBody = await req.text()

    const isValid = await verifyPayPalWebhookSignature({
      transmissionId,
      transmissionSig,
      transmissionTime,
      certUrl,
      authAlgo,
      webhookId,
      body: requestBody,
    })

    if (!isValid) {
      console.error("❌ Invalid PayPal webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(requestBody)

    // Handle events
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        await handleOrderApproved(event)
        break
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptured(event)
        break
      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentDenied(event)
        break
      default:
        console.log(`⚠️ Unhandled event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("💥 PayPal webhook error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// ✅ Webhook verification using PayPal's API
async function verifyPayPalWebhookSignature({
  transmissionId,
  transmissionSig,
  transmissionTime,
  certUrl,
  authAlgo,
  webhookId,
  body,
}) {
  try {
    const basicAuth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64")

    const tokenRes = await fetch(`${process.env.PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const verifyRes = await fetch(
      `${process.env.PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      }
    )

    const verifyData = await verifyRes.json()
    return verifyData.verification_status === "SUCCESS"
  } catch (error) {
    console.error("💥 Error verifying PayPal webhook:", error)
    return false
  }
}

// ✅ Handle order approved
async function handleOrderApproved(event) {
  try {
    const orderId = event.resource.id
    const transaction = await Transaction.findOne({ paymentId: orderId })
    if (!transaction) return console.error("Transaction not found for order:", orderId)

    transaction.status = "pending_capture"
    await transaction.save()

    console.log("✅ PayPal order approved for transaction:", transaction._id)
  } catch (err) {
    console.error("Error handling order approved:", err)
  }
}

// ✅ Handle payment captured
async function handlePaymentCaptured(event) {
  try {
    const orderId = event.resource.supplementary_data?.related_ids?.order_id
    const transaction = await Transaction.findOne({ paymentId: orderId })
    if (!transaction) return console.error("Transaction not found for order:", orderId)

    transaction.status = "in_escrow"
    await transaction.save()

    const job = await Job.findById(transaction.job)
    if (!job) return console.error("Job not found for transaction:", transaction._id)

    const escrowMinutes = parseInt(process.env.ESCROW_PERIOD_MINUTES || "1440", 10)
    const escrowEndDate = new Date(Date.now() + escrowMinutes * 60 * 1000)

    job.status = "in_progress"
    job.paymentStatus = "in_escrow"
    job.escrowEndDate = escrowEndDate
    job.transactionId = transaction._id
    await job.save()

    await User.findByIdAndUpdate(transaction.customer, {
      $inc: { totalSpending: transaction.amount },
    })

    const buyerNotification = await Notification.create({
      recipient: transaction.customer,
      type: "payment",
      message: `Payment successful for job: ${job.title}. Provider has been hired.`,
      relatedId: transaction._id,
      onModel: "Transaction",
    })
    sendNotification(transaction.customer, buyerNotification)

    const providerNotification = await Notification.create({
      recipient: job.hiredProvider,
      type: "job_assigned",
      message: `You have been hired for the job: ${job.title}. Payment has been received.`,
      relatedId: job._id,
      onModel: "Job",
    })
    sendNotification(job.hiredProvider, providerNotification)

    console.log("✅ Payment captured for transaction:", transaction._id)

    scheduleJobCompletion(job._id, escrowEndDate)
  } catch (err) {
    console.error("Error handling payment captured:", err)
  }
}

// ✅ Handle payment denied
async function handlePaymentDenied(event) {
  try {
    const orderId = event.resource.supplementary_data?.related_ids?.order_id
    const transaction = await Transaction.findOne({ paymentId: orderId })
    if (!transaction) return console.error("Transaction not found for order:", orderId)

    transaction.status = "failed"
    await transaction.save()

    const job = await Job.findById(transaction.job)
    if (!job) return console.error("Job not found for transaction:", transaction._id)

    job.status = "active"
    job.hiredProvider = null
    job.paymentStatus = "pending"
    await job.save()

    const notification = await Notification.create({
      recipient: transaction.customer,
      type: "payment",
      message: `Payment failed for job: ${job.title}. Please try again.`,
      relatedId: transaction._id,
      onModel: "Transaction",
    })
    sendNotification(transaction.customer, notification)

    console.log("❌ Payment denied for transaction:", transaction._id)
  } catch (err) {
    console.error("Error handling payment denied:", err)
  }
}

// ✅ Schedule job completion after escrow period
async function scheduleJobCompletion(jobId, escrowEndDate) {
  const timeUntilCompletion = new Date(escrowEndDate).getTime() - Date.now()

  if (timeUntilCompletion <= 0) {
    await completeJob(jobId)
    return
  }

  if (timeUntilCompletion > 2147483647) {
    console.warn(`Escrow too long. Consider using a queue system for job ${jobId}`)
    return
  }

  setTimeout(async () => {
    await completeJob(jobId)
  }, timeUntilCompletion)

  console.log(`📅 Job ${jobId} scheduled for auto-completion in ${Math.round(timeUntilCompletion / 60000)} minutes`)
}

// ✅ Complete job and release payment
async function completeJob(jobId) {
  try {
    const job = await Job.findById(jobId)
    if (!job || job.status !== "in_progress" || job.paymentStatus !== "in_escrow") return

    const transaction = await Transaction.findById(job.transactionId)
    if (!transaction) return console.error("Transaction not found for job:", jobId)

    transaction.provider = job.hiredProvider
    transaction.status = "released"
    await transaction.save()

    job.status = "completed"
    job.paymentStatus = "released"
    job.completedAt = new Date()
    await job.save()

    const providerAmount = transaction.amount - transaction.serviceFee
    await User.findByIdAndUpdate(job.hiredProvider, {
      $inc: {
        availableBalance: providerAmount,
        totalEarnings: providerAmount,
      },
    })

    const buyerNotification = await Notification.create({
      recipient: transaction.customer,
      type: "job_completed",
      message: `Your job "${job.title}" has been completed. Payment released to provider.`,
      relatedId: job._id,
      onModel: "Job",
    })
    const providerNotification = await Notification.create({
      recipient: job.hiredProvider,
      type: "payment",
      message: `Payment for job "${job.title}" has been released to your account.`,
      relatedId: transaction._id,
      onModel: "Transaction",
    })

    sendNotification(transaction.customer, buyerNotification)
    sendNotification(job.hiredProvider, providerNotification)

    console.log(`✅ Job ${jobId} completed and payment released`)
  } catch (err) {
    console.error("Error completing job:", err)
  }
}
