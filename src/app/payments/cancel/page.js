"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function PaymentCancel() {
  const { t } = useTranslation()

  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">{t("paymentCancelPage.paymentCancelled")}</CardTitle>
          <CardDescription>{t("paymentCancelPage.paymentProcessCancelled")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t("paymentCancelPage.noChargesMessage")}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/jobs">{t("paymentCancelPage.browseJobs")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">{t("paymentCancelPage.returnToHome")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
