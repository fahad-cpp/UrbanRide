// Email Service for sending booking confirmations
// In a real app, this would integrate with a service like SendGrid, AWS SES, or Mailgun

export interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  vehicleName: string
  bookingId: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropoffLocation: string
  totalDays: number
  totalPrice: number
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  try {
    // In a real application, this would call an API endpoint to send emails
    // For demo purposes, we'll store the email record in localStorage
    
    const emailRecord = {
      id: Date.now().toString(),
      type: 'booking_confirmation',
      recipientEmail: data.customerEmail,
      subject: `Booking Confirmation #${data.bookingId}`,
      sentAt: new Date().toISOString(),
      data,
    }

    // Store email record in localStorage
    const emailHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]')
    emailHistory.push(emailRecord)
    localStorage.setItem('emailHistory', JSON.stringify(emailHistory))

    // Log for demo purposes
    console.log('Email confirmation sent:', emailRecord)

    return {
      success: true,
      message: `Confirmation email sent to ${data.customerEmail}`,
      emailId: emailRecord.id,
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      message: 'Failed to send confirmation email',
      error,
    }
  }
}

export async function sendCancellationEmail(
  customerName: string,
  customerEmail: string,
  bookingId: string,
  vehicleName: string,
  refundAmount: number
) {
  try {
    const emailRecord = {
      id: Date.now().toString(),
      type: 'cancellation_confirmation',
      recipientEmail: customerEmail,
      subject: `Booking Cancellation Confirmation #${bookingId}`,
      sentAt: new Date().toISOString(),
      data: {
        customerName,
        customerEmail,
        bookingId,
        vehicleName,
        refundAmount,
      },
    }

    const emailHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]')
    emailHistory.push(emailRecord)
    localStorage.setItem('emailHistory', JSON.stringify(emailHistory))

    console.log('Cancellation email sent:', emailRecord)

    return {
      success: true,
      message: `Cancellation email sent to ${customerEmail}`,
      emailId: emailRecord.id,
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      message: 'Failed to send cancellation email',
      error,
    }
  }
}

export async function sendWelcomeEmail(
  customerName: string,
  customerEmail: string,
  userId: string
) {
  try {
    const emailRecord = {
      id: Date.now().toString(),
      type: 'welcome',
      recipientEmail: customerEmail,
      subject: 'Welcome to UrbanRide',
      sentAt: new Date().toISOString(),
      data: {
        customerName,
        customerEmail,
        userId,
      },
    }

    const emailHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]')
    emailHistory.push(emailRecord)
    localStorage.setItem('emailHistory', JSON.stringify(emailHistory))

    console.log('Welcome email sent:', emailRecord)

    return {
      success: true,
      message: `Welcome email sent to ${customerEmail}`,
      emailId: emailRecord.id,
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      message: 'Failed to send welcome email',
      error,
    }
  }
}

export function getEmailHistory() {
  try {
    return JSON.parse(localStorage.getItem('emailHistory') || '[]')
  } catch {
    return []
  }
}

export function generateBookingConfirmationHTML(data: BookingConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 4px; }
          .label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .value { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; }
          .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Confirmation #${data.bookingId}</p>
          </div>
          <div class="content">
            <div class="section">
              <p>Hello ${data.customerName},</p>
              <p>Your car rental booking has been confirmed! Here are your booking details:</p>
            </div>

            <div class="section">
              <h3>Vehicle Details</h3>
              <div class="label">Vehicle</div>
              <div class="value">${data.vehicleName}</div>
            </div>

            <div class="section">
              <h3>Booking Dates</h3>
              <div class="label">Pick-up Date</div>
              <div class="value">${new Date(data.startDate).toLocaleDateString()}</div>
              <div class="label">Drop-off Date</div>
              <div class="value">${new Date(data.endDate).toLocaleDateString()}</div>
              <div class="label">Duration</div>
              <div class="value">${data.totalDays} day(s)</div>
            </div>

            <div class="section">
              <h3>Location</h3>
              <div class="label">Pick-up Location</div>
              <div class="value">${data.pickupLocation}</div>
              <div class="label">Drop-off Location</div>
              <div class="value">${data.dropoffLocation}</div>
            </div>

            <div class="section">
              <h3>Total Cost</h3>
              <div class="value" style="color: #2563eb; font-size: 24px;">$${data.totalPrice}</div>
            </div>

            <div class="section">
              <p>Please save your booking confirmation number: <strong>${data.bookingId}</strong></p>
              <p>You can manage your booking by logging into your account on UrbanRide.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>

            <div class="footer">
              <p>&copy; 2024 UrbanRide. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
