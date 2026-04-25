import { Instagram, MessageCircle } from "lucide-react";
import { instagramUrl } from "@/lib/instagram";

interface SocialLinksProps {
  instagram: string;
  whatsappUrl: string;
  nome: string;
  size?: "sm" | "md";
}

export function SocialLinks({
  instagram,
  whatsappUrl,
  nome,
  size = "md",
}: SocialLinksProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? 14 : 15;
  return (
    <div className="flex items-center gap-2">
      <a
        href={instagramUrl(instagram)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram de ${nome}`}
        className={`${dim} inline-flex items-center justify-center rounded-full border border-ink/15 hover:border-ink hover:bg-ink hover:text-cream transition-colors`}
      >
        <Instagram size={icon} strokeWidth={1.5} />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp de ${nome}`}
        className={`${dim} inline-flex items-center justify-center rounded-full border border-ink/15 hover:border-ink hover:bg-ink hover:text-cream transition-colors`}
      >
        <MessageCircle size={icon} strokeWidth={1.5} />
      </a>
    </div>
  );
}
