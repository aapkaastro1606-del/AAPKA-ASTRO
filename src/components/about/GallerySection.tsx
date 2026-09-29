"use client";

import React, { useState } from "react";
import { OFFICIAL_GALLERY_IMAGES } from "@/config/placeholderContent";
import { Award, Eye, X, ZoomIn } from "lucide-react";

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeImage, setActiveImage] = useState<typeof OFFICIAL_GALLERY_IMAGES[0] | null>(null);

  const categories = ["All", "Credentials", "Heritage", "Awards", "Achievements"];

  const filteredImages = OFFICIAL_GALLERY_IMAGES.filter((img) => {
    if (selectedCategory === "All") return true;
    return img.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#E8D8C3] bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D8C3] bg-[#FBF3E7] px-3.5 py-1 text-xs font-bold text-[#7B2D26] mb-3">
            <Award className="h-4 w-4 text-[#E8A33D]" />
            <span>AUTHENTIC CREDENTIALS &amp; RECOGNITION</span>
          </div>
          <h2 className="font-temple text-3xl sm:text-4xl font-bold text-[#7B2D26] tracking-tight">
            Official Certificates &amp; Lineage Gallery
          </h2>
          <p className="mt-3 text-[#6E5545] text-sm sm:text-base font-body">
            Formal Jyotish Acharya title, Vastu certifications, and recognition certificates earned by Niraj Kumar.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                    : "border border-[#E8D8C3] bg-[#FBF3E7] text-[#3B2A1E] hover:bg-[#E8D8C3]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(img)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-[#E8D8C3] bg-[#FBF3E7] shadow-sm transition-all hover:border-[#C1662F] hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#3B2A1E]/5">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A1E]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <ZoomIn className="h-4 w-4 text-[#E8A33D]" />
                    <span>Click to Enlarge</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="rounded-md bg-[#7B2D26]/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                    {img.category}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#FFFDF9]">
                <h4 className="font-temple text-sm font-bold text-[#7B2D26]">{img.alt}</h4>
                <p className="text-xs text-[#6E5545] mt-1 line-clamp-2">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox / Modal */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveImage(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl bg-[#FFFDF9] p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-[#7B2D26] p-2 text-white shadow hover:bg-[#96372E] transition-colors"
                aria-label="Close Preview"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center">
                <div className="relative max-h-[70vh] w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/5">
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                </div>
                <div className="mt-4 text-center px-4">
                  <div className="inline-block rounded-md bg-[#E8A33D]/20 px-2.5 py-0.5 text-xs font-bold text-[#7B2D26] mb-1">
                    {activeImage.category}
                  </div>
                  <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                    {activeImage.alt}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E5545] mt-1 max-w-xl mx-auto">
                    {activeImage.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
