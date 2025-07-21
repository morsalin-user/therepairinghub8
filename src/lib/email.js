// Generate a random 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send email function using EmailJS Server-Side API
export async function sendEmail(to, subject, body) {
  try {
    console.log("📧 EmailJS Config Check:", {
      serviceId: process.env.EMAILJS_SERVICE_ID ? "✓ Set" : "✗ Missing",
      templateId: process.env.EMAILJS_TEMPLATE_ID ? "✓ Set" : "✗ Missing",
      publicKey: process.env.EMAILJS_PUBLIC_KEY ? "✓ Set" : "✗ Missing",
      privateKey: process.env.EMAILJS_PRIVATE_KEY ? "✓ Set" : "✗ Missing",
    })

    // Check if EmailJS is configured
    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_TEMPLATE_ID ||
      !process.env.EMAILJS_PUBLIC_KEY ||
      !process.env.EMAILJS_PRIVATE_KEY
    ) {
      console.log("❌ EmailJS not configured. Falling back to console logging.")
      console.log(`Would send to ${to}:`)
      console.log(`Subject: ${subject}`)
      console.log(`Body: ${body}`)

      // Extract and display OTP for development
      const otpMatch = body.match(/code is: (\d+)/)
      if (otpMatch && otpMatch[1]) {
        console.log("\n🔑 =============== OTP CODE ===============")
        console.log(`🔑 EMAIL: ${to}`)
        console.log(`🔑 OTP CODE: ${otpMatch[1]}`)
        console.log("🔑 ========================================\n")
      }

      return true // Return true for development
    }

    console.log("🚀 Attempting to send email via EmailJS Server-Side API...")

    // Extract OTP from body for highlighting
    let highlightedBody = body
    const otpMatch = body.match(/code is: (\d+)/)
    if (otpMatch && otpMatch[1]) {
      const otp = otpMatch[1]
      // Create a more readable format for the email
      highlightedBody = body.replace(
        /code is: (\d+)/,
        `code is:

**${otp}**

Please enter this code to verify your email.`,
      )
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
      to_email: to,
      to_name: to.split("@")[0], // Use email prefix as name
      from_name: "RepairingHub",
      subject: subject,
      message: highlightedBody,
      reply_to: "noreply@repairinghub.com",
    }

    console.log("📬 Sending email to:", to)
    console.log("📧 Template params prepared")

    // Send email via EmailJS Server-Side API
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: templateParams,
      }),
    })

    console.log("📬 EmailJS API Response Status:", response.status)

    if (response.ok) {
      const result = await response.text()
      console.log("✅ Email sent successfully via EmailJS!")
      console.log("📧 Response:", result)
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ EmailJS API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })

      // Log detailed error for debugging
      console.log("🔍 Request Details:")
      console.log("URL:", "https://api.emailjs.com/api/v1.0/email/send-form")
      console.log("Service ID:", process.env.EMAILJS_SERVICE_ID)
      console.log("Template ID:", process.env.EMAILJS_TEMPLATE_ID)
      console.log("Public Key:", process.env.EMAILJS_PUBLIC_KEY ? "***PROVIDED***" : "MISSING")
      console.log("Private Key:", process.env.EMAILJS_PRIVATE_KEY ? "***PROVIDED***" : "MISSING")

      throw new Error(`EmailJS API error: ${response.status} - ${errorText}`)
    }
  } catch (error) {
    console.error("💥 Failed to send email via EmailJS:", error.message)
    console.error("🔍 Error Details:", error)

    // For development, log the email content even if sending fails
    console.log("📝 Email Content (Fallback):")
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${body}`)

    // Extract and display OTP for development
    const otpMatch = body.match(/code is: (\d+)/)
    if (otpMatch && otpMatch[1]) {
      console.log("\n🔑 =============== OTP CODE ===============")
      console.log(`🔑 EMAIL: ${to}`)
      console.log(`🔑 OTP CODE: ${otpMatch[1]}`)
      console.log("🔑 ========================================\n")
    }

    // In development, return true to continue the flow
    return process.env.NODE_ENV === "development"
  }
}

// Email templates optimized for EmailJS
export const emailTemplates = {
  verification: (otp) => ({
    subject: "Verify Your Email Address - RepairingHub",
    body: `Hi there!

Your email verification code is: ${otp}

This code will expire in 10 minutes. Please enter this code to verify your email address and complete your registration.

If you didn't request this verification, please ignore this email.

Best regards,
The RepairingHub Team

---
This is an automated message from RepairingHub. Please do not reply to this email.`,
  }),

  welcome: (name) => ({
    subject: "Welcome to RepairingHub!",
    body: `Hi ${name}!

Welcome to RepairingHub! We're excited to have you on board.

You can now:
• Post repair jobs and get quotes from skilled professionals
• Offer your services and earn money helping others
• Connect with a community of repair experts

Get started by exploring our platform and posting your first job or service.

Best regards,
The RepairingHub Team

---
This is an automated message from RepairingHub. Please do not reply to this email.`,
  }),

  passwordReset: (otp) => ({
    subject: "Reset Your Password - RepairingHub",
    body: `Hi there!

Your password reset verification code is: ${otp}

This code will expire in 10 minutes. Please enter this code to reset your password.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

For security reasons, please do not share this code with anyone.

Best regards,
The RepairingHub Team

---
This is an automated message from RepairingHub. Please do not reply to this email.`,
  }),
}
