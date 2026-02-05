import wpPrisma from "@/lib/wpPrisma";
import { formatDateStable } from "@/lib/date";
import { notFound } from "next/navigation";
import { getSetting } from "@/lib/settings";
import type { Metadata } from "next";

type Params = { year: string; month: string; day: string; slug: string };

type StoryRow = {
  id: number;
  title: string;
  content: string;
  date: string;
  image: string | null;

  // Yoast SEO meta from WP meta
  yoastTitle: string | null;
  yoastDesc: string | null;
  yoastOgImage: string | null;
  yoastCanonical: string | null;
  yoastNoindex: string | null;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s: string, max = 160) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

function buildTitle(template: string, postTitle: string, siteName: string) {
  const tpl = template || "%title% | %site%";
  return tpl.replaceAll("%title%", postTitle).replaceAll("%site%", siteName);
}

async function getStoryBySlug(slug: string): Promise<StoryRow | null> {
  const p = process.env.wp_TABLE_PREFIX ?? "wp_";

  const rows = await wpPrisma.$queryRawUnsafe<StoryRow[]>(
    `
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_content as content,
      p.post_date as date,
      img.guid as image,

      mt.meta_value as yoastTitle,
      md.meta_value as yoastDesc,
      moi.meta_value as yoastOgImage,
      mc.meta_value as yoastCanonical,
      mn.meta_value as yoastNoindex
    FROM ${p}posts p

    LEFT JOIN ${p}postmeta pm
      ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN ${p}posts img
      ON img.ID = CAST(pm.meta_value AS UNSIGNED)

    LEFT JOIN ${p}postmeta mt
      ON mt.post_id = p.ID AND mt.meta_key = '_yoast_wpseo_title'
    LEFT JOIN ${p}postmeta md
      ON md.post_id = p.ID AND md.meta_key = '_yoast_wpseo_metadesc'
    LEFT JOIN ${p}postmeta moi
      ON moi.post_id = p.ID AND moi.meta_key = '_yoast_wpseo_opengraph-image'
    LEFT JOIN ${p}postmeta mc
      ON mc.post_id = p.ID AND mc.meta_key = '_yoast_wpseo_canonical'
    LEFT JOIN ${p}postmeta mn
      ON mn.post_id = p.ID AND mn.meta_key = '_yoast_wpseo_meta-robots-noindex'

    WHERE
      p.post_type = 'post'
      AND p.post_status = 'publish'
      AND p.post_name = ?
    LIMIT 1
  `,
    slug
  );

  return rows?.[0] ?? null;
}

/* ✅ Auto Schema.org JSON-LD */
function ArticleJsonLd(props: {
  title: string;
  description: string;
  image?: string;
  url: string;
  publishedAt: string;
  siteName: string;
  siteLogo?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: props.title,
    description: props.description,
    mainEntityOfPage: props.url,
    datePublished: props.publishedAt,
    dateModified: props.publishedAt,
    author: {
      "@type": "Organization",
      name: props.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: props.siteName,
    },
  };

  if (props.image) schema.image = [props.image];

  if (props.siteLogo) {
    schema.publisher.logo = {
      "@type": "ImageObject",
      url: props.siteLogo,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ✅ Next.js SEO output */
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug);
  if (!story) return {};

  // Global SEO settings
  const siteName = await getSetting("seo.site_name", "CXO Media");
  const defaultTitleTpl = await getSetting("seo.default_title", "%title% | %site%");
  const defaultDesc = await getSetting("seo.default_description", "");
  const defaultOg = await getSetting("seo.default_og_image", "");
  const robotsIndex = await getSetting("seo.robots_index", "1"); // "1" or "0"

  // URL base
  const baseUrl =
    (await getSetting("site.url", "")) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const yyyy = params.year;
  const mm = params.month;
  const dd = params.day;
  const fallbackCanonical = `${baseUrl}/${yyyy}/${mm}/${dd}/${params.slug}/`;

  const canonical = story.yoastCanonical?.trim() || fallbackCanonical;

  // Title
  const finalTitle = story.yoastTitle?.trim()
    ? story.yoastTitle
        .trim()
        .replaceAll("%%title%%", story.title)
        .replaceAll("%%sitename%%", siteName)
    : buildTitle(defaultTitleTpl, story.title, siteName);

  // Description
  const contentText = truncate(stripHtml(story.content), 160);
  const finalDesc = story.yoastDesc?.trim() || contentText || defaultDesc;

  // OG image
  const finalOgImage = story.yoastOgImage?.trim() || story.image || defaultOg || "";

  // noindex
  const yoastNoindex = (story.yoastNoindex || "").trim() === "1";
  const noindex = robotsIndex !== "1" || yoastNoindex;

  return {
    title: finalTitle,
    description: finalDesc,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },

    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: canonical,
      type: "article",
      images: finalOgImage ? [{ url: finalOgImage }] : [],
    },

    twitter: {
      card: finalOgImage ? "summary_large_image" : "summary",
      title: finalTitle,
      description: finalDesc,
      images: finalOgImage ? [finalOgImage] : [],
    },
  };
}

export default async function StoryPage({ params }: { params: Params }) {
  const story = await getStoryBySlug(params.slug);
  if (!story) notFound();

  // for schema
  const siteName = await getSetting("seo.site_name", "CXO Media");
  const baseUrl =
    (await getSetting("site.url", "")) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const canonical = `${baseUrl}/${params.year}/${params.month}/${params.day}/${params.slug}/`;

  const defaultDesc = await getSetting("seo.default_description", "");
  const finalDesc = truncate(stripHtml(story.content), 160) || defaultDesc;

  const siteLogo =
    (await getSetting("site.logo", "")) || ""; // optional setting if you want

  return (
    <article className="container mt-4">
      {/* ✅ Schema.org JSON-LD */}
      {ArticleJsonLd({
        title: story.title,
        description: finalDesc,
        image: story.image || undefined,
        url: canonical,
        publishedAt: story.date,
        siteName,
        siteLogo: siteLogo || undefined,
      })}

      <h1 className="fw-bold mb-2">{story.title}</h1>

      <div className="text-muted mb-3">📅 {formatDateStable(story.date)}</div>

      {story.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.image}
          alt={story.title}
          className="img-fluid mb-4 rounded"
        />
      ) : null}

      <div
        className="story-content"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />
    </article>
  );
}
