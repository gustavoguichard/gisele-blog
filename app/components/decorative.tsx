export function GoldBar() {
  return <div className="gold-gradient-bar" />;
}

export function GoldDivider() {
  return <div className="gold-divider my-7" />;
}

export function OrnamentalCircles() {
  return (
    <>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-70 h-70 rounded-full border border-primary/8 pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-50 h-50 rounded-full border border-primary/5 pointer-events-none" />
    </>
  );
}

const headingSizes = {
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl",
};

export function PageHeader({
  title,
  subtitle,
  label,
  as: Heading = "h1",
}: {
  title: string;
  subtitle?: string;
  label?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="text-center mb-10">
      {label && <p className="section-label mb-3">✦ {label} ✦</p>}
      <Heading className={`${headingSizes[Heading]} font-bold tracking-tight text-primary`}>
        {title}
      </Heading>
      <GoldDivider />
      {subtitle && <p className="text-text-muted italic">{subtitle}</p>}
    </div>
  );
}
