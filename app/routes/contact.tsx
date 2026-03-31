import { data, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import { applySchema } from "composable-functions";
import { Resend } from "resend";
import { z } from "zod";
import type { Route } from "./+types/contact";
import { Container } from "~/components/container";
import { GoldDivider, OrnamentalCircles } from "~/components/decorative";
import { env } from "~/env.server";
import { generateMeta, contactPageJsonLd } from "~/lib/seo";

export const MIN_SUBMIT_TIME_MS = 3000;

export const contactSchema = z.object({
  name: z.string().min(1, "Por favor, informe seu nome."),
  email: z.string().email("Por favor, informe um email válido."),
  message: z.string().min(10, "A mensagem precisa ter pelo menos 10 caracteres."),
  _gotcha: z.string().max(0),
  _timestamp: z.coerce.number(),
});

const sendContactEmail = applySchema(contactSchema)(async ({
  name,
  email,
  message,
  _timestamp,
}) => {
  if (Date.now() - _timestamp < MIN_SUBMIT_TIME_MS) {
    throw new Error("spam");
  }

  const resend = new Resend(env().RESEND_API_KEY);
  await resend.emails.send({
    from: "Contato Blog <noreply@giseledemenezes.com>",
    to: env().CONTACT_EMAIL,
    replyTo: email,
    subject: `Mensagem de ${name} via blog`,
    text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
  });
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const result = await sendContactEmail({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    _gotcha: String(formData.get("_gotcha") ?? ""),
    _timestamp: Number(formData.get("_timestamp") ?? 0),
  });

  if (!result.success) {
    const fieldErrors = result.errors
      .filter((e) => "path" in e)
      .map((e) => ({ path: (e as { path: string[] }).path, message: e.message }));
    return data({ success: false, errors: fieldErrors }, { status: 400 });
  }

  return data({ success: true, errors: [] });
}

export function meta() {
  return [
    ...generateMeta({
      title: "Contato",
      description: "Entre em contato com Gisele de Menezes.",
      url: "/contato",
    }),
    contactPageJsonLd(),
  ];
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

const inputStyles =
  "w-full rounded border border-border bg-bg px-4 py-2.5 text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export default function Contact() {
  const fetcher = useFetcher<typeof action>();
  const [timestamp, setTimestamp] = useState("");
  const isSubmitting = fetcher.state !== "idle";
  const result = fetcher.data;

  useEffect(() => {
    setTimestamp(String(Date.now()));
  }, []);

  return (
    <div>
      <section className="relative py-14 overflow-hidden bg-bg-warm border-b border-border">
        <OrnamentalCircles />
        <div className="relative text-center px-4">
          <p className="section-label mb-3">✦ Uma porta aberta ✦</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Vamos Conversar?
          </h1>
          <GoldDivider />
          <p className="text-text-muted max-w-lg mx-auto leading-relaxed italic">
            Sua mensagem será lida por mim, pessoalmente. Seja para uma dúvida, um relato, ou apenas
            para dizer oi — será um prazer te escutar.
          </p>
        </div>
      </section>

      <Container size="lg" className="-mt-2 pb-16">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="rounded-xl border border-border bg-bg-card p-8 sm:p-10 shadow-md">
              {result?.success ? (
                <div className="text-center py-8">
                  <p className="text-lg font-bold text-primary mb-2">Sua mensagem chegou ✦</p>
                  <p className="text-text-muted italic">
                    Gratidão pelo contato. Responderei em breve.
                  </p>
                </div>
              ) : (
                <fetcher.Form method="post" className="space-y-5">
                  <input type="hidden" name="_timestamp" value={timestamp} />
                  <div className="hidden" aria-hidden="true">
                    <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-sans font-medium text-text-body mb-1.5"
                    >
                      Como posso te chamar?
                    </label>
                    <input id="name" type="text" name="name" required className={inputStyles} />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-sans font-medium text-text-body mb-1.5"
                    >
                      Seu email para que eu possa responder
                    </label>
                    <input id="email" type="email" name="email" required className={inputStyles} />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-sans font-medium text-text-body mb-1.5"
                    >
                      O que está no seu coração?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      minLength={10}
                      className={`${inputStyles} min-h-32 resize-y`}
                      rows={5}
                    />
                  </div>
                  {result?.errors && result.errors.length > 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {result.errors[0].message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white dark:text-bg border border-primary hover:bg-primary-dark hover:border-primary-dark transition-colors font-sans disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </fetcher.Form>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-bg-warm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-primary mb-4">Outros Caminhos</h2>
              <div className="space-y-5 text-text-body">
                <div>
                  <p className="text-sm font-sans font-medium mb-1">Email</p>
                  <a href="mailto:gi@giseledemenezes.com" className="text-primary hover:underline">
                    gi@giseledemenezes.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-sans font-medium mb-1">Instagram</p>
                  <a
                    href="https://www.instagram.com/gigiseledemenezes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @gigiseledemenezes
                  </a>
                </div>
                <GoldDivider />
                <p className="text-sm text-text-muted italic leading-relaxed">
                  Costumo responder em alguns dias. Se for urgente, o email é o caminho mais rápido.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-accent/20 bg-bg p-6 text-center">
              <blockquote className="text-sm italic text-text-muted/80 border-l-2 border-accent/40 pl-4 text-left max-w-xs mx-auto">
                &ldquo;O encontro inicia quando nos abrimos para a escuta, seja em forma de palavras
                escritas, faladas ou gestos.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
