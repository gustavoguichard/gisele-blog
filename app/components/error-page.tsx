import { Link } from "react-router";
import { buttonStyles } from "./button";

export function ErrorPage({
  title,
  message,
  linkHref,
  linkText,
}: {
  title: string;
  message: string;
  linkHref: string;
  linkText: string;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">{title}</h1>
      <p className="text-text-muted mb-6">{message}</p>
      <Link to={linkHref} className={buttonStyles({ className: "inline-block font-sans" })}>
        {linkText}
      </Link>
    </div>
  );
}
