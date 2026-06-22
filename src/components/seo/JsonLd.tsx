import { headers } from "next/headers";

// Serializes data for safe embedding inside a <script> tag. JSON.stringify
// alone does NOT escape `</script>`, `<!--`, or the U+2028 / U+2029 line
// separators, any of which can break out of the script element. Escaping the
// `<`, `>`, `&` and line-separator code points neutralizes that; the result
// is still valid JSON-LD.
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp("[\\u2028\\u2029]", "g"), (c) => "\\u" + c.charCodeAt(0).toString(16));
}

// Renders a JSON-LD <script> for structured data. Server component.
// The nonce (set per-request in middleware) is required: CSP applies to inline
// <script> of any type, so without it a strict policy blocks this element.
export default async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
