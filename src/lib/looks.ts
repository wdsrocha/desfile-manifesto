const BLOB_BASE =
  "https://5zj0sqgcbxl9zp09.public.blob.vercel-storage.com";

export function lookImageUrl(id: string): string {
  return `${BLOB_BASE}/looks/look${id}.webp`;
}
