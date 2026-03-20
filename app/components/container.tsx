type ContainerSize = "sm" | "md" | "lg" | "xl";

const maxWidths: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export function Container({
  size = "md",
  className,
  children,
  as: Tag = "div",
}: {
  size?: ContainerSize;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag className={[maxWidths[size], "mx-auto px-4 sm:px-6", className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
