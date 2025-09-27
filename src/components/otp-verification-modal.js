"use client"
import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function OTPVerificationModal({ isOpen, onClose, email, onVerificationSuccess }) {
  const { t } = useTranslation()
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { signUp, isLoaded } = useSignUp()
  const { toast } = useToast()

  const handleVerifyOTP = async () => {
    if (!isLoaded || !signUp) {
      toast({
        title: t("otpVerificationModal.error"),
        description: t("otpVerificationModal.verificationSystemNotReady"),
        variant: "destructive",
      })
      return
    }
    if (!otp || otp.length !== 6) {
      toast({
        title: t("otpVerificationModal.invalidOTP"),
        description: t("otpVerificationModal.invalidOTPDescription"),
        variant: "destructive",
      })
      return
    }
    setIsVerifying(true)
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otp,
      })
      if (completeSignUp.status === "complete") {
        onVerificationSuccess(completeSignUp.createdUserId ? { id: completeSignUp.createdUserId } : completeSignUp)
        onClose()
      } else {
        toast({
          title: t("otpVerificationModal.verificationFailed"),
          description: t("otpVerificationModal.invalidOTPCode"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      let errorMessage = t("otpVerificationModal.failedToVerifyOTP")
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        if (clerkError.code === "form_code_incorrect") {
          errorMessage = t("otpVerificationModal.verificationCodeIncorrect")
        } else if (clerkError.code === "verification_expired") {
          errorMessage = t("otpVerificationModal.verificationCodeExpired")
        } else {
          errorMessage = clerkError.longMessage || clerkError.message || errorMessage
        }
      }
      toast({
        title: t("otpVerificationModal.verificationError"),
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
        title: t("otpVerificationModal.error"),
        description: t("otpVerificationModal.verificationSystemNotReady"),
        variant: "destructive",
      })
      return
    }
    setIsResending(true)
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      toast({
        title: t("otpVerificationModal.otpResent"),
        description: t("otpVerificationModal.newVerificationCodeSent"),
      })
      setOtp("")
    } catch (error) {
      console.error("Resend OTP error:", error)
      let errorMessage = t("otpVerificationModal.failedToResendOTP")
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        errorMessage = clerkError.longMessage || clerkError.message || errorMessage
      }
      toast({
        title: t("otpVerificationModal.error"),
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
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#22304A]">
              {t("otpVerificationModal.verifyYourEmail")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#22304A]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-[#6B7280]">
            {t("otpVerificationModal.verificationCodeSent")} <span className="font-medium text-[#22304A]">{email}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-[#22304A]">
              {t("otpVerificationModal.verificationCode")}
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder={t("otpVerificationModal.enterVerificationCode")}
              value={otp}
              onChange={handleOTPChange}
              maxLength={6}
              className="text-center text-lg tracking-widest border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]"
              autoComplete="one-time-code"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6 || !isLoaded}
              className="w-full bg-[#10B981] hover:bg-[#0D9468] text-white hover:shadow-sm transition-colors"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("otpVerificationModal.verifying")}
                </>
              ) : (
                t("otpVerificationModal.verifyOTP")
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isVerifying || isResending || !isLoaded}
              className="w-full border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 hover:text-[#0D9468] transition-colors"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("otpVerificationModal.resending")}
                </>
              ) : (
                t("otpVerificationModal.resendOTP")
              )}
            </Button>
          </div>
          <div className="text-xs text-[#6B7280] text-center">
            {t("otpVerificationModal.didntReceiveCode")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
