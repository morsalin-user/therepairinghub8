"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Info, AlertTriangle } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function Documentation() {
  const { t } = useTranslation()

  // Helper function to safely get array from translation
  const getTranslationArray = (key) => {
    const translation = t(key)
    return Array.isArray(translation) ? translation : []
  }

  return (
    <div className="container py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-[#1E3A8A]">{t("documentationPage.title")}</h1>
          <p className="text-xl text-[#22304A] break-words">{t("documentationPage.subtitle")}</p>
        </div>

        <Tabs defaultValue="getting-started">
          <div className="flex justify-center mb-6">
            <TabsList className="flex flex-wrap gap-2 bg-white border border-gray-200 p-1 rounded-lg">
              <TabsTrigger
                value="getting-started"
                className="whitespace-nowrap data-[state=active]:bg-[#10B981] data-[state=active]:text-white text-[#22304A] hover:bg-gray-100"
              >
                {t("documentationPage.gettingStarted")}
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="whitespace-nowrap data-[state=active]:bg-[#10B981] data-[state=active]:text-white text-[#22304A] hover:bg-gray-100"
              >
                {t("documentationPage.forCustomers")}
              </TabsTrigger>
              <TabsTrigger
                value="providers"
                className="whitespace-nowrap data-[state=active]:bg-[#10B981] data-[state=active]:text-white text-[#22304A] hover:bg-gray-100"
              >
                {t("documentationPage.forServiceProviders")}
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="whitespace-nowrap data-[state=active]:bg-[#10B981] data-[state=active]:text-white text-[#22304A] hover:bg-gray-100"
              >
                {t("documentationPage.paymentsAndSecurity")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-[#1E3A8A] to-[#60A5FA] text-white rounded-t-lg">
                <CardTitle className="break-words text-white">{t("documentationPage.gettingStarted")}</CardTitle>
                <CardDescription className="break-words text-blue-100">
                  {t("documentationPage.gettingStartedDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.whatIsRepairingHub")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">
                    {t("documentationPage.whatIsRepairingHubDescription")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.creatingAccount")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">{t("documentationPage.creatingAccountDescription")}</p>
                  <ol className="list-decimal pl-6 space-y-2 text-[#22304A]">
                    <li className="break-words">{t("documentationPage.creatingAccountStep1")}</li>
                    <li className="break-words">{t("documentationPage.creatingAccountStep2")}</li>
                    <li className="break-words">{t("documentationPage.creatingAccountStep3")}</li>
                    <li className="break-words">{t("documentationPage.creatingAccountStep4")}</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.navigatingPlatform")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">
                    {t("documentationPage.navigatingPlatformDescription")}
                  </p>
                  <ul className="space-y-3 text-[#22304A]">
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-[#1E3A8A]">{t("documentationPage.home")}:</strong>{" "}
                        {t("documentationPage.homeDescription")}
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-[#1E3A8A]">{t("documentationPage.jobs")}:</strong>{" "}
                        {t("documentationPage.jobsDescription")}
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-[#1E3A8A]">{t("documentationPage.services")}:</strong>{" "}
                        {t("documentationPage.servicesDescription")}
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-[#1E3A8A]">{t("documentationPage.profile")}:</strong>{" "}
                        {t("documentationPage.profileDescription")}
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-[#1E3A8A]">{t("documentationPage.notifications")}:</strong>{" "}
                        {t("documentationPage.notificationsDescription")}
                      </span>
                    </li>
                  </ul>
                </section>

                <div className="bg-blue-50 border border-[#38BDF8] rounded-lg p-4 flex items-start">
                  <Info className="h-5 w-5 text-[#38BDF8] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-[#1E3A8A] break-words">{t("documentationPage.needMoreHelp")}</h3>
                    <p className="text-[#22304A] text-sm mt-1 break-words">
                      {t("documentationPage.contactSupport")}{" "}
                      <Link href="/contact" className="underline text-[#10B981] hover:text-[#38BDF8]">
                        {t("documentationPage.contactPage")}
                      </Link>{" "}
                      {t("documentationPage.toGetInTouch")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-[#1E3A8A] to-[#60A5FA] text-white rounded-t-lg">
                <CardTitle className="break-words text-white">{t("documentationPage.forCustomers")}</CardTitle>
                <CardDescription className="break-words text-blue-100">
                  {t("documentationPage.forCustomersDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.postingJob")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">{t("documentationPage.postingJobDescription")}</p>
                  <ol className="list-decimal pl-6 space-y-2 text-[#22304A]">
                    <li className="break-words">{t("documentationPage.postingJobStep1")}</li>
                    <li className="break-words">
                      {t("documentationPage.postingJobStep2")}
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li className="break-words">{t("documentationPage.jobTitle")}</li>
                        <li className="break-words">{t("documentationPage.jobDescription")}</li>
                        <li className="break-words">{t("documentationPage.budget")}</li>
                        <li className="break-words">{t("documentationPage.location")}</li>
                        <li className="break-words">{t("documentationPage.dateNeeded")}</li>
                      </ul>
                    </li>
                    <li className="break-words">{t("documentationPage.postingJobStep3")}</li>
                    <li className="break-words">{t("documentationPage.postingJobStep4")}</li>
                    <li className="break-words">{t("documentationPage.postingJobStep5")}</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.reviewingQuotes")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">{t("documentationPage.reviewingQuotesDescription")}</p>
                  <ul className="space-y-3 text-[#22304A]">
                    {getTranslationArray("documentationPage.reviewQuotesSteps").map((step, index) => (
                      <li key={index} className="flex items-start break-words">
                        <Check className="h-5 w-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.hiringServiceProvider")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">
                    {t("documentationPage.hiringServiceProviderDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-[#22304A]">
                    {getTranslationArray("documentationPage.hiringSteps").map((step, index) => (
                      <li key={index} className="break-words">
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words text-[#1E3A8A]">
                    {t("documentationPage.completingJob")}
                  </h2>
                  <p className="text-[#22304A] mb-4 break-words">{t("documentationPage.completingJobDescription")}</p>
                  <ol className="list-decimal pl-6 space-y-2 text-[#22304A]">
                    {getTranslationArray("documentationPage.completingSteps").map((step, index) => (
                      <li key={index} className="break-words">
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>

                <div className="bg-orange-50 border border-[#F59E42] rounded-lg p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-[#F59E42] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-[#1E3A8A] break-words">{t("documentationPage.importantNote")}</h3>
                    <p className="text-[#22304A] text-sm mt-1 break-words">
                      {t("documentationPage.importantNoteDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle className="break-words">{t("documentationPage.forServiceProviders")}</CardTitle>
                <CardDescription className="break-words">
                  {t("documentationPage.forServiceProvidersDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.findingJobs")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.findingJobsDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.browseJobs")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.useFilters")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.search")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.enableNotifications")}</strong>
                      </span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.submittingQuotes")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.submittingQuotesDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.submittingQuotesSteps").map((step, index) => (
                      <li key={index} className="break-words">
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.gettingHired")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.gettingHiredDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.gettingHiredSteps").map((step, index) => (
                      <li key={index} className="flex items-start break-words">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300 mt-4 break-words">
                    {t("documentationPage.gettingHiredAdditionalInfo")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.gettingPaid")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.gettingPaidDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.gettingPaidSteps").map((step, index) => (
                      <li key={index} className="break-words">
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 break-words">
                      {t("documentationPage.proTip")}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm mt-1 break-words">
                      {t("documentationPage.proTipDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="break-words">{t("documentationPage.paymentsAndSecurity")}</CardTitle>
                <CardDescription className="break-words">
                  {t("documentationPage.paymentsAndSecurityDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.howPaymentsWork")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.howPaymentsWorkDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="break-words">
                      <strong>{t("documentationPage.jobPosting")}</strong>
                    </li>
                    <li className="break-words">
                      <strong>{t("documentationPage.escrow")}</strong>
                    </li>
                    <li className="break-words">
                      <strong>{t("documentationPage.hiring")}</strong>
                    </li>
                    <li className="break-words">
                      <strong>{t("documentationPage.completion")}</strong>
                    </li>
                    <li className="break-words">
                      <strong>{t("documentationPage.platformFee")}</strong>
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.paymentMethods")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.paymentMethodsDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.creditDebitCards")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.payPal")}</strong>
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300 mt-4 break-words">
                    {t("documentationPage.withdrawalsInfo")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">{t("documentationPage.securityMeasures")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.securityMeasuresDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.securePayments")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.escrowSystem")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.userVerification")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.ratingsReviews")}</strong>
                      </span>
                    </li>
                    <li className="flex items-start break-words">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{t("documentationPage.secureMessaging")}</strong>
                      </span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 break-words">
                    {t("documentationPage.disputeResolution")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
                    {t("documentationPage.disputeResolutionDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.disputeResolutionSteps").map((step, index) => (
                      <li key={index} className="break-words">
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-300 break-words">
                      {t("documentationPage.importantSecurityNotice")}
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1 break-words">
                      {t("documentationPage.importantSecurityNoticeDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
