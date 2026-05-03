import Image from "next/image";
import { urlForImage, IMAGE_QUALITY } from "@/sanity/image";

type LookImageSource = {
  asset?: { _ref?: string; _type?: string } | unknown;
  alt?: string | null;
} | null;

const COVER_CROP_WIDTH = 900;

interface LookImageProps {
  image: LookImageSource;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain";
  aspectRatio?: [number, number];
  blurDataURL?: string;
}

export function LookImage({
  image,
  alt,
  className = "",
  sizes,
  priority = false,
  objectFit = "cover",
  aspectRatio,
  blurDataURL,
}: LookImageProps) {
  const hasImage = image && (image as { asset?: unknown }).asset;
  const imageUrl = hasImage
    ? aspectRatio
      ? urlForImage(image as Parameters<typeof urlForImage>[0])
          .width(COVER_CROP_WIDTH)
          .height(Math.round(COVER_CROP_WIDTH * aspectRatio[1] / aspectRatio[0]))
          .fit("crop")
          .quality(IMAGE_QUALITY)
          .url()
      : urlForImage(image as Parameters<typeof urlForImage>[0])
          .width(1200)
          .quality(IMAGE_QUALITY)
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
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          className={objectFit === "contain" ? "object-contain" : "object-cover"}
        />
      )}
    </div>
  );
}
