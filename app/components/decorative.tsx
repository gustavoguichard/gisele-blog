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

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">{title}</h1>
      {subtitle && (
        <>
          <GoldDivider />
          <p className="text-text-muted italic">{subtitle}</p>
        </>
      )}
      {!subtitle && <GoldDivider />}
    </div>
  );
}
