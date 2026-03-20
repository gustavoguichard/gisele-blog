import { Link, type LinkProps } from "react-router";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

const base = "rounded font-semibold transition-colors";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white dark:text-bg border border-primary hover:bg-primary-dark hover:border-primary-dark",
  secondary: "border border-border-dark text-primary hover:border-primary",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
};

export function buttonStyles({
  variant = "primary",
  size = "lg",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

export function ButtonLink({
  variant = "primary",
  size = "lg",
  className,
  ...props
}: LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />;
}
