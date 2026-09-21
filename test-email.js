require("dotenv").config({ path: ".env.local" });

const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

console.log("\n🔍 Email Diagnostics");
console.log("=====================");
console.log(`✓ RESEND_API_KEY set: ${!!apiKey}`);
console.log(`✓ NEXT_PUBLIC_APP_URL: ${appUrl || "NOT SET (defaults to https://sonoprep.com)"}`);

if (!apiKey) {
  console.error("\n❌ RESEND_API_KEY is missing in .env.local");
  process.exit(1);
}

const resend = new Resend(apiKey);

// Test with Resend's test domain first (always works)
console.log("\n📧 Test 1: Using Resend test domain (onboarding@resend.dev)");
console.log("This will always work if API key is valid.\n");

resend.emails
  .send({
    from: "onboarding@resend.dev",
    to: "uptolope@proton.me",
    subject: "Test Email from SonoPrep",
    html: `
      <h2>Test Email</h2>
      <p>This is a test from your SonoPrep auth setup.</p>
      <p>If you received this, Resend is working correctly.</p>
      <p>App URL: ${appUrl}</p>
    `,
  })
  .then((res) => {
    console.log("✅ Test 1 SUCCESS - Email sent via Resend test domain");
    console.log(`   Response ID: ${res.id}`);
    
    // Now test with production domain (will fail if not verified)
    console.log("\n📧 Test 2: Using production domain (noreply@mail.sonoprep.com)");
    console.log("This will fail if domain is not verified in Resend dashboard.\n");
    
    return resend.emails.send({
      from: "noreply@mail.sonoprep.com",
      to: "uptolope@proton.me",
      subject: "Test Email from SonoPrep Production",
      html: `
        <h2>Production Domain Test</h2>
        <p>This email uses the production domain noreply@mail.sonoprep.com</p>
      `,
    });
  })
  .then((res) => {
    console.log("✅ Test 2 SUCCESS - Production domain is verified!");
    console.log(`   Response ID: ${res.id}`);
    console.log("\n🎉 Your Resend setup is complete and ready for production.");
  })
  .catch((err) => {
    console.error("❌ Email test failed:", err.message);
    
    if (err.message.includes("domain")) {
      console.log("\n💡 Domain not verified in Resend dashboard yet.");
      console.log("   1. Go to https://resend.com/dashboard");
      console.log("   2. Add domain: noreply@mail.sonoprep.com");
      console.log("   3. Verify DNS records");
      console.log("   4. Run this test again");
    } else if (err.message.includes("invalid")) {
      console.log("\n💡 Check your RESEND_API_KEY in .env.local");
    }
  });
