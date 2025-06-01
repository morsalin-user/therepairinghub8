import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 })
    }

    // Check if OTP exists and is valid
    const otpStore = global.otpStore || {}
    const storedOTP = otpStore[email]

    if (!storedOTP) {
      return NextResponse.json(
        { success: false, message: "No verification code found for this email" },
        { status: 400 },
      )
    }

    if (storedOTP.expires < Date.now()) {
      // Clean up expired OTP
      delete otpStore[email]
      return NextResponse.json({ success: false, message: "Verification code has expired" }, { status: 400 })
    }

    // For demo purposes, accept any 6-digit code
    // In production, verify the actual OTP
    if (otp.length === 6) {
      // Clean up used OTP
      delete otpStore[email]
      return NextResponse.json({ success: true, message: "OTP verified successfully" })
    }

    return NextResponse.json({ success: false, message: "Invalid verification code" }, { status: 400 })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ success: false, message: "Failed to verify code" }, { status: 500 })
  }
}
