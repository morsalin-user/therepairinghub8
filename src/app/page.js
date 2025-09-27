"use client"
// Updated with consistent color palette and removed Recent Jobs and Testimonials sections
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Users, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"

export default function HomePage() {
  const { t } = useTranslation()

  const howItWorksSteps = [
    {
      icon: <CheckCircle className="h-8 w-8" style={{ color: "#10B981" }} />,
      title: t("howItWorks.postJob.title"),
      description: t("howItWorks.postJob.description"),
    },
    {
      icon: <Users className="h-8 w-8" style={{ color: "#10B981" }} />,
      title: t("howItWorks.connect.title"),
      description: t("howItWorks.connect.description"),
    },
    {
      icon: <Shield className="h-8 w-8" style={{ color: "#10B981" }} />,
      title: t("howItWorks.securePayment.title"),
      description: t("howItWorks.securePayment.description"),
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="text-white py-20"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 70%, #60A5FA 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{t("hero.title")}</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button
                  size="lg"
                  style={{ backgroundColor: "#10B981" }}
                  className="hover:opacity-90 text-white font-semibold px-8 py-3"
                >
                  {t("hero.browseJobs")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?type=seller">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white font-semibold px-8 py-3 bg-transparent transition-colors"
                  style={{
                    "--tw-text-opacity": "1",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#38BDF8"
                    e.currentTarget.style.borderColor = "#38BDF8"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderColor = "white"
                  }}
                >
                  {t("hero.joinAsProvider")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20" style={{ backgroundColor: "#F3F4F6" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E3A8A" }}>
              {t("howItWorks.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: "#1E3A8A" }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: "#22304A" }}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 text-white"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 70%, #60A5FA 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                style={{ backgroundColor: "#10B981" }}
                className="hover:opacity-90 text-white font-semibold px-8 py-3"
              >
                {t("cta.createAccount")}
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white font-semibold px-8 py-3 bg-transparent transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#38BDF8"
                  e.currentTarget.style.borderColor = "#38BDF8"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.borderColor = "white"
                }}
              >
                {t("cta.learnMore")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
