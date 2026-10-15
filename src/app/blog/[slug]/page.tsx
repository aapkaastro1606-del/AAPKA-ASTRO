import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogStore } from "@/lib/store/blogStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Tag,
  PhoneCall,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BlogStore.getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Aapka Astro",
      description: "The requested Vedic astrology article could not be found.",
    };
  }

  return {
    title: `${post.title} | Aapka Astro`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = (await BlogStore.getPostBySlugAsync(slug)) || BlogStore.getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedPosts = await BlogStore.getPublishedPostsAsync();
  const relatedPosts = publishedPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Aapka Astro",
      logo: {
        "@type": "ImageObject",
        url: "https://aapkaastro.com/images/logo.png",
      },
    },
    keywords: post.tags.join(", "),
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* Schema.org Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 text-[#FBF3E7]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8A33D] hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-3.5 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <span>{post.category}</span>
          </div>

          <h1 className="font-temple text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FBF3E7] leading-tight">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#FBF3E7]/80">
            <div className="flex items-center gap-2">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="h-8 w-8 rounded-full border border-[#E8A33D] object-cover"
              />
              <span className="font-semibold text-[#FBF3E7]">{post.author}</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#E8A33D]" />
              {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#E8A33D]" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Article Body */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Featured Image */}
          <div className="overflow-hidden rounded-3xl border border-[#E8D8C3] shadow-md mb-10 bg-[#3B2A1E]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>

          {/* Excerpt Lead */}
          <div className="rounded-2xl border-l-4 border-[#C1662F] bg-[#FFFDF9] p-6 text-sm sm:text-base italic text-[#6E5545] mb-10 shadow-sm leading-relaxed">
            &ldquo;{post.excerpt}&rdquo;
          </div>

          {/* Main Content Article Body */}
          <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 sm:p-12 shadow-sm">
            <div className="prose max-w-none text-[#3B2A1E] font-body text-sm sm:text-base leading-relaxed space-y-6">
              {post.content.split("\n\n").map((para, i) => {
                const trimmed = para.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="font-temple text-xl sm:text-2xl font-bold text-[#7B2D26] pt-4 border-t border-[#E8D8C3]"
                    >
                      {trimmed.replace("### ", "")}
                    </h3>
                  );
                }

                if (trimmed.startsWith("#### ")) {
                  return (
                    <h4
                      key={i}
                      className="font-temple text-lg font-bold text-[#C1662F] pt-2"
                    >
                      {trimmed.replace("#### ", "")}
                    </h4>
                  );
                }

                if (trimmed.startsWith("- ")) {
                  const items = trimmed.split("\n- ");
                  return (
                    <ul key={i} className="list-disc list-inside space-y-2 text-[#3B2A1E]/90 pl-2">
                      {items.map((item, idx) => (
                        <li key={idx}>{item.replace(/^- /, "")}</li>
                      ))}
                    </ul>
                  );
                }

                if (trimmed.startsWith("1. ")) {
                  const items = trimmed.split("\n");
                  return (
                    <ol key={i} className="list-decimal list-inside space-y-2 text-[#3B2A1E]/90 pl-2">
                      {items.map((item, idx) => (
                        <li key={idx}>{item.replace(/^\d+\.\s*/, "")}</li>
                      ))}
                    </ol>
                  );
                }

                return (
                  <p key={i} className="text-[#3B2A1E]/90 leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-[#E8D8C3] flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#6E5545] flex items-center gap-1 mr-2">
                <Tag className="h-3.5 w-3.5 text-[#C1662F]" />
                Tags:
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-[#FBF3E7] px-3 py-1 text-xs font-semibold text-[#7B2D26] border border-[#E8D8C3]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Card & CTA */}
          <div className="mt-10 rounded-3xl border border-[#E8A33D]/40 bg-[#FFFDF9] p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="h-20 w-20 rounded-full object-cover border-2 border-[#7B2D26] shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C1662F]">
                Written By
              </span>
              <h4 className="font-temple text-xl font-bold text-[#7B2D26]">
                {post.author}
              </h4>
              <p className="mt-1 text-xs text-[#6E5545] leading-relaxed">
                {PLACEHOLDER_ASTROLOGER.tagline}. Consult directly to analyze how current planetary transits affect your individual Janam Kundli.
              </p>
            </div>
            <Link
              href="/consult"
              className="shrink-0 rounded-xl bg-[#7B2D26] px-5 py-3 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4 text-[#E8A33D]" />
              <span>Discuss with Acharya Ji</span>
            </Link>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="font-temple text-2xl font-bold text-[#7B2D26] mb-6">
                Related Vedic Guidance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="group rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] p-5 shadow-sm hover:border-[#C1662F] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                        {rel.category}
                      </span>
                      <h4 className="font-temple text-base font-bold text-[#7B2D26] group-hover:text-[#C1662F] transition-colors mt-1">
                        {rel.title}
                      </h4>
                      <p className="mt-2 text-xs text-[#6E5545] line-clamp-2">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-bold text-[#C1662F] flex items-center gap-1">
                      <span>Read More &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
