"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n"
import { jobAPI } from "@/lib/api"

// Form schema
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }).max(1000),
  price: z.coerce.number().min(5, { message: "Price must be at least $5" }).max(10000),
  location: z.string().min(3, { message: "Location must be at least 3 characters" }),
  date: z.date({ required_error: "Please select a date" }),
  category: z.string({ required_error: "Please select a category" }),
})

export default function PostJobPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      date: undefined,
      category: "",
    },
  })

  // Categories
  const categories = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Appliance Repair",
    "HVAC",
    "Painting",
    "Roofing",
    "Flooring",
    "Landscaping",
    "General Maintenance",
  ]

  // Handle form submission
  const onSubmit = async (data) => {
    if (!isAuthenticated || user?.userType !== "Buyer") {
      toast({
        title: t("postJobPage.accessDenied"),
        description: t("postJobPage.onlyBuyersCanPostJobs"),
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const result = await jobAPI.createJob(data)
      if (result.success) {
        toast({
          title: t("postJobPage.jobPosted"),
          description: t("messages.success.jobCreated"),
        })
        // Redirect to job page
        router.push(`/jobs/${result.job._id}`)
      } else {
        toast({
          title: t("postJobPage.jobPostFailed"),
          description: result.message || t("messages.error.generic"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Job creation error:", error)
      toast({
        title: t("common.error"),
        description: t("messages.error.generic"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user is authenticated and is a buyer
  if (isAuthenticated && user?.userType !== "Buyer") {
    return (
      <Card className="max-w-2xl mx-auto border border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-[#22304A]">{t("postJobPage.accessDenied")}</CardTitle>
          <CardDescription className="text-[#6B7280]">{t("postJobPage.onlyBuyersCanPostJobs")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#6B7280]">{t("postJobPage.permissionDenied")}</p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#10B981] hover:bg-[#0D9468] text-white"
          >
            {t("postJobPage.returnToHome")}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#22304A] mb-6">{t("postJobPage.title")}</h1>
      <Card className="border border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-[#22304A]">{t("postJobPage.jobDetails")}</CardTitle>
          <CardDescription className="text-[#6B7280]">{t("postJobPage.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#22304A]">{t("postJobPage.jobTitle")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("postJobPage.jobTitlePlaceholder")}
                        {...field}
                        className="border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]"
                      />
                    </FormControl>
                    <FormDescription className="text-[#6B7280]">
                      {t("postJobPage.jobTitleDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#22304A]">{t("postJobPage.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("postJobPage.descriptionPlaceholder")}
                        className="min-h-32 border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[#6B7280]">
                      {t("postJobPage.descriptionDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#22304A]">{t("postJobPage.budget")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          step="0.01"
                          placeholder={t("postJobPage.budgetPlaceholder")}
                          {...field}
                          className="border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]"
                        />
                      </FormControl>
                      <FormDescription className="text-[#6B7280]">
                        {t("postJobPage.budgetDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#22304A]">{t("postJobPage.location")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("postJobPage.locationPlaceholder")}
                          {...field}
                          className="border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]"
                        />
                      </FormControl>
                      <FormDescription className="text-[#6B7280]">
                        {t("postJobPage.locationDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[#22304A]">{t("postJobPage.preferredDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border-[#E5E7EB] hover:bg-[#F3F4F6]",
                                !field.value && "text-[#6B7280]",
                              )}
                            >
                              {field.value ? (
                                <span className="text-[#22304A]">{format(field.value, "PPP")}</span>
                              ) : (
                                <span className="text-[#6B7280]">{t("postJobPage.selectDate")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 text-[#6B7280]" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-[#6B7280]">
                        {t("postJobPage.preferredDateDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#22304A]">{t("postJobPage.category")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#E5E7EB] focus:ring-[#10B981]">
                            <SelectValue placeholder={t("postJobPage.selectCategory")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[#6B7280]">
                        {t("postJobPage.categoryDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-[#0D9468] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("postJobPage.postingJob")}
                  </>
                ) : (
                  t("postJobPage.postJob")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
