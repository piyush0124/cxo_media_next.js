export default function HowToSchema(props: {
  name: string;
  description?: string;
  steps: { name: string; text: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: props.name,
    description: props.description || "",
    step: (props.steps || []).map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
