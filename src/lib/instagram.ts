export function instagramUrl(handle: string): string {
  const clean = handle.replace(/^@+/, "").trim();
  return `https://instagram.com/${clean}`;
}
