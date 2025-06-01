"use client"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X } from "lucide-react"

export default function OTPVerificationModal({ isOpen, onClose, email, onVerificationSuccess }) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { signUp, isLoaded } = useSignUp()
  const { toast } = useToast()

  const handleVerifyOTP = async () => {
    if (!isLoaded || !signUp) {
      toast({
        title: "Error",
        description: "Verification system not ready. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP code.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    try {
      // Verify the OTP with Clerk
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otp,
      })

      if (completeSignUp.status === "complete") {
        // OTP verified successfully - pass the Clerk user to parent
        onVerificationSuccess(completeSignUp.createdUserId ? { id: completeSignUp.createdUserId } : completeSignUp)
        onClose()
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("OTP verification error:", error)

      let errorMessage = "Failed to verify OTP. Please try again."

      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        if (clerkError.code === "form_code_incorrect") {
          errorMessage = "The verification code is incorrect. Please try again."
        } else if (clerkError.code === "verification_expired") {
          errorMessage = "The verification code has expired. Please request a new one."
        } else {
          errorMessage = clerkError.longMessage || clerkError.message || errorMessage
        }
      }

      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (!isLoaded || !signUp) {
      toast({
        title: "Error",
        description: "Verification system not ready. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      })
      setOtp("") // Clear the current OTP input
    } catch (error) {
      console.error("Resend OTP error:", error)

      let errorMessage = "Failed to resend OTP. Please try again."

      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        errorMessage = clerkError.longMessage || clerkError.message || errorMessage
      }

      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Verify Your Email</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={handleOTPChange}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              autoComplete="one-time-code"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6 || !isLoaded}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isVerifying || isResending || !isLoaded}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Didn't receive the code? Check your spam folder or click resend.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
