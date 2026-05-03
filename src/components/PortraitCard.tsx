import Image from "next/image";
import { urlForImage, IMAGE_QUALITY } from "@/sanity/image";
import { instagramUrl } from "@/lib/instagram";
import { InstagramIcon } from "./BrandIcons";

type PersonImage = {
  asset?: { _ref?: string; _type?: string } | unknown;
  alt?: string;
} | null;

interface PortraitCardProps {
  name: string;
  instagram?: string | null;
  image?: PersonImage;
  priority?: boolean;
}

export function PortraitCard({
  name,
  instagram,
  image,
  priority = false,
}: PortraitCardProps) {
  const hasImage = image && (image as { asset?: unknown }).asset;
  const imageUrl = hasImage
    ? urlForImage(image as Parameters<typeof urlForImage>[0])
        .width(600)
        .height(800)
        .quality(IMAGE_QUALITY)
        .url()
    : null;

  const content = (
    <>
      <div className="relative aspect-[3/4] bg-gradient-to-br from-ink/[0.06] to-ink/[0.14] overflow-hidden">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={(image as { alt?: string })?.alt || name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
        {instagram && (
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between bg-gradient-to-t from-ink/60 via-ink/10 to-transparent text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[11px] uppercase tracking-editorial">
              {instagram}
            </span>
            <InstagramIcon size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-0.5">
        <p className="font-serif text-base sm:text-lg leading-tight text-ink truncate">
          {name}
        </p>
        {instagram && (
          <p className="text-[11px] text-ink/50 truncate">{instagram}</p>
        )}
      </div>
    </>
  );

  if (!instagram) {
    return <div className="block">{content}</div>;
  }

  return (
    <a
      href={instagramUrl(instagram)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
    >
      {content}
    </a>
  );
}
