"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"

export default function PaymentSuccess() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [jobId, setJobId] = useState(null)
  const [error, setError] = useState(null)
  const [jobDetails, setJobDetails] = useState(null)

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const jobId = searchParams.get("jobId")
        const paymentId = searchParams.get("paymentId")
        const payerId = searchParams.get("PayerID")

        if (!jobId) {
          setError(t("paymentSuccessPage.missingJobInformation"))
          toast({
            title: t("common.error"),
            description: t("paymentSuccessPage.missingJobInformation"),
            variant: "destructive",
          })
          router.push("/profile")
          return
        }

        setJobId(jobId)

        if (paymentId && payerId) {
          console.log("Capturing PayPal payment:", { paymentId, payerId, jobId })
          const response = await fetch(`/api/payments/paypal/capture`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentId,
              payerId,
              jobId,
            }),
          })

          const data = await response.json()

          if (!data.success) {
            setError(data.message || t("paymentSuccessPage.failedToCapturePayment"))
            toast({
              title: t("paymentSuccessPage.paymentError"),
              description: data.message || t("paymentSuccessPage.failedToCapturePayment"),
              variant: "destructive",
            })
          } else {
            toast({
              title: t("paymentSuccessPage.paymentSuccessful"),
              description: t("paymentSuccessPage.paymentProcessed"),
            })
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log("Manually triggering webhook for testing in development")
            try {
              const jobResponse = await fetch(`/api/jobs/${jobId}`)
              const jobData = await jobResponse.json()

              if (jobData.success) {
                setJobDetails(jobData.job)
                const webhookResponse = await fetch(`/api/payments/webhook/manual-trigger`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ jobId }),
                })
                const webhookData = await webhookResponse.json()
                console.log("Manual webhook trigger response:", webhookData)
              }
            } catch (err) {
              console.error("Error fetching job details or triggering webhook:", err)
            }
          }
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Payment capture error:", error)
        setError(t("paymentSuccessPage.errorProcessingPayment"))
        toast({
          title: t("paymentSuccessPage.paymentError"),
          description: t("paymentSuccessPage.errorProcessingPayment"),
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    capturePayment()
  }, [searchParams, router, toast, t])

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">{t("paymentSuccessPage.paymentSuccessful")}</CardTitle>
          <CardDescription>{t("paymentSuccessPage.paymentProcessed")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("paymentSuccessPage.thankYouMessage")}
              </p>
              {jobDetails && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium">{jobDetails.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("paymentSuccessPage.status")}: {jobDetails.status === "in_progress" ? t("paymentSuccessPage.inProgress") : jobDetails.status}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {jobId && (
            <Button asChild>
              <Link href={`/jobs/${jobId}`}>{t("paymentSuccessPage.viewJobDetails")}</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/profile">{t("paymentSuccessPage.goToProfile")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
