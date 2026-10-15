// PLACEHOLDER: replace with real content
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Vedic Astrology" | "Planetary Transits" | "Vastu Shastra" | "Gemology" | "Remedies";
  author: string;
  authorAvatar: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  status: "published" | "scheduled" | "draft";
  views: number;
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "shani-sade-sati-complete-vedic-guide-remedies",
    title: "Understanding Shani Sade Sati: Phases, Myths & Time-Tested Vedic Remedies",
    excerpt:
      "Shani Sade Sati is often feared, yet Saturn is the cosmic justice giver (Karmaphala Daata). Discover how each 2.5-year phase works and exact Vedic remedies to turn obstacles into spiritual growth.",
    category: "Vedic Astrology",
    author: PLACEHOLDER_ASTROLOGER.displayName,
    authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-09-18",
    readTime: "7 min read",
    tags: ["Shani", "Sade Sati", "Karma", "Remedies", "Saturn"],
    status: "published",
    views: 1420,
    content: `
### What is Shani Sade Sati?
In Vedic astrology, Shani Sade Sati refers to the seven-and-a-half-year transit of Saturn (Shani Dev) across the 12th, 1st, and 2nd houses from your natal Moon sign (Janma Rashi). Since Saturn spends approximately 2.5 years in each zodiac sign, the complete journey across three contiguous signs spans 7.5 years.

Saturn represents discipline, perseverance, truth, and spiritual maturity. Rather than a period of arbitrary hardship, Sade Sati is a period of cosmic purification and karmic re-alignment.

---

### The Three Crucial Phases of Sade Sati

#### 1. The Rising Phase (Aadhya Dasha - 12th House from Moon)
The first phase initiates when Saturn transits the 12th house relative to your natal Moon. This phase impacts mental tranquility, expenses, sleep quality, and foreign travel. It frequently pulls an individual away from superficial pursuits, prompting introspection and solitude.

#### 2. The Peak Phase (Madhya Dasha - Transit over Natal Moon)
The second phase is commonly recognized as the most intense. When Saturn transits directly over your Janma Rashi, it directly tests your emotional resilience, health, professional reputation, and closest partnerships. Here, old illusions are dissolved, paving the way for grounded leadership.

#### 3. The Setting Phase (Antya Dasha - 2nd House from Moon)
The concluding phase transits the 2nd house of family wealth, speech, and accumulated assets. It teaches prudent financial stewardship and mindful communication before Saturn finally departs into the 3rd house.

---

### Classical Vedic Remedies
1. **Shani Shanti Japa**: Chant the sacred *Shani Beej Mantra*:  
   \`ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः\` (Om Praam Preem Proum Sah Shanaishcharaya Namah) 108 times on Saturdays during sunset facing West.
2. **Hanuman Chalisa**: Recite the Sri Hanuman Chalisa daily with a pure heart. Lord Hanuman offers infallible protection from planetary afflictions.
3. **Seva and Compassion**: Serve disabled individuals, elderly citizens, and laborers. Feed black dogs or birds with mustard oil rotis.
4. **Authentic Gemstone Guidance**: Never wear Blue Sapphire (Neelam) without precise Lagna and Shadbala verification by an experienced Vedic astrologer.
    `,
  },
  {
    id: "blog-2",
    slug: "vastu-guidelines-north-facing-house-prosperity",
    title: "Vastu Shastra for North-Facing Homes: Unlocking Kuber's Wealth Energy",
    excerpt:
      "The North direction is governed by Lord Kuber and Mercury. Learn how main entrances, water elements, and zero-demolition adjustments can magnetize financial abundance and household peace.",
    category: "Vastu Shastra",
    author: PLACEHOLDER_ASTROLOGER.displayName,
    authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-09-12",
    readTime: "5 min read",
    tags: ["Vastu", "Kuber", "Home Energy", "Wealth", "Architecture"],
    status: "published",
    views: 980,
    content: `
### The Significance of the North (Uttara Disha)
According to the foundational texts of Vastu Vidya, the Northern direction is overseen by Lord Kuber, the divine treasurer of the universe, and governed by Mercury (Budha), the planet of intelligence, commerce, and communication.

A North-facing property carries immense potential for financial accumulation, intellectual sharpness, and business growth when built in harmony with cosmic directional vectors.

---

### Key Vastu Principles for North Properties
- **Main Entrance Location**: The most auspicious Pada for the main door is Pada 3 (Mukhya) or Pada 4 (Bhallat). This invites continuous wealth and societal respect.
- **Water Elements in Northeast (Ishanya)**: The northeast quadrant must remain light, clean, and elevated with fresh water bodies or a sacred puja room.
- **Avoid Heavy Weights in North**: Avoid locating master bedrooms, overhead water tanks, or heavy machinery in the North and Northeast sectors.
- **Zero-Demolition Rectifications**: If architectural defects exist, use energized copper helixes, brass strips, and consecrated mirrors to balance the Pranic grid.
    `,
  },
  {
    id: "blog-3",
    slug: "yellow-sapphire-pukhraj-jupiter-benefits-wearing-rules",
    title: "Yellow Sapphire (Pukhraj): Benefits, Activation & Astrological Wearing Rules",
    excerpt:
      "Ruled by Devaguru Brihaspati, Yellow Sapphire bestows supreme intellect, matrimonial happiness, and divine blessings. Understand how to verify natural untreated gemstones and perform Prana Pratishtha.",
    category: "Gemology",
    author: PLACEHOLDER_ASTROLOGER.displayName,
    authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-09-05",
    readTime: "6 min read",
    tags: ["Gemstones", "Yellow Sapphire", "Pukhraj", "Jupiter", "Brihaspati"],
    status: "published",
    views: 1140,
    content: `
### Devaguru Jupiter and the Power of Pukhraj
Yellow Sapphire, revered as *Pushparaga* or *Pukhraj* in Sanskrit, is the primary gemstone associated with Jupiter (Guru), the greatest benefic planet in Vedic Jyotish. Guru governs wisdom, spiritual growth, financial prosperity, children, and righteous knowledge.

---

### Who Should Wear Yellow Sapphire?
Yellow Sapphire is uniquely auspicious for:
- Sagittarius (Dhanu) and Pisces (Meena) Lagna natives, where Jupiter acts as the functional ruler.
- Aries (Mesha), Cancer (Karka), and Scorpio (Vrischika) ascendants, subject to house placement.
- Individuals seeking academic excellence, judicial advancement, or clearing marital delays.

### Vedic Consecration Ritual (Prana Pratishtha)
To ensure the gemstone radiates its highest vibrational frequency, it must be cleansed with raw milk, Ganga jal, and sacred honey on a Shukla Paksha Thursday morning during Pushya or Punarvasu Nakshatra.
    `,
  },
  {
    id: "blog-4",
    slug: "daily-panchang-understanding-five-limbs-vedic-time",
    title: "The Five Limbs of Time: How Daily Panchang Guides Everyday Decisions",
    excerpt:
      "Tithi, Nakshatra, Yoga, Karana, and Vaar together constitute the Panchang. Learn how aligning your daily meetings, travels, and auspicious beginnings with cosmic rhythms ensures effortless success.",
    category: "Remedies",
    author: PLACEHOLDER_ASTROLOGER.displayName,
    authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-08-28",
    readTime: "4 min read",
    tags: ["Panchang", "Muhurat", "Tithi", "Nakshatra", "Vedic Wisdom"],
    status: "published",
    views: 860,
    content: `
### Why Panchang Matters in Modern Life
The word *Panchanga* derives from *Pancha* (five) and *Anga* (limbs). It is the sacred Vedic calendar that decodes the multi-dimensional vibrational state of the cosmos at any given moment.

By synchronizing vital endeavors with favorable cosmic energy currents, you remove friction and naturally amplify auspicious results.
    `,
  },
];

