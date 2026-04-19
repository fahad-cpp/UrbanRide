const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const brand = `
  <div style="background:#1a1a2e;padding:24px;border-radius:10px 10px 0 0;text-align:center;">
    <h1 style="color:#e94560;margin:0;font-size:28px;">UrbanRide</h1>
    <p style="color:#a0a0b0;margin:6px 0 0;">Your City, Your Ride</p>
  </div>
`;
const footer = `
  <p style="text-align:center;color:#aaa;font-size:12px;margin-top:16px;">
    &copy; ${new Date().getFullYear()} UrbanRide. All rights reserved.
  </p>
`;
const wrap = (body) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
    ${brand}
    <div style="background:#fff;padding:32px;border-radius:0 0 10px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      ${body}
    </div>
    ${footer}
  </div>
`;

async function sendVerificationEmail(toEmail, displayName, verificationLink) {
  await transporter.sendMail({
    from: `"UrbanRide" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your UrbanRide account",
    html: wrap(`
      <h2 style="color:#1a1a2e;margin-top:0;">Hi ${displayName},</h2>
      <p style="color:#555;line-height:1.6;">
        Welcome to UrbanRide! Please verify your email address to activate your account and start booking vehicles.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verificationLink}"
           style="background:#e94560;color:#fff;padding:14px 32px;text-decoration:none;
                  border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color:#888;font-size:13px;">
        This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
      </p>
    `),
  });
}

async function sendWelcomeEmail(toEmail, displayName) {
  await transporter.sendMail({
    from: `"UrbanRide" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to UrbanRide! 🚗",
    html: wrap(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:52px;">🎉</span>
        <h2 style="color:#1a1a2e;margin:12px 0 0;">Welcome aboard, ${displayName}!</h2>
      </div>
      <p style="color:#555;line-height:1.6;">
        Your account is now verified and ready to go. Here's what you can do on UrbanRide:
      </p>
      <ul style="color:#555;line-height:2;padding-left:20px;">
        <li>🔍 Search vehicles by city, type, and price</li>
        <li>📅 Book a ride in seconds</li>
        <li>📋 Track all your bookings in one place</li>
        <li>✏️ Manage your profile anytime</li>
      </ul>
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="http://localhost:5173"
           style="background:#e94560;color:#fff;padding:13px 30px;text-decoration:none;
                  border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
          Start Exploring
        </a>
      </div>
    `),
  });
}

async function sendAccountDeletionEmail(toEmail, displayName) {
  await transporter.sendMail({
    from: `"UrbanRide" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your UrbanRide account has been deleted",
    html: wrap(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:48px;">👋</span>
        <h2 style="color:#1a1a2e;margin:12px 0 0;">Goodbye, ${displayName}</h2>
      </div>
      <p style="color:#555;line-height:1.6;">
        Your UrbanRide account and all associated data have been permanently deleted as requested.
      </p>
      <p style="color:#555;line-height:1.6;">
        This includes your profile, phone number, and all booking history. This action cannot be undone.
      </p>
      <p style="color:#888;font-size:13px;margin-top:24px;">
        If you did not request this deletion or believe this was a mistake, please contact our support team immediately.
      </p>
    `),
  });
}

async function sendBookingConfirmationEmail(toEmail, bookingDetails) {
  const {
    userName, bookingId, vehicleName, vehicleBrand,
    startDate, endDate, totalDays, totalPrice, pickupLocation,
  } = bookingDetails;

  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });

  const row = (label, value, highlight = false) => `
    <tr style="background:${highlight ? "#e94560" : "transparent"};">
      <td style="padding:12px 16px;color:${highlight ? "#fff" : "#888"};font-weight:bold;border-bottom:1px solid #eee;width:40%;">${label}</td>
      <td style="padding:12px 16px;color:${highlight ? "#fff" : "#1a1a2e"};border-bottom:1px solid #eee;">${value}</td>
    </tr>
  `;

  await transporter.sendMail({
    from: `"UrbanRide" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Booking Confirmed – ${bookingId}`,
    html: wrap(`
      <div style="text-align:center;margin-bottom:24px;">
        <h2 style="color:#1a1a2e;margin:8px 0 0;">Booking Confirmed!</h2>
      </div>
      <p style="color:#555;line-height:1.6;">Hi <strong>${userName}</strong>, your booking has been confirmed. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
        ${row("Booking ID", `<strong>${bookingId}</strong>`)}
        ${row("Vehicle", `${vehicleBrand} ${vehicleName}`)}
        ${row("Pick-up Date", fmt(startDate))}
        ${row("Return Date", fmt(endDate))}
        ${row("Duration", `${totalDays} day${totalDays !== 1 ? "s" : ""}`)}
        ${row("Pickup Location", pickupLocation || "TBD")}
        ${row("Total Paid", `₹${Number(totalPrice).toLocaleString("en-IN")}`, true)}
      </table>
      <p style="color:#888;font-size:13px;text-align:center;">Questions? Reply to this email or contact our support team.</p>
    `),
  });
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendAccountDeletionEmail,
  sendBookingConfirmationEmail,
};
