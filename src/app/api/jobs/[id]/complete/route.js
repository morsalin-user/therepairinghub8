// api/jobs/[id]/complete/route.js - FIXED VERSION

import { NextResponse } from "next/server"
import connectToDatabase from "../../../../../lib/db"
import Job from "../../../../../models/Job"
import User from "../../../../../models/User"
import Transaction from "../../../../../models/Transaction"
import Notification from "../../../../../models/Notification"
import { handleProtectedRoute } from "../../../../../lib/auth"
import { releasePayment } from "../../../../../lib/payment" // Import the proper payment release function

export async function POST(req, { params }) {
  try {
    await connectToDatabase()

    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return authResult
    }

    // Get job ID from params
    const jobId = params.id

    console.log("Completing job:", { jobId, userId: authResult.user._id })

    // Find the job
    const job = await Job.findById(jobId).populate("postedBy", "name email").populate("hiredProvider", "name email")

    if (!job) {
      console.log("Job not found with ID:", jobId)
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    // Check if job is in progress
    if (job.status !== "in_progress") {
      console.log("Job status is not in_progress:", job.status)
      return NextResponse.json({ success: false, message: "Job is not in progress" }, { status: 400 })
    }

    // Check if user is authorized to complete the job (job poster or auto-completion)
    const isJobPoster = job.postedBy._id.toString() === authResult.user._id.toString()
    const isAutoComplete = req.headers.get("x-auto-complete") === "true"

    console.log("Authorization check:", { 
      isJobPoster, 
      isAutoComplete, 
      jobPosterId: job.postedBy._id.toString(), 
      userId: authResult.user._id.toString() 
    })

    if (!isJobPoster && !isAutoComplete) {
      return NextResponse.json(
        { success: false, message: "Only the job poster can mark the job as completed" },
        { status: 403 },
      )
    }

    // If manual completion by job poster, check if escrow period has ended
    if (isJobPoster && !isAutoComplete) {
      const now = new Date()
      const escrowEndDate = new Date(job.escrowEndDate)

      if (now < escrowEndDate) {
        const timeRemaining = Math.ceil((escrowEndDate - now) / 1000)
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${timeRemaining} seconds before marking the job as completed`,
          },
          { status: 400 },
        )
      }
    }

    // Use the proper releasePayment function instead of manual updates
    console.log("Releasing payment for job:", jobId)
    const paymentResult = await releasePayment(jobId)
    
    if (!paymentResult.success) {
      console.error("Payment release failed:", paymentResult.error)
      return NextResponse.json(
        { success: false, message: `Failed to release payment: ${paymentResult.error}` },
        { status: 500 }
      )
    }

    console.log("Payment released successfully:", {
      providerAmount: paymentResult.providerAmount,
      newProviderBalance: paymentResult.newProviderBalance
    })

    // Get the updated job (releasePayment already updated it)
    const updatedJob = await Job.findById(jobId)
      .populate("postedBy", "name email avatar")
      .populate("hiredProvider", "name email avatar")

    // Create notifications
    if (job.hiredProvider) {
      await Notification.create({
        recipient: job.hiredProvider._id,
        sender: authResult.user._id,
        type: "job_completed",
        message: `Job completed: ${job.title}. Payment of $${paymentResult.providerAmount.toFixed(2)} has been released to your account.`,
        relatedId: jobId,
        onModel: "Job",
      })
    }

    // Create notification for job poster if auto-completed
    if (isAutoComplete) {
      await Notification.create({
        recipient: job.postedBy._id,
        sender: job.hiredProvider._id,
        type: "job_completed",
        message: `Job auto-completed: ${job.title}. Escrow period has ended and payment has been released.`,
        relatedId: jobId,
        onModel: "Job",
      })
    }

    console.log("Job completed successfully:", updatedJob._id)

    return NextResponse.json({
      success: true,
      message: "Job completed successfully and payment released",
      job: updatedJob,
      paymentDetails: {
        providerAmount: paymentResult.providerAmount,
        newProviderBalance: paymentResult.newProviderBalance
      }
    })
  } catch (error) {
    console.error("Complete job error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}