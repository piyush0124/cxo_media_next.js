"use client";

type Props = {
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  siteName?: string;
  ogImage?: string;
};

export default function SeoPreview({
  title,
  slug,
  metaTitle,
  metaDescription,
  siteName = "CXO Media",
  ogImage,
}: Props) {
  const finalTitle =
    metaTitle?.trim() || `${title} | ${siteName}`;

  const finalDesc =
    metaDescription?.trim() ||
    "This is how your page may appear in Google search results.";

  const url = `https://example.com/.../${slug || "your-slug"}`;

  return (
    <div className="border rounded p-3 bg-light">
      <div className="fw-semibold mb-2">🔍 Google Preview</div>

      <div style={{ fontFamily: "Arial", maxWidth: 600 }}>
        <div
          style={{
            color: "#1a0dab",
            fontSize: 18,
            lineHeight: "1.3",
          }}
        >
          {finalTitle}
        </div>
        <div style={{ color: "#006621", fontSize: 14 }}>
          {url}
        </div>
        <div style={{ color: "#545454", fontSize: 14 }}>
          {finalDesc}
        </div>
      </div>

      {ogImage ? (
        <>
          <hr />
          <div className="fw-semibold mb-1">📱 Social Preview</div>
          <img
            src={ogImage}
            alt=""
            style={{
              maxWidth: "100%",
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
          />
        </>
      ) : null}
    </div>
  );
}
