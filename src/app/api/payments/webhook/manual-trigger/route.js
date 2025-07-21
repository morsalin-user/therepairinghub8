// api/payments/webhook/manual-trigger/route.js

import { NextResponse } from "next/server"
import connectToDatabase from "../../../../../lib/db"
import Transaction from "../../../../../models/Transaction"
import Job from "../../../../../models/Job"
import User from "../../../../../models/User"
import Notification from "../../../../../models/Notification"

// This endpoint is for development/testing only
export async function POST(req) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "This endpoint is only available in development mode" },
      { status: 403 },
    )
  }

  try {
    await connectToDatabase()

    const { jobId } = await req.json()

    if (!jobId) {
      return NextResponse.json({ success: false, message: "Job ID is required" }, { status: 400 })
    }

    console.log("Manual webhook trigger for job:", jobId)

    // Find the job
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    // Check if job is in the right state to start escrow
    if (job.status !== "active" || !job.hiredProvider) {
      return NextResponse.json(
        { success: false, message: "Job must be active with a hired provider to start escrow" },
        { status: 400 }
      )
    }

    // Only start escrow process - no direct completion
    return await startEscrowProcess(job)
  } catch (error) {
    console.error("Manual webhook trigger error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

async function startEscrowProcess(job) {
  // Find the most recent transaction for this job
  const transaction = await Transaction.findOne({ job: job._id }).sort({ createdAt: -1 })
  if (!transaction) {
    return NextResponse.json({ success: false, message: "No transaction found for this job" }, { status: 404 })
  }

  console.log("Found transaction:", transaction._id, "status:", transaction.status)

  // Check if escrow already started
  if (transaction.status === "in_escrow") {
    return NextResponse.json(
      { success: false, message: "Escrow process already started for this job" },
      { status: 400 }
    )
  }

  // Update transaction status
  transaction.status = "in_escrow"
  await transaction.save()

  // Set escrow end date (use environment variable or default to 10 days)
  const escrowPeriodMinutes = Number.parseInt(process.env.ESCROW_PERIOD_MINUTES || "14400", 10) // 14400 minutes = 10 days
  const escrowEndDate = new Date(Date.now() + escrowPeriodMinutes * 60 * 1000)

  // Update job status
  job.status = "in_progress"
  job.paymentStatus = "in_escrow"
  job.escrowEndDate = escrowEndDate
  job.transactionId = transaction._id
  await job.save()

  console.log("Updated job status to in_progress, escrow end date:", escrowEndDate)

  // Update buyer's spending
  if (transaction.customer) {
    await User.findByIdAndUpdate(transaction.customer, {
      $inc: { totalSpending: transaction.amount },
    })
  }

  // Create notifications for both parties
  const buyerNotification = await Notification.create({
    recipient: transaction.customer,
    type: "job_started",
    message: `Your job "${job.title}" has been started. Payment is now in escrow and will be released when the job is completed.`,
    relatedId: job._id,
    onModel: "Job",
  })

  const providerNotification = await Notification.create({
    recipient: job.hiredProvider,
    type: "job_started",
    message: `You can now start working on "${job.title}". Payment will be released when the job is completed.`,
    relatedId: job._id,
    onModel: "Job",
  })

  return NextResponse.json({
    success: true,
    message: "Escrow process started successfully",
    job: {
      id: job._id,
      status: job.status,
      paymentStatus: job.paymentStatus,
      escrowEndDate,
    },
    transaction: {
      id: transaction._id,
      status: transaction.status,
    },
  })
}