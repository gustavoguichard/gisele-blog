import { Resend } from "resend";
import { env } from "~/env.server";

interface EmailOptions {
  replyTo: string;
  subject: string;
  text: string;
}

async function sendEmail({ replyTo, subject, text }: EmailOptions) {
  const resend = new Resend(env().RESEND_API_KEY);
  await resend.emails.send({
    from: "Contato Blog <noreply@giseledemenezes.com>",
    to: env().CONTACT_EMAIL,
    replyTo,
    subject,
    text,
  });
}

export { sendEmail };
