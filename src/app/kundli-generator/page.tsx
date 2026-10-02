"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KundliForm } from "@/components/kundli/KundliForm";
import { NorthIndianChart } from "@/components/kundli/NorthIndianChart";
import { SouthIndianChart } from "@/components/kundli/SouthIndianChart";
import { PlanetaryTable } from "@/components/kundli/PlanetaryTable";
import { DashaTimeline } from "@/components/kundli/DashaTimeline";
import { DoshaAnalysis } from "@/components/kundli/DoshaAnalysis";
import { AshtakvargaTable } from "@/components/kundli/AshtakvargaTable";
import { ShadbalaTable } from "@/components/kundli/ShadbalaTable";
import { KPTable } from "@/components/kundli/KPTable";
import { KundliPrintDossier } from "@/components/kundli/KundliPrintDossier";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { DivisionalChartCode, KundliData } from "@/lib/astrology/types";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Sparkles,
  PhoneCall,
  Download,
  BookmarkPlus,
  CheckCircle2,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  TrendingUp,
  Compass,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import { PLACEHOLDER_ASTROLOGER, KUNDLI_PDF_PRODUCT } from "@/config/placeholderContent";

// Razorpay SDK Script Loader
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function KundliGeneratorPage() {
  const [kundli, setKundli] = useState<KundliData>(() =>
    calculateKundli({
      name: "Seeker",
      gender: "male",
      birthDate: "1995-10-24",
      birthTime: "14:35",
      birthPlace: "New Delhi, Delhi",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 5.5,
    })
  );

  const [chartType, setChartType] = useState<"north" | "south">("north");
  const [selectedVarga, setSelectedVarga] = useState<DivisionalChartCode>("D1");
  const [activeTab, setActiveTab] = useState<
    "chart" | "planets" | "kp" | "dasha" | "ashtakvarga" | "shadbala" | "dosha" | "remedies" | "report"
  >("chart");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Paid PDF Product State (₹501 one-time order per specific chart)
  const [isPdfUnlocked, setIsPdfUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Derive unique signature for active chart
  const chartSignature = `${kundli.name}_${kundli.birthDate}_${kundli.birthTime}_${kundli.birthPlace}`;
  const chartStorageKey = `aapka_unlocked_kundli_${encodeURIComponent(chartSignature)}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(chartStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.unlocked) {
            setIsPdfUnlocked(true);
            return;
          }
        } catch {}
      }
      setIsPdfUnlocked(false);
    }
  }, [chartSignature, chartStorageKey]);

  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handlePdfPurchase = async () => {
    if (isPdfUnlocked) {
      handleDownloadPdf();
      return;
    }

    setIsProcessingPayment(true);
    try {
      // 1. Create order on server (server enforces ₹501)
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: KUNDLI_PDF_PRODUCT.price, // ₹501
          productId: "kundli_pdf",
          serviceType: "kundli_pdf_report",
          clientName: kundli.name,
          phone: "9876543210",
        }),
      });

      const orderData = await res.json().catch(() => null);
      if (!res.ok || !orderData?.order) {
        throw new Error(orderData?.message || "Failed to initiate PDF report order");
      }

      const orderId = orderData.order.id;
      const keyId = orderData.keyId || "rzp_test_mock_key_id";

      const completeUnlock = async (paymentId: string, signature: string = "") => {
        // 2. Verify signature on server
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentId,
            signature,
            productId: "kundli_pdf",
            amountINR: 501,
            topic: `Kundli PDF Report for ${kundli.name}`,
          }),
        }).catch((err) => console.warn("Verification warning:", err));

        setIsPdfUnlocked(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            chartStorageKey,
            JSON.stringify({
              unlocked: true,
              orderId,
              paymentId,
              chartSignature,
              unlockedAt: new Date().toISOString(),
            })
          );
        }
        setIsProcessingPayment(false);

        // Prompt immediate download / print
        setTimeout(() => {
          handleDownloadPdf();
        }, 300);
      };

      const isMock = keyId.includes("mock") || keyId.startsWith("rzp_test_mock");

      if (isMock) {
        setTimeout(async () => {
          await completeUnlock(`pay_sim_pdf_${Date.now()}`, `sig_mock_${Date.now()}`);
        }, 1200);
      } else {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Unable to load Razorpay payment gateway.");
        }

        const options = {
          key: keyId,
          amount: KUNDLI_PDF_PRODUCT.price * 100, // in paise
          currency: "INR",
          name: "Aapka Astro",
          description: `Full PDF Report for ${kundli.name}`,
          image: "/logo.png",
          order_id: orderId,
          handler: async function (response: any) {
            await completeUnlock(response.razorpay_payment_id, response.razorpay_signature);
          },
          prefill: {
            name: kundli.name,
          },
          theme: {
            color: "#7B2D26",
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error("PDF purchase error:", err);
      setIsProcessingPayment(false);
      alert(err.message || "Failed to process PDF report order. Please try again.");
    }
  };

  const vargaOptions: Array<{ code: DivisionalChartCode; label: string; sub: string }> = [
    { code: "D1", label: "D1 Lagna", sub: "Rashi / Life" },
    { code: "D9", label: "D9 Navamsha", sub: "Spouse & Dharma" },
    { code: "D10", label: "D10 Dashamsha", sub: "Career & Power" },
    { code: "D7", label: "D7 Saptamsha", sub: "Children" },
    { code: "D3", label: "D3 Drekkana", sub: "Courage & Siblings" },
    { code: "D12", label: "D12 Dwadasamsha", sub: "Parents & Lineage" },
    { code: "D2", label: "D2 Hora", sub: "Wealth & Treasury" },
  ];

  // Active divisional chart data
  const currentDivisional = kundli.divisionalCharts?.[selectedVarga];

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-14 sm:py-18 text-[#FBF3E7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#E8D8C3] mb-2">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-[#E8A33D] font-semibold">Free Kundli Generator</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-3.5 py-1 text-xs font-bold text-[#E8A33D] mb-3">
                <DiyaIcon size={14} />
                <span>CLASSICAL VEDIC EPHEMERIS &bull; FREE ONLINE GENERATOR</span>
              </div>
              <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
                Free Online Janam Kundli Generator
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#FBF3E7]/80 max-w-2xl font-body leading-relaxed">
                Calculate your authentic Vedic birth chart, planetary degrees, Vimshottari Dasha, Shodashvarga (D1 to D12), and Manglik status instantly online. Download full formatted PDF report anytime for ₹501.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePdfPurchase}
                disabled={isProcessingPayment}
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-75 ${
                  isPdfUnlocked
                    ? "border-[#6B8E5A] bg-[#6B8E5A]/20 text-[#D4EDDA] hover:bg-[#6B8E5A]/30"
                    : "border-[#E8A33D]/50 bg-[#64221C] text-[#FBF3E7] hover:bg-[#521C16]"
                }`}
              >
                {isPdfUnlocked ? (
                  <>
                    <Download className="h-4 w-4 text-[#6B8E5A]" />
                    <span>Download PDF (Unlocked)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-[#E8A33D]" />
                    <span>{isProcessingPayment ? "Processing..." : "Full PDF Dossier — ₹501"}</span>
                  </>
                )}
              </button>

              <Link
                href="/consult"
                className="flex items-center gap-1.5 rounded-xl bg-[#E8A33D] px-4 py-2.5 text-xs font-bold text-[#3B2A1E] shadow-md hover:bg-[#F6CF86] transition-all"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Consult Acharya Ji (₹1,051)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Generator Section */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Key Vedic Metrics */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C1662F] mb-2">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Enter Exact Birth Coordinates</span>
                </div>
                <h3 className="font-temple text-xl font-bold text-[#7B2D26] mb-5">
                  Birth Details Form
                </h3>
                <KundliForm onCalculated={setKundli} />
              </div>

              {/* Auspicious Vedic Alignments Card */}
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B2D26] font-temple mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Auspicious Vedic Alignments</span>
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Ascendant (Lagna):</span>
                    <span className="font-bold text-[#3B2A1E]">{kundli.ascendant.rashiName} ({kundli.ascendant.hindiName})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Moon Sign (Rashi):</span>
                    <span className="font-bold text-[#7B2D26]">{kundli.moonSign}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Sun Sign:</span>
                    <span className="font-bold text-[#3B2A1E]">{kundli.sunSign}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Birth Nakshatra:</span>
                    <span className="font-bold text-[#C1662F]">{kundli.nakshatra} (Pada {kundli.charanPada})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Lahiri Ayanamsa:</span>
                    <span className="font-bold font-mono text-[#7B2D26]">{kundli.ayanamsa.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Prescribed Gemstone:</span>
                    <span className="font-bold text-[#6B8E5A]">{kundli.luckyGemstone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Favorable Color:</span>
                    <span className="font-bold text-[#3B2A1E]">{kundli.luckyColor}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8D8C3]/80 pb-2">
                    <span className="text-[#7D6B5D]">Lucky Number:</span>
                    <span className="font-bold text-[#C1662F]">{kundli.luckyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D6B5D]">Ishta Devata:</span>
                    <span className="font-bold text-[#7B2D26]">{kundli.favorableDeity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chart & Deep Tab Content */}
            <div className="lg:col-span-8 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
              {/* Header & Chart Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C3] pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                    Vedic Horoscopic Synthesis
                  </span>
                  <h2 className="font-temple text-2xl font-bold text-[#7B2D26]">
                    {kundli.name}&apos;s Horoscope
                  </h2>
                  <p className="text-xs text-[#6E5545] mt-0.5">
                    Born {kundli.birthDate} at {kundli.birthTime} • {kundli.birthPlace}
                  </p>
                </div>

                <div className="flex items-center rounded-xl border border-[#D4C3B3] bg-[#F5EBE1] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartType("north")}
                    className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                      chartType === "north"
                        ? "bg-[#7B2D26] text-white shadow-sm"
                        : "text-[#7D6B5D] hover:text-[#3B2A1E]"
                    }`}
                  >
                    North Indian
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType("south")}
                    className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                      chartType === "south"
                        ? "bg-[#7B2D26] text-white shadow-sm"
                        : "text-[#7D6B5D] hover:text-[#3B2A1E]"
                    }`}
                  >
                    South Indian
                  </button>
                </div>
              </div>

              {/* Paid PDF Report Callout Banner */}
              <div className="my-5 rounded-2xl border border-[#E8A33D] bg-gradient-to-r from-[#FFFDF9] via-[#FAF1E4] to-[#FFFDF9] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7B2D26] text-[#E8A33D] shrink-0 font-bold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-temple font-bold text-sm sm:text-base text-[#7B2D26]">
                        Download Full Janam Kundli PDF Report
                      </h4>
                      <span className="rounded-full bg-[#6B8E5A]/20 px-2 py-0.5 text-[10px] font-bold text-[#2A4720]">
                        ₹501 One-Time
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5545] mt-0.5 font-body">
                      Complete 12-page formatted A4 printable dossier with high-resolution charts, planetary dignity table, 4-tier dasha timeline, and remedies.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePdfPurchase}
                  disabled={isProcessingPayment}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer disabled:opacity-75 ${
                    isPdfUnlocked
                      ? "bg-[#6B8E5A] hover:bg-[#587749] text-white"
                      : "bg-[#7B2D26] hover:bg-[#64231D] text-white"
                  }`}
                >
                  {isPdfUnlocked ? (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download PDF (Paid &amp; Unlocked)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-[#E8A33D]" />
                      <span>{isProcessingPayment ? "Processing..." : "Download Full PDF Report — ₹501"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#E8D8C3] my-5 text-xs font-semibold gap-3 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("chart")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "chart"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Charts &amp; Vargas ({selectedVarga})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("planets")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "planets"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <span>Planets &amp; Avasthas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("kp")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "kp"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <Compass className="h-3.5 w-3.5 text-[#C1662F]" />
                  <span>KP System</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dasha")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "dasha"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>4-Tier Dasha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ashtakvarga")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "ashtakvarga"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Ashtakvarga</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shadbala")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "shadbala"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Shadbala</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dosha")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "dosha"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <span>Doshas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("remedies")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "remedies"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <span>Remedies</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("report")}
                  className={`pb-2.5 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === "report"
                      ? "border-[#7B2D26] text-[#7B2D26] font-bold"
                      : "border-transparent text-[#7D6B5D] hover:text-[#3B2A1E]"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-[#E8A33D]" />
                  <span>{isPdfUnlocked ? "Full PDF Report (Unlocked)" : "Full PDF Report (₹501)"}</span>
                </button>
              </div>

              {/* Tab Views */}
              <div className="min-h-[440px]">
                {activeTab === "chart" && (
                  <div className="space-y-4">
                    {/* Divisional Chart Selector Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-[#FBF3E7] p-2 rounded-xl border border-[#E8D8C3]">
                      {vargaOptions.map((v) => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setSelectedVarga(v.code)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            selectedVarga === v.code
                              ? "bg-[#7B2D26] text-white shadow-xs"
                              : "bg-white text-[#6E5545] border border-[#E8D8C3] hover:border-[#7B2D26]"
                          }`}
                        >
                          <div className="font-bold">{v.label}</div>
                          <div className="text-[9px] opacity-80">{v.sub}</div>
                        </button>
                      ))}
                    </div>

                    {/* Varga Significance Card */}
                    {currentDivisional && (
                      <div className="text-xs text-[#6E5545] bg-[#FFFDF9] border border-[#E8D8C3]/80 rounded-lg p-2.5 flex items-center gap-2">
                        <span className="font-bold text-[#7B2D26]">{currentDivisional.name} ({currentDivisional.sanskritName}):</span>
                        <span>{currentDivisional.significance}</span>
                      </div>
                    )}

                    {/* Render Chart */}
                    <div className="flex flex-col items-center justify-center py-4">
                      {chartType === "north" ? (
                        <NorthIndianChart
                          kundli={kundli}
                          customHouses={selectedVarga !== "D1" ? currentDivisional?.houses : undefined}
                          size={420}
                          chartTitle={`${currentDivisional?.name || "Lagna"} (${selectedVarga})`}
                        />
                      ) : (
                        <SouthIndianChart
                          kundli={kundli}
                          customHouses={selectedVarga !== "D1" ? currentDivisional?.houses : undefined}
                          size={420}
                          chartTitle={`${currentDivisional?.name || "Lagna"} (${selectedVarga})`}
                        />
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "planets" && <PlanetaryTable kundli={kundli} />}
                {activeTab === "kp" && <KPTable kpData={kundli.kpSystem} />}
                {activeTab === "dasha" && <DashaTimeline dashas={kundli.dashas} />}
                {activeTab === "ashtakvarga" && <AshtakvargaTable ashtakvarga={kundli.ashtakvarga} />}
                {activeTab === "shadbala" && <ShadbalaTable shadbala={kundli.shadbala} />}
                {activeTab === "dosha" && <DoshaAnalysis doshas={kundli.doshas} />}
                {activeTab === "report" && (
                  <KundliPrintDossier
                    kundli={kundli}
                    isPreview={true}
                    isUnlocked={isPdfUnlocked}
                    onPurchase={handlePdfPurchase}
                    isProcessingPayment={isProcessingPayment}
                  />
                )}

                {activeTab === "remedies" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#E8A33D]/40 bg-[#FAF1E4] p-5">
                      <h4 className="text-sm font-bold text-[#7B2D26] font-temple mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                        <span>Prescribed Gemstone: {kundli.luckyGemstone}</span>
                      </h4>
                      <p className="text-xs text-[#6B5A4E] leading-relaxed">
                        Recommended to fortify your Lagna Lord and balance planetary afflictions. Wear on the designated finger after proper purification with raw milk, Gangajal, and Vedic mantra chanting on an auspicious day.
                      </p>
                      <div className="mt-4 flex gap-3">
                        <Link
                          href="/gemstones"
                          className="rounded-lg bg-[#7B2D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#64231D] shadow-sm transition-all"
                        >
                          Order Govt-Certified {kundli.luckyGemstone.split(" ")[0]}
                        </Link>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] p-5">
                      <h4 className="text-sm font-bold font-temple text-[#3B2A1E] mb-2">
                        Daily Vedic Mantras &amp; Lifestyle Alignment
                      </h4>
                      <ul className="space-y-2 text-xs text-[#6B5A4E]">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                          <span>Chant Gayatri Mantra 21 times daily during sunrise facing East.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                          <span>Perform water offering (Surya Arghya) with copper vessel and red flowers.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#6B8E5A]" />
                          <span>Favorable Day for beginning critical ventures: Thursday &amp; Monday.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Lead-Gen Action Strip */}
              <div className="mt-8 pt-6 border-t border-[#E8D8C3] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSignupPrompt(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all cursor-pointer"
                  >
                    <BookmarkPlus className="h-4 w-4 text-[#C1662F]" />
                    <span>Save Kundli to Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePdfPurchase}
                    disabled={isProcessingPayment}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-75 ${
                      isPdfUnlocked
                        ? "bg-[#6B8E5A] hover:bg-[#587749] text-white"
                        : "bg-[#E8A33D] hover:bg-[#D5912C] text-[#3B2A1E]"
                    }`}
                  >
                    {isPdfUnlocked ? (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download Full PDF (Unlocked)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Download Full PDF Report — ₹501</span>
                      </>
                    )}
                  </button>
                </div>

                <Link
                  href="/consult"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-4 py-2 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-[#E8A33D]" />
                  <span>Discuss Live with Acharya Ji (₹1,051)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Lead-Gen Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26] mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>

            <h3 className="font-temple text-2xl font-bold text-[#7B2D26]">
              Create Free Seeker Account
            </h3>

            <p className="mt-2 text-xs text-[#6E5545] leading-relaxed">
              Save your birth chart permanently, access your Janam Kundlis across devices, and unlock special promotional consultation rates.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/signup"
                className="block w-full rounded-xl bg-[#7B2D26] py-3 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm"
              >
                Sign Up with Google or Email
              </Link>
              <Link
                href="/login"
                className="block w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] py-3 text-xs font-bold text-[#3B2A1E] hover:bg-[#E8D8C3] transition-all"
              >
                Already have an account? Log In
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setShowSignupPrompt(false)}
              className="mt-4 text-xs font-semibold text-[#6E5545] hover:text-[#3B2A1E] cursor-pointer"
            >
              Continue exploring without saving
            </button>
          </div>
        </div>
      )}

      {/* Printable PDF Dossier (Active on Window.Print when unlocked) */}
      <KundliPrintDossier kundli={kundli} isUnlocked={isPdfUnlocked} />
    </div>
  );
}
