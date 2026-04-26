interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow && <span className="editorial-eyebrow">{eyebrow}</span>}
      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-ink">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-ink/70 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
