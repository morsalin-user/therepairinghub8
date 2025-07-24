"use client"

// Yes code has been uploaded!

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Users, Shield, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"
import JobCard from "@/components/job-card"

export default function HomePage() {
  const { t } = useTranslation()
  const [recentJobs, setRecentJobs] = useState([])

  useEffect(() => {
    // Load sample jobs from translations
    const sampleJobs = t("jobs.sampleJobs")
    if (Array.isArray(sampleJobs)) {
      setRecentJobs(
        sampleJobs.map((job, index) => ({
          id: index + 1,
          ...job,
        })),
      )
    }
  }, [t])

  const howItWorksSteps = [
    {
      icon: <CheckCircle className="h-8 w-8 text-accent-green" />,
      title: t("howItWorks.postJob.title"),
      description: t("howItWorks.postJob.description"),
    },
    {
      icon: <Users className="h-8 w-8 text-accent-green" />,
      title: t("howItWorks.connect.title"),
      description: t("howItWorks.connect.description"),
    },
    {
      icon: <Shield className="h-8 w-8 text-accent-green" />,
      title: t("howItWorks.securePayment.title"),
      description: t("howItWorks.securePayment.description"),
    },
  ]

  const testimonials = t("testimonials.items")

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-blue via-navy-blue to-light-blue text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{t("hero.title")}</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="bg-accent-green hover:bg-accent-green/90 text-white font-semibold px-8 py-3"
                >
                  {t("hero.browseJobs")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?type=seller">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-navy-blue font-semibold px-8 py-3 bg-transparent"
                >
                  {t("hero.joinAsProvider")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-blue mb-4">{t("howItWorks.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-navy-blue mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-blue">{t("jobs.recentJobs")}</h2>
            <Link href="/jobs">
              <Button
                variant="outline"
                className="border-accent-green text-accent-green hover:bg-accent-green hover:text-white bg-transparent"
              >
                {t("jobs.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-blue mb-4">{t("testimonials.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(testimonials) &&
              testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <p className="font-semibold text-navy-blue">{testimonial.author}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy-blue to-light-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-accent-green hover:bg-accent-green/90 text-white font-semibold px-8 py-3">
                {t("cta.createAccount")}
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-navy-blue font-semibold px-8 py-3 bg-transparent"
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
