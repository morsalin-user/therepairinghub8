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
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">{t("documentationPage.title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">{t("documentationPage.subtitle")}</p>
        </div>
        <Tabs defaultValue="getting-started">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="getting-started">{t("documentationPage.gettingStarted")}</TabsTrigger>
              <TabsTrigger value="customers">{t("documentationPage.forCustomers")}</TabsTrigger>
              <TabsTrigger value="providers">{t("documentationPage.forServiceProviders")}</TabsTrigger>
              <TabsTrigger value="payments">{t("documentationPage.paymentsAndSecurity")}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="getting-started">
            <Card>
              <CardHeader>
                <CardTitle>{t("documentationPage.gettingStarted")}</CardTitle>
                <CardDescription>{t("documentationPage.gettingStartedDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.whatIsRepairingHub")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.whatIsRepairingHubDescription")}
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.creatingAccount")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.creatingAccountDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>{t("documentationPage.creatingAccountStep1")}</li>
                    <li>{t("documentationPage.creatingAccountStep2")}</li>
                    <li>{t("documentationPage.creatingAccountStep3")}</li>
                    <li>{t("documentationPage.creatingAccountStep4")}</li>
                  </ol>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.navigatingPlatform")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.navigatingPlatformDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.home")}:</strong> {t("documentationPage.homeDescription")}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.jobs")}:</strong> {t("documentationPage.jobsDescription")}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.services")}:</strong> {t("documentationPage.servicesDescription")}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.profile")}:</strong> {t("documentationPage.profileDescription")}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.notifications")}:</strong> {t("documentationPage.notificationsDescription")}</span>
                    </li>
                  </ul>
                </section>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">{t("documentationPage.needMoreHelp")}</h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                      {t("documentationPage.contactSupport")} <Link href="/contact" className="underline">{t("documentationPage.contactPage")}</Link> {t("documentationPage.toGetInTouch")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>{t("documentationPage.forCustomers")}</CardTitle>
                <CardDescription>{t("documentationPage.forCustomersDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.postingJob")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.postingJobDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>{t("documentationPage.postingJobStep1")}</li>
                    <li>
                      {t("documentationPage.postingJobStep2")}
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>{t("documentationPage.jobTitle")}</li>
                        <li>{t("documentationPage.jobDescription")}</li>
                        <li>{t("documentationPage.budget")}</li>
                        <li>{t("documentationPage.location")}</li>
                        <li>{t("documentationPage.dateNeeded")}</li>
                      </ul>
                    </li>
                    <li>{t("documentationPage.postingJobStep3")}</li>
                    <li>{t("documentationPage.postingJobStep4")}</li>
                    <li>{t("documentationPage.postingJobStep5")}</li>
                  </ol>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.reviewingQuotes")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.reviewingQuotesDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.reviewQuotesSteps").map((step, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.hiringServiceProvider")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{t("documentationPage.hiringServiceProviderDescription")}</p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.hiringSteps").map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.completingJob")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.completingJobDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.completingSteps").map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-300">{t("documentationPage.importantNote")}</h3>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                      {t("documentationPage.importantNoteDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>{t("documentationPage.forServiceProviders")}</CardTitle>
                <CardDescription>{t("documentationPage.forServiceProvidersDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.findingJobs")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.findingJobsDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.browseJobs")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.useFilters")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.search")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.enableNotifications")}</strong></span>
                    </li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.submittingQuotes")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.submittingQuotesDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.submittingQuotesSteps").map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.gettingHired")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{t("documentationPage.gettingHiredDescription")}</p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.gettingHiredSteps").map((step, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300 mt-4">
                    {t("documentationPage.gettingHiredAdditionalInfo")}
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.gettingPaid")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.gettingPaidDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.gettingPaidSteps").map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">{t("documentationPage.proTip")}</h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                      {t("documentationPage.proTipDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>{t("documentationPage.paymentsAndSecurity")}</CardTitle>
                <CardDescription>{t("documentationPage.paymentsAndSecurityDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.howPaymentsWork")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.howPaymentsWorkDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li><strong>{t("documentationPage.jobPosting")}</strong></li>
                    <li><strong>{t("documentationPage.escrow")}</strong></li>
                    <li><strong>{t("documentationPage.hiring")}</strong></li>
                    <li><strong>{t("documentationPage.completion")}</strong></li>
                    <li><strong>{t("documentationPage.platformFee")}</strong></li>
                  </ol>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.paymentMethods")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.paymentMethodsDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.creditDebitCards")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.payPal")}</strong></span>
                    </li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300 mt-4">
                    {t("documentationPage.withdrawalsInfo")}
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.securityMeasures")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.securityMeasuresDescription")}
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.securePayments")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.escrowSystem")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.userVerification")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.ratingsReviews")}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span><strong>{t("documentationPage.secureMessaging")}</strong></span>
                    </li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("documentationPage.disputeResolution")}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {t("documentationPage.disputeResolutionDescription")}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    {getTranslationArray("documentationPage.disputeResolutionSteps").map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-300">{t("documentationPage.importantSecurityNotice")}</h3>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
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