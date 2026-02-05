"use client";

function strip(html: string) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function SeoScore(props: {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
  focusKeyword?: string;
}) {
  const keyword = (props.focusKeyword || "").trim().toLowerCase();
  const text = strip(props.contentHtml).toLowerCase();

  const titleFinal = (props.metaTitle || props.title || "").trim();
  const descFinal = (props.metaDescription || "").trim();

  let score = 0;
  const checks: { label: string; ok: boolean }[] = [];

  // title length
  const titleLenOk = titleFinal.length >= 30 && titleFinal.length <= 60;
  checks.push({ label: "Meta title length 30–60", ok: titleLenOk });
  if (titleLenOk) score += 20;

  // desc length
  const descLenOk = descFinal.length >= 70 && descFinal.length <= 160;
  checks.push({ label: "Meta description 70–160", ok: descLenOk });
  if (descLenOk) score += 20;

  // slug
  const slugOk = !!props.slug && props.slug.length >= 3 && !props.slug.includes(" ");
  checks.push({ label: "Clean URL slug", ok: slugOk });
  if (slugOk) score += 10;

  // content length
  const wordCount = strip(props.contentHtml).split(/\s+/).filter(Boolean).length;
  const contentOk = wordCount >= 300;
  checks.push({ label: "Content 300+ words", ok: contentOk });
  if (contentOk) score += 20;

  // keyword checks (optional)
  if (keyword) {
    const inTitle = titleFinal.toLowerCase().includes(keyword);
    const inDesc = descFinal.toLowerCase().includes(keyword);
    const inContent = text.includes(keyword);
    checks.push({ label: "Keyword in title", ok: inTitle });
    checks.push({ label: "Keyword in description", ok: inDesc });
    checks.push({ label: "Keyword in content", ok: inContent });
    score += (inTitle ? 10 : 0) + (inDesc ? 10 : 0) + (inContent ? 10 : 0);
  } else {
    checks.push({ label: "Focus keyword set (optional)", ok: false });
  }

  const color =
    score >= 70 ? "success" : score >= 45 ? "warning" : "danger";
  const label =
    score >= 70 ? "Good" : score >= 45 ? "OK" : "Needs work";

  return (
    <div className={`border rounded p-3 bg-${color} bg-opacity-10`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">SEO Score</div>
        <span className={`badge text-bg-${color}`}>{label} ({score}/100)</span>
      </div>

      <ul className="mb-0" style={{ fontSize: 13 }}>
        {checks.map((c, i) => (
          <li key={i} className={c.ok ? "text-success" : "text-danger"}>
            {c.ok ? "✓" : "✗"} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
