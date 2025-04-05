import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

type EmailTemplate = "verification-approved" | "verification-rejected" | "verification-pending"

interface SendEmailProps {
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, any>
}

export async function sendEmail({ to, subject, template, data }: SendEmailProps) {
  try {
    // Get the appropriate email template
    const htmlContent = getEmailTemplate(template, data)

    // Send email using Resend
    const { data: response, error } = await resend.emails.send({
      from: `Wholesetail <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html: htmlContent,
    })

    if (error) {
      console.error("Email sending error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return response
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send email")
  }
}

function getEmailTemplate(template: EmailTemplate, data: Record<string, any>): string {
  switch (template) {
    case "verification-approved":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4CAF50; text-align: center;">Verification Approved</h1>
          <p>Hello ${data.name},</p>
          <p>We're pleased to inform you that your account has been verified and approved. You can now log in to your account and start using our services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a>
          </div>
          <p>Thank you for choosing Wholesetail.</p>
          <p>Best regards,<br>The Wholesetail Team</p>
        </div>
      `
    case "verification-rejected":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #F44336; text-align: center;">Verification Rejected</h1>
          <p>Hello ${data.name},</p>
          <p>We regret to inform you that your account verification has been rejected. This could be due to one of the following reasons:</p>
          <ul>
            <li>Incomplete or incorrect documentation</li>
            <li>Unclear images of your documents</li>
            <li>Information mismatch between your application and documents</li>
          </ul>
          <p>You can reapply with the correct information and clear document images.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Wholesetail Team</p>
        </div>
      `
    case "verification-pending":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #FFC107; text-align: center;">Verification Pending</h1>
          <p>Hello ${data.name},</p>
          <p>Thank you for registering with Wholesetail. Your account is currently pending verification.</p>
          <p>Our team will review your application and documents within 1-2 business days.</p>
          <p>You will receive an email notification once your account has been verified.</p>
          <p>Best regards,<br>The Wholesetail Team</p>
        </div>
      `
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="text-align: center;">Wholesetail Notification</h1>
          <p>Hello ${data.name},</p>
          <p>Thank you for using Wholesetail.</p>
          <p>Best regards,<br>The Wholesetail Team</p>
        </div>
      `
  }
}

