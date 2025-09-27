"use client"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, CreditCard } from "lucide-react"
import { Paypal } from "./paypal-icon" // Ensure you have a Paypal icon component or import it from a library
import { useToast } from "@/hooks/use-toast"
import { jobAPI } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n"

export default function PaymentModal({ isOpen, onClose, jobId, providerId, providerName, amount, onSuccess }) {
  const { t } = useTranslation()
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: t("paymentModal.paymentMethodRequired"),
        description: t("paymentModal.selectPaymentMethodDescription"),
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    const totalAmount = amount * 1.1 // Include the 10% service fee
    try {
      const response = await jobAPI.processPayment(jobId, providerId, paymentMethod)
      if (response.success) {
        if (paymentMethod === "paypal" && response.payment?.approvalUrl) {
          window.location.href = response.payment.approvalUrl
          return
        }
        if (paymentMethod === "card" && response.payment?.checkoutUrl) {
          window.location.href = response.payment.checkoutUrl
          return
        }
        toast({
          title: t("paymentModal.providerHired"),
          description: t("paymentModal.providerHiredDescription", { providerName }),
        })
        onSuccess(response.job)
        onClose()
      } else {
        throw new Error(response.message || t("paymentModal.paymentFailed"))
      }
    } catch (error) {
      console.error("Payment error:", error)
      let errorMessage = t("paymentModal.paymentError")
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      toast({
        title: t("paymentModal.paymentFailed"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#22304A]">
            {t("paymentModal.confirmPayment")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#6B7280]">
            {t("paymentModal.serviceFeeDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>{t("paymentModal.jobBudget")}</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>{t("paymentModal.serviceFee")}</span>
              <span>${(amount * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#22304A] border-t border-[#E5E7EB] pt-3">
              <span>{t("paymentModal.total")}</span>
              <span>${(amount * 1.1).toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-[#22304A] mb-2">
              {t("paymentModal.selectPaymentMethod")}
            </p>
            <div
              className={`border rounded-lg p-4 cursor-pointer flex items-center transition-colors ${
                paymentMethod === "card"
                  ? "border-[#10B981] bg-[#10B981]/10"
                  : "border-[#E5E7EB] hover:bg-[#F3F4F6]"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <CreditCard className="h-5 w-5 mr-2 text-[#10B981]" />
              <span className="text-[#22304A]">{t("paymentModal.creditOrDebitCard")}</span>
            </div>
            <div
              className={`border rounded-lg p-4 cursor-pointer flex items-center transition-colors ${
                paymentMethod === "paypal"
                  ? "border-[#10B981] bg-[#10B981]/10"
                  : "border-[#E5E7EB] hover:bg-[#F3F4F6]"
              }`}
              onClick={() => setPaymentMethod("paypal")}
            >
              <Paypal className="h-5 w-5 mr-2 text-[#10B981]" />
              <span className="text-[#22304A]">{t("paymentModal.payPal")}</span>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-[#6B7280] hover:text-[#22304A] hover:bg-[#F3F4F6]">
            {t("paymentModal.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePayment}
            disabled={isSubmitting || !paymentMethod}
            className="bg-[#10B981] hover:bg-[#0D9468] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("paymentModal.processing")}
              </>
            ) : (
              `${t("paymentModal.pay")} $${(amount * 1.1).toFixed(2)}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
