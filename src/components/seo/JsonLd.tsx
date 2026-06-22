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
// No nonce needed: type="application/ld+json" is a data block, not executable
// script, so CSP's script-src never applies to it. (Adding a nonce here also
// breaks hydration — the browser clears the nonce attribute after load, so the
// client value no longer matches the server-rendered one.)
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
