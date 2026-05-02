import Image from "next/image";
import { urlForImage } from "@/sanity/image";

type LookImageSource = {
  asset?: { _ref?: string; _type?: string } | unknown;
  alt?: string | null;
} | null;

interface LookImageProps {
  image: LookImageSource;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain";
}

export function LookImage({
  image,
  alt,
  className = "",
  sizes,
  priority = false,
  objectFit = "cover",
}: LookImageProps) {
  const hasImage = image && (image as { asset?: unknown }).asset;
  const imageUrl = hasImage
    ? urlForImage(image as Parameters<typeof urlForImage>[0])
        .width(1200)
        .quality(75)
        .url()
    : null;

  const bgClass =
    objectFit === "contain"
      ? "bg-ink"
      : "bg-gradient-to-br from-ink/[0.06] via-ink/[0.04] to-ink/[0.10]";

  return (
    <div className={`relative overflow-hidden ${bgClass} ${className}`}>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={(image as { alt?: string })?.alt || alt}
          fill
          sizes={sizes}
          priority={priority}
          className={objectFit === "contain" ? "object-contain" : "object-cover"}
        />
      )}
    </div>
  );
}
