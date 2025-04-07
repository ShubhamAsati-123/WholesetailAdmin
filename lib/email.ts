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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin-bottom: 5px;">Account Verification Approved</h1>
            <div style="height: 3px; background-color: #4CAF50; width: 100px; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">Dear ${data.name},</p>
          
          <p style="font-size: 16px; line-height: 1.5;">We are pleased to inform you that your account verification for Wholesetail has been <strong>successfully approved</strong>.</p>
          
          <p style="font-size: 16px; line-height: 1.5;">You now have full access to all features and services offered by our platform. You can log in to your account using the email and password you provided during registration.</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">
              <strong>Next Steps:</strong>
            </p>
            <ul style="margin-top: 10px; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Log in to your account</li>
              <li style="margin-bottom: 8px;">Complete your profile information</li>
              <li style="margin-bottom: 8px;">Explore our platform features</li>
              <li style="margin-bottom: 0;">Start using our services</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Log In To Your Account</a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p style="font-size: 16px; line-height: 1.5;">Thank you for choosing Wholesetail. We look forward to serving you.</p>
          
          <p style="font-size: 16px; line-height: 1.5;">
            Sincerely,<br>
            The Wholesetail Team
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center; color: #777777; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Wholesetail. All rights reserved.</p>
          </div>
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
          ${
            data.notes
              ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold;">Reviewer Notes:</p>
            <p style="margin: 10px 0 0 0;">${data.notes}</p>
          </div>
          `
              : ""
          }
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

