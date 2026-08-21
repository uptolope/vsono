require("dotenv").config({ path: ".env.local" });

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

resend.emails
  .send({
    from: "onboarding@resend.dev",
    to: "uptolope@proton.me",
    subject: "Test Email",
    html: "<p>This is a test</p>",
  })
  .then((res) => {
    console.log("✅ Email sent successfully:", res);
  })
  .catch((err) => {
    console.log("❌ Email failed:", err);
  });
