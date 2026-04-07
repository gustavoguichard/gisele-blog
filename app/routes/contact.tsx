import { data, useFetcher } from "react-router";
import { inputFromForm } from "composable-functions";
import type { Route } from "./+types/contact";
import { Container } from "~/components/container";
import { GoldDivider, OrnamentalCircles } from "~/components/decorative";
import { Turnstile } from "~/components/turnstile";
import { generateMeta, contactPageJsonLd } from "~/lib/seo";
import { getClientIp, getTurnstileSiteKey, submitContactForm } from "~/business/contact.server";

export function loader() {
  return { turnstileSiteKey: getTurnstileSiteKey() };
}

export async function action({ request }: Route.ActionArgs) {
  const formInput = await inputFromForm(request);
  const result = await submitContactForm(formInput, { ip: getClientIp(request) });

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

export default function Contact({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const result = fetcher.data;

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
                  {loaderData.turnstileSiteKey && (
                    <Turnstile siteKey={loaderData.turnstileSiteKey} />
                  )}
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
