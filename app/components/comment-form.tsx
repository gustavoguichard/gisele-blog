import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { buttonStyles } from "./button";

type ActionData = { ok: true } | { ok: false; fieldErrors: Record<string, string> };

const fieldLabels: Record<string, string> = {
  authorName: "Nome",
  authorEmail: "Email",
  content: "Comentário",
};

function translateError(field: string, message: string) {
  if (message.includes("invalid") || message.includes("Invalid"))
    return `${fieldLabels[field] ?? field} inválido`;
  if (message.includes("at least") || message.includes("too_small"))
    return `${fieldLabels[field] ?? field} é obrigatório`;
  return `${fieldLabels[field] ?? field}: ${message}`;
}

interface CommentFormProps {
  parentId?: string | null;
  onCancel?: () => void;
}

export function CommentForm({ parentId, onCancel }: CommentFormProps) {
  const fetcher = useFetcher<ActionData>();
  const [timestamp, setTimestamp] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state === "submitting";
  const succeeded = fetcher.data?.ok === true;
  const fieldErrors = fetcher.data?.ok === false ? fetcher.data.fieldErrors : {};

  useEffect(() => {
    setTimestamp(String(Date.now()));
  }, []);

  useEffect(() => {
    if (succeeded) {
      formRef.current?.reset();
      setTimestamp(String(Date.now()));
    }
  }, [succeeded]);

  return (
    <div>
      {succeeded && (
        <p className="mb-4 rounded border border-accent/30 bg-accent/5 px-4 py-3 text-sm font-sans text-text-body">
          Seu comentário foi enviado e será publicado após aprovação.
        </p>
      )}
      <fetcher.Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="_t" value={timestamp} />
        {parentId && <input type="hidden" name="parentId" value={parentId} />}

        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label
              htmlFor={`authorName-${parentId ?? "root"}`}
              className="mb-1 block text-sm font-sans font-semibold text-text"
            >
              Nome
            </label>
            <input
              id={`authorName-${parentId ?? "root"}`}
              name="authorName"
              type="text"
              required
              maxLength={100}
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm font-sans text-text focus:border-primary focus:outline-none"
            />
            {fieldErrors.authorName && (
              <p className="mt-1 text-xs font-sans text-red-600">
                {translateError("authorName", fieldErrors.authorName)}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label
              htmlFor={`authorEmail-${parentId ?? "root"}`}
              className="mb-1 block text-sm font-sans font-semibold text-text"
            >
              Email
            </label>
            <input
              id={`authorEmail-${parentId ?? "root"}`}
              name="authorEmail"
              type="email"
              required
              maxLength={254}
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm font-sans text-text focus:border-primary focus:outline-none"
            />
            {fieldErrors.authorEmail && (
              <p className="mt-1 text-xs font-sans text-red-600">
                {translateError("authorEmail", fieldErrors.authorEmail)}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor={`content-${parentId ?? "root"}`}
            className="mb-1 block text-sm font-sans font-semibold text-text"
          >
            Comentário
          </label>
          <textarea
            id={`content-${parentId ?? "root"}`}
            name="content"
            required
            maxLength={5000}
            rows={parentId ? 3 : 5}
            className="w-full rounded border border-border bg-bg px-3 py-2 text-sm font-sans text-text leading-relaxed focus:border-primary focus:outline-none"
          />
          {fieldErrors.content && (
            <p className="mt-1 text-xs font-sans text-red-600">
              {translateError("content", fieldErrors.content)}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Cancelar
            </button>
          )}
        </div>
      </fetcher.Form>
    </div>
  );
}