let memoryBlogPosts = [...INITIAL_BLOG_POSTS];

export const BlogStore = {
  getPublishedPosts: (): BlogPost[] => {
    return memoryBlogPosts.filter((p) => p.status === "published");
  },

  getAllPosts: (): BlogPost[] => {
    return memoryBlogPosts;
  },

  getPostBySlug: (slug: string): BlogPost | undefined => {
    return memoryBlogPosts.find((p) => p.slug === slug);
  },

  async getPublishedPostsAsync(): Promise<BlogPost[]> {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.blogPost) {
        const count = await prisma.blogPost.count();
        if (count === 0) {
          // Seed initial posts
          for (const p of INITIAL_BLOG_POSTS) {
            await prisma.blogPost.create({
              data: {
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                category: p.category,
                tags: p.tags,
                publishedAt: new Date(p.publishedAt),
                status: p.status === "published" ? "PUBLISHED" : "DRAFT",
                views: p.views,
                coverImage: p.coverImage,
              },
            });
          }
        }

        const dbPosts = await prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
        });

        if (dbPosts.length > 0) {
          return dbPosts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt || "",
            content: p.content,
            category: p.category as any,
            author: PLACEHOLDER_ASTROLOGER.displayName,
            authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
            coverImage: p.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
            publishedAt: p.publishedAt ? p.publishedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            readTime: "5 min read",
            tags: p.tags,
            status: "published",
            views: p.views,
          }));
        }
      }
    } catch (e) {
      console.warn("BlogStore.getPublishedPostsAsync fallback to memory:", e);
    }
    return this.getPublishedPosts();
  },

  async getAllPostsAsync(): Promise<BlogPost[]> {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.blogPost) {
        const dbPosts = await prisma.blogPost.findMany({
          orderBy: { createdAt: "desc" },
        });

        if (dbPosts.length > 0) {
          return dbPosts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt || "",
            content: p.content,
            category: p.category as any,
            author: PLACEHOLDER_ASTROLOGER.displayName,
            authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
            coverImage: p.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
            publishedAt: p.publishedAt ? p.publishedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            readTime: "5 min read",
            tags: p.tags,
            status: p.status === "PUBLISHED" ? "published" : "draft",
            views: p.views,
          }));
        }
      }
    } catch (e) {
      console.warn("BlogStore.getAllPostsAsync fallback to memory:", e);
    }
    return this.getAllPosts();
  },

  async getPostBySlugAsync(slug: string): Promise<BlogPost | undefined> {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.blogPost) {
        const p = await prisma.blogPost.findUnique({
          where: { slug },
        });

        if (p) {
          return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt || "",
            content: p.content,
            category: p.category as any,
            author: PLACEHOLDER_ASTROLOGER.displayName,
            authorAvatar: PLACEHOLDER_ASTROLOGER.avatarUrl,
            coverImage: p.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
            publishedAt: p.publishedAt ? p.publishedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            readTime: "5 min read",
            tags: p.tags,
            status: p.status === "PUBLISHED" ? "published" : "draft",
            views: p.views,
          };
        }
      }
    } catch (e) {
      console.warn("BlogStore.getPostBySlugAsync fallback to memory:", e);
    }
    return this.getPostBySlug(slug);
  },

  savePost: (post: Omit<BlogPost, "id" | "views"> & { id?: string }): BlogPost => {
    if (post.id) {
      const index = memoryBlogPosts.findIndex((p) => p.id === post.id);
      if (index !== -1) {
        memoryBlogPosts[index] = {
          ...memoryBlogPosts[index],
          ...post,
        };
        return memoryBlogPosts[index];
      }
    }
    const newPost: BlogPost = {
      ...post,
      id: `blog-${Date.now()}`,
      views: 0,
    };
    memoryBlogPosts.unshift(newPost);
    return newPost;
  },

  async savePostAsync(post: Omit<BlogPost, "id" | "views"> & { id?: string }): Promise<BlogPost> {
    const memorySaved = this.savePost(post);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.blogPost) {
        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          create: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
            status: post.status === "published" ? "PUBLISHED" : "DRAFT",
            coverImage: post.coverImage,
            views: 0,
          },
          update: {
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
            status: post.status === "published" ? "PUBLISHED" : "DRAFT",
            coverImage: post.coverImage,
          },
        });
      }
    } catch (e) {
      console.error("BlogStore.savePostAsync error:", e);
    }
    return memorySaved;
  },

  deletePost: (id: string): boolean => {
    const prevLen = memoryBlogPosts.length;
    memoryBlogPosts = memoryBlogPosts.filter((p) => p.id !== id);
    return memoryBlogPosts.length < prevLen;
  },

  async deletePostAsync(id: string): Promise<boolean> {
    this.deletePost(id);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.blogPost) {
        await prisma.blogPost.deleteMany({
          where: {
            OR: [{ id }, { slug: id }],
          },
        });
        return true;
      }
    } catch (e) {
      console.error("BlogStore.deletePostAsync error:", e);
    }
    return true;
  },
};
