export function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-widest text-mute">
        {label}
      </p>
      <div className="font-body leading-relaxed text-ink">{children}</div>
    </div>
  );
}
