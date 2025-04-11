import { render } from "@react-email/render";
import { Resend } from "resend";
import GbgVerifyEmail from ".";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${domain}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: await render(GbgVerifyEmail({verificationLink}))
  });
};
