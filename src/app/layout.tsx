import type { Metadata } from "next";
import { Cinzel, Mukta, Noto_Serif_Devanagari } from "next/font/google";
import { AstroClerkProvider as ClerkProvider } from "@/components/auth/ClerkAuthWrapper";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BrandedPreloader } from "@/components/layout/BrandedPreloader";
import { WelcomeConsultationModal } from "@/components/home/WelcomeConsultationModal";
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { LanguageProvider } from "@/context/LanguageContext";
import { getClerkPublishableKey } from "@/lib/auth/clerkConfig";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: "--font-noto-serif-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["500", "600", "700", "800"],
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://aapkaastro.com"),
  title: `Aapka Astro | ${PLACEHOLDER_ASTROLOGER.displayName} — Vedic Astrology & Vastu`,
  description:
    `Direct 1-on-1 consultations with ${PLACEHOLDER_ASTROLOGER.displayName}. Traditional Vedic sciences, Janam Kundli analysis, Devta & Energy Vastu audits, and certified natural gemstones.`,
  keywords: [
    "Vedic Astrology",
    "Aapka Astro",
    "Astrologer in India",
    "Janam Kundli",
    "Kundli Milan",
    "Vastu Shastra Consultant",
    "Certified Gemstones",
    PLACEHOLDER_ASTROLOGER.displayName,
    "Acharya Niraj Kumar Astrologer",
    "Devta Vastu",
    "Astrotalk alternative",
  ],
  openGraph: {
    title: `Aapka Astro | ${PLACEHOLDER_ASTROLOGER.displayName} — Vedic Astrology & Vastu`,
    description: `Direct 1-on-1 consultations with ${PLACEHOLDER_ASTROLOGER.displayName}. Traditional Vedic sciences, Janam Kundli analysis, Devta & Energy Vastu audits.`,
    url: "https://aapkaastro.com",
    siteName: "Aapka Astro",
    images: [
      {
        url: "https://aapkaastro.com/images/logo-white-bg.png",
        width: 1200,
        height: 630,
        alt: "Aapka Astro — align your destiny",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Aapka Astro | ${PLACEHOLDER_ASTROLOGER.displayName} — Vedic Astrology & Vastu`,
    description: `Direct 1-on-1 consultations with ${PLACEHOLDER_ASTROLOGER.displayName}. Traditional Vedic sciences, Janam Kundli analysis, Devta & Energy Vastu audits.`,
    images: ["https://aapkaastro.com/images/logo-white-bg.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "32x32" },
      { url: "/icon.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
};

const publishableKey = getClerkPublishableKey();
const isProduction = process.env.NODE_ENV === "production";
const isSatellite =
  publishableKey.startsWith("pk_live_") &&
  process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true";
const clerkDomain = isSatellite ? (process.env.NEXT_PUBLIC_CLERK_DOMAIN || undefined) : undefined;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      domain={clerkDomain}
      isSatellite={isSatellite}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/login"}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/signup"}
      signInForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || "/account"}
      signUpForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || "/account"}
      appearance={{
        variables: {
          colorPrimary: "#7B2D26",
          colorForeground: "#3B2A1E",
          colorBackground: "#FFFDF9",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "border border-[#E8D8C3] shadow-md bg-[#FFFDF9]",
          formButtonPrimary: "bg-[#7B2D26] hover:bg-[#64221C] text-[#FBF3E7] font-bold text-sm",
          headerTitle: "font-serif text-[#7B2D26]",
        },
      }}
    >
      <html
        lang="en"
        className={`${cinzel.variable} ${notoSerifDevanagari.variable} ${mukta.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#FBF3E7] text-[#3B2A1E] font-body selection:bg-[#E8A33D] selection:text-[#3B2A1E]">
          <LanguageProvider>
            <BrandedPreloader />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WelcomeConsultationModal />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
