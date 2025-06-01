// Simple email utility functions

// Generate a random 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
  
  // Mock email sending function
  // In production, use a real email service like SendGrid, Mailgun, etc.
  export async function sendEmail(to, subject, body) {
    // For demo purposes, we'll just log the email
    console.log(`Sending email to ${to}:`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${body}`)
  
    // In a real app, you would use an email service:
    // Example with SendGrid:
    // const msg = {
    //   to,
    //   from: 'your-verified-sender@example.com',
    //   subject,
    //   text: body,
    // }
    // await sgMail.send(msg)
  
    // Simulate successful email sending
    return true
  }
  
  // Email templates
  export const emailTemplates = {
    verification: (otp) => ({
      subject: "Verify Your Email Address",
      body: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    }),
    welcome: (name) => ({
      subject: "Welcome to RepairingHub!",
      body: `Hi ${name},\n\nWelcome to RepairingHub! We're excited to have you on board.\n\nBest regards,\nThe RepairingHub Team`,
    }),
    passwordReset: (otp) => ({
      subject: "Reset Your Password",
      body: `Your password reset code is: ${otp}. This code will expire in 10 minutes.`,
    }),
  }
  