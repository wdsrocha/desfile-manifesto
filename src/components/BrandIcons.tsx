interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function InstagramIcon({
  size = 18,
  strokeWidth = 1.5,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({
  size = 18,
  strokeWidth = 1.5,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" />
      <path d="M9 11.5c.4 1.6 1.9 3.1 3.5 3.5l1.2-1.2 2 .8.5 2c-2.4.6-5-.1-6.8-1.9S7 9.5 7.5 7l2 .5.8 2z" />
    </svg>
  );
}
