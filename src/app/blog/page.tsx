"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogStore, BlogPost } from "@/lib/store/blogStore";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function BlogPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>(() => BlogStore.getPublishedPosts());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  React.useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.posts?.length > 0) {
          setAllPosts(data.posts);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    "All",
    "Vedic Astrology",
    "Planetary Transits",
    "Vastu Shastra",
    "Gemology",
    "Remedies",
  ];

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>VEDIC ASTROLOGY JOURNAL</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Vedic Wisdom &amp; Astrological Insights
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            Deep-dive treatises on planetary transits, Janam Kundli secrets, Vastu energy alignment, and classical remedies by {PLACEHOLDER_ASTROLOGER.displayName}.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search by topic, planetary transit, or remedy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] py-3.5 pl-12 pr-4 text-sm text-[#3B2A1E] placeholder-[#A8988B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] shadow-inner"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C1662F]" />
          </div>
        </div>
      </section>

      {/* 2. Content Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                    : "bg-[#FFFDF9] text-[#3B2A1E] border border-[#E8D8C3] hover:bg-[#FBF3E7]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-12 text-center">
              <BookOpen className="h-12 w-12 text-[#C1662F] mx-auto mb-3" />
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">No Articles Found</h3>
              <p className="text-xs text-[#6E5545] mt-1">
                Try adjusting your search keywords or selecting another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] shadow-sm hover:shadow-md transition-all hover:border-[#C1662F]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#3B2A1E]">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 rounded-md bg-[#7B2D26]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-[#FBF3E7]">
                      {post.category}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-[#6E5545] mb-2.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#C1662F]" />
                          {post.readTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#6E5545]" />
                          {post.publishedAt}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="font-temple text-lg font-bold text-[#7B2D26] group-hover:text-[#C1662F] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="mt-2.5 text-xs text-[#3B2A1E]/80 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-[#FBF3E7] px-2 py-0.5 text-[10px] font-medium text-[#7B2D26] border border-[#E8D8C3]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8D8C3] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorAvatar}
                          alt={post.author}
                          className="h-7 w-7 rounded-full object-cover border border-[#E8D8C3]"
                        />
                        <span className="text-xs font-semibold text-[#3B2A1E]">
                          {post.author}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#C1662F] group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <MandalaDivider opacity={0.3} />
          </div>
        </div>
      </section>
    </div>
  );
}
