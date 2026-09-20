/** Builds a wa.me link. WHATSAPP_NUMBER is digits only with country code (e.g. 919999999999). */
export function whatsAppLink(message?: string): string | null {
  // Read server-side and baked into the rendered href - no client bundle
  // exposure needed, so this stays the spec's plain (non-NEXT_PUBLIC_) name.
  const number = process.env.WHATSAPP_NUMBER;
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
