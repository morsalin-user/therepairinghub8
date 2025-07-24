// api/payments/webhook/manual-trigger/route.js - FIXED VERSION

import { NextResponse } from "next/server"
import connectToDatabase from "../../../../../lib/db"
import Transaction from "../../../../../models/Transaction"
import Job from "../../../../../models/Job"
import User from "../../../../../models/User"
import Notification from "../../../../../models/Notification"
import { releasePayment } from "../../../../../lib/payment"

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
    const job = await Job.findById(jobId).populate('hiredProvider postedBy')
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

    // Start and complete escrow process immediately
    return await startAndCompleteEscrowProcess(job)
  } catch (error) {
    console.error("Manual webhook trigger error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

async function startAndCompleteEscrowProcess(job) {
  try {
    // Find the most recent transaction for this job
    const transaction = await Transaction.findOne({ job: job._id }).sort({ createdAt: -1 })
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "No transaction found for this job" },
        { status: 404 }
      )
    }
    
    console.log("Found transaction:", transaction._id, "status:", transaction.status)

    // Check if escrow already started
    if (transaction.status === "in_escrow" || transaction.status === "released") {
      return NextResponse.json(
        { success: false, message: "Escrow process already started or completed for this job" },
        { status: 400 }
      )
    }

    // Update transaction status to in_escrow first
    transaction.status = "in_escrow"
    await transaction.save()

    const escrowPeriodMinutes = parseInt(process.env.ESCROW_PERIOD_MINUTES || "1", 10)
    const escrowStartDate = new Date()
    const escrowEndDate = new Date(Date.now() + escrowPeriodMinutes * 60 * 1000)

    // Update job status to in_progress
    job.status = "in_progress"
    job.paymentStatus = "in_escrow"
    job.escrowEndDate = escrowEndDate
    job.transactionId = transaction._id
    await job.save()

    console.log("Updated job status to in_progress, escrow started at:", escrowStartDate)

    // Create notifications for both parties about job starting
    await Notification.create({
      recipient: transaction.customer,
      type: "job_started",
      message: `Your job "${job.title}" has been started. Payment is now in escrow and will be released when the job is completed.`,
      relatedId: job._id,
      onModel: "Job",
    })

    await Notification.create({
      recipient: job.hiredProvider._id,
      type: "job_started",
      message: `You can now start working on "${job.title}". Payment will be released when the job is completed.`,
      relatedId: job._id,
      onModel: "Job",
    })

    console.log("Starting payment release process...")

    // Immediately complete the escrow process using the fixed releasePayment function
    const releaseResult = await releasePayment(job._id)
    
    if (!releaseResult.success) {
      console.error("Payment release failed:", releaseResult.error)
      return NextResponse.json(
        { success: false, message: `Payment release failed: ${releaseResult.error}` },
        { status: 500 }
      )
    }

    console.log("Payment release completed successfully:", {
      providerAmount: releaseResult.providerAmount,
      newBalance: releaseResult.newProviderBalance,
      newEarnings: releaseResult.newTotalEarnings
    })

    return NextResponse.json({
      success: true,
      message: "Escrow process started and completed immediately",
      job: {
        id: job._id,
        status: "completed",
        paymentStatus: "released",
        escrowStartDate,
        escrowEndDate,
      },
      transaction: {
        id: transaction._id,
        status: "released",
      },
      paymentDetails: {
        providerAmount: releaseResult.providerAmount,
        newProviderBalance: releaseResult.newProviderBalance,
        newTotalEarnings: releaseResult.newTotalEarnings
      }
    })
  } catch (error) {
    console.error("Escrow process error:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}