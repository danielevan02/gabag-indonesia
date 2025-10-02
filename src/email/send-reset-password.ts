import { render } from "@react-email/render";
import { Resend } from "resend";
import ResetPasswordEmail from "./reset-password-email";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.BASE_URL || "http://localhost:3000";

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Gabag Indonesia <no-reply@gabag-indonesia.com>",
    to: email,
    subject: "Reset Your Password",
    html: await render(ResetPasswordEmail({ resetLink }))
  });
};
