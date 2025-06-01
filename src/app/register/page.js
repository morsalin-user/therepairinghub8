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
        title: "Loading...",
        description: "Please wait while we initialize the verification system.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Store registration data for later use
      setRegistrationData({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        userType: data.userType,
      })

      // Start Clerk sign up process for OTP verification
      // Try without CAPTCHA first
      try {
        await signUp.create({
          emailAddress: data.email,
          password: data.password,
          unsafeMetadata: {
            skipCaptcha: true,
          },
        })
      } catch (createError) {
        // If that fails, try with minimal data
        console.log("First attempt failed, trying minimal approach:", createError)
        await signUp.create({
          emailAddress: data.email,
          password: data.password,
        })
      }

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      // Show OTP modal
      setShowOTPModal(true)

      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
      })
    } catch (error) {
      console.error("Registration error:", error)

      let errorMessage = "Registration failed. Please try again."

      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0]
        console.log("Clerk error details:", clerkError)

        if (clerkError.code === "form_identifier_exists") {
          errorMessage = "An account with this email already exists."
        } else if (clerkError.code === "form_password_pwned") {
          errorMessage = "This password has been found in a data breach. Please choose a different password."
        } else if (clerkError.code === "form_password_length_too_short") {
          errorMessage = "Password must be at least 8 characters long."
        } else if (
          clerkError.code === "captcha_invalid" ||
          clerkError.code === "captcha_failed" ||
          clerkError.message?.includes("CAPTCHA")
        ) {
          // For CAPTCHA issues, let's try a different approach
          errorMessage = "Verification system temporarily unavailable. Please try again in a moment."

          // Try to reset and retry
          setTimeout(async () => {
            try {
              // Clear any existing signup state
              if (signUp) {
                // Try a simple create without any extra parameters
                await signUp.create({
                  emailAddress: data.email,
                  password: data.password,
                })

                await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
                setShowOTPModal(true)

                toast({
                  title: "Verification Code Sent",
                  description: "Please check your email for the verification code.",
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
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSuccess = async (clerkUser) => {
    try {
      // Create user in your backend with Clerk data
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
        // Set user state and token directly
        setUserDirectly(result.user, result.token)

        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        })

        router.push("/profile")
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Failed to complete registration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Backend registration error:", error)
      toast({
        title: "Registration Error",
        description: "Failed to complete registration. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Show loading state if Clerk is not loaded
  if (!isLoaded) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="(123) 456-7890" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">I want to</Label>
              <Select onValueChange={(value) => form.setValue("userType", value)}>
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buyer">Hire for Services</SelectItem>
                  <SelectItem value="Seller">Offer Services</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.userType && (
                <p className="text-sm text-red-500">{form.formState.errors.userType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                  Sending Verification Code...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="px-8 pb-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </Card>

      {/* OTP Verification Modal */}
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
