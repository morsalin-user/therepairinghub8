"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n"
import OTPVerificationModal from "@/components/otp-verification-modal"

// Form validation schema
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
    userType: z.string().min(1, { message: "Please select a user type" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function Register() {
  const router = useRouter()
  const { toast } = useToast()
  const { login, updateUserData, setUserDirectly } = useAuth()
  const { signUp, isLoaded } = useSignUp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [registrationData, setRegistrationData] = useState(null)
  const { t } = useTranslation()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      userType: "",
    },
  })

  const onSubmit = async (data) => {
    if (!isLoaded || !signUp) {
      toast({
        title: t("auth.register.loading"),
        description: t("auth.register.pleaseWait"),
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      setRegistrationData({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        userType: data.userType,
      })
      try {
        await signUp.create({
          emailAddress: data.email,
          password: data.password,
          unsafeMetadata: {
            skipCaptcha: true,
          },
        })
      } catch (createError) {
        console.log("First attempt failed, trying minimal approach:", createError)
        await signUp.create({
          emailAddress: data.email,
          password: data.password,
        })
      }
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setShowOTPModal(true)
      toast({
        title: t("auth.register.verificationCodeSent"),
        description: t("auth.register.checkEmail"),
      })
    } catch (error) {
      console.error("Registration error:", error)
      let errorMessage = t("auth.register.registrationFailed")
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        console.log("Clerk error details:", clerkError)
        if (clerkError.code === "form_identifier_exists") {
          errorMessage = t("auth.register.emailExists")
        } else if (clerkError.code === "form_password_pwned") {
          errorMessage = t("auth.register.passwordBreached")
        } else if (clerkError.code === "form_password_length_too_short") {
          errorMessage = t("auth.register.passwordTooShort")
        } else if (
          clerkError.code === "captcha_invalid" ||
          clerkError.code === "captcha_failed" ||
          clerkError.message?.includes("CAPTCHA")
        ) {
          errorMessage = t("auth.register.verificationUnavailable")
          setTimeout(async () => {
            try {
              if (signUp) {
                await signUp.create({
                  emailAddress: data.email,
                  password: data.password,
                })
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
                setShowOTPModal(true)
                toast({
                  title: t("auth.register.verificationCodeSent"),
                  description: t("auth.register.checkEmail"),
                })
              }
            } catch (retryError) {
              console.error("Retry failed:", retryError)
            }
          }, 2000)
        } else {
          errorMessage = clerkError.longMessage || clerkError.message || errorMessage
        }
      }
      toast({
        title: t("auth.register.registrationError"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSuccess = async (clerkUser) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...registrationData,
          clerkId: clerkUser.id,
          emailVerified: true,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setUserDirectly(result.user, result.token)
        toast({
          title: t("auth.register.registrationSuccessful"),
          description: t("auth.register.accountCreated"),
        })
        router.push("/profile")
      } else {
        toast({
          title: t("auth.register.registrationFailed"),
          description: result.message || t("auth.register.failedToCompleteRegistration"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Backend registration error:", error)
      toast({
        title: t("auth.register.registrationError"),
        description: t("auth.register.failedToCompleteRegistration"),
        variant: "destructive",
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>{t("common.loading")}</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.subtitle")}</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.register.name")}</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.register.email")}</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("auth.register.phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">{t("auth.register.userType")}</Label>
              <Select onValueChange={(value) => form.setValue("userType", value)}>
                <SelectTrigger id="userType">
                  <SelectValue } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buyer">{t("auth.register.buyer")}</SelectItem>
                  <SelectItem value="Seller">{t("auth.register.seller")}</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.userType && (
                <p className="text-sm text-red-500">{form.formState.errors.userType.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.register.password")}</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
              <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.register.sendingVerificationCode")}
                </>
              ) : (
                t("auth.register.registerButton")
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="px-8 pb-6 text-center text-sm">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="underline">
            {t("auth.register.signIn")}
          </Link>
        </div>
      </Card>
      {showOTPModal && registrationData && (
        <OTPVerificationModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          email={registrationData.email}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  )
}
