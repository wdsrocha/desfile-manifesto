interface LookImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function LookImage({
  src,
  alt,
  className = "",
  sizes,
  priority = false,
}: LookImageProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-ink/[0.06] via-ink/[0.04] to-ink/[0.10] overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
