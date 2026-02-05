export default function ArticleSchema({
  title,
  description,
  image,
  url,
  publishedAt,
  author = "CXO Media",
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  publishedAt: string;
  author?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    image: image ? [image] : undefined,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: author,
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
    mainEntityOfPage: url,
    description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
