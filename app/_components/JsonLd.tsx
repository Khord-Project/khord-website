// Renders JSON-LD structured data. The JSON is passed as a string child of
// <script>, which React emits without HTML-entity escaping (verified), keeping
// the JSON valid. We escape "<" to its unicode form defensively so embedded
// content can never close the script tag early.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(data).replace(/</g, "\\u003c")}
    </script>
  );
}
