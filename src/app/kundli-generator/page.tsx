"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KundliForm } from "@/components/kundli/KundliForm";
import { NorthIndianChart } from "@/components/kundli/NorthIndianChart";
import { SouthIndianChart } from "@/components/kundli/SouthIndianChart";
import { PlanetaryTable } from "@/components/kundli/PlanetaryTable";
import { DashaTimeline } from "@/components/kundli/DashaTimeline";
import { DoshaAnalysis } from "@/components/kundli/DoshaAnalysis";
import { KPTable } from "@/components/kundli/KPTable";
import { AshtakvargaTable } from "@/components/kundli/AshtakvargaTable";
import { KundliPrintDossier } from "@/components/kundli/KundliPrintDossier";
import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { KundliData } from "@/lib/astrology/types";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  Sparkles,
  Download,
  BookmarkPlus,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  Layers,
  FileText,
} from "lucide-react";
import { KUNDLI_PDF_PRODUCT } from "@/config/placeholderContent";

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
      birthDate: "1998-06-15",
      birthTime: "11:20",
      birthPlace: "New Delhi, Delhi",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 5.5,
    })
  );

  const [chartType, setChartType] = useState<"north" | "south">("north");
  const [selectedVarga, setSelectedVarga] = useState<"D1" | "D9">("D1");
  const [activeTab, setActiveTab] = useState<
    "chart" | "planets" | "kp" | "ashtakvarga" | "dasha" | "dosha" | "report"
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

  const d9Houses = kundli.divisionalCharts?.["D9"]?.houses;

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E]">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E8D8C3] bg-[#7B2D26] py-16 sm:py-20 text-[#FBF3E7]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#64221C] px-4 py-1 text-xs font-bold text-[#E8A33D] mb-4">
            <DiyaIcon size={14} />
            <span>FREE ONLINE KUNDLI &bull; DOWNLOADABLE PDF REPORT</span>
          </div>

          <h1 className="font-temple text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF3E7]">
            Free Online Janam Kundli Generator
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#FBF3E7]/80 max-w-2xl mx-auto font-body">
            Calculate your authentic Vedic birth chart, planetary degrees, Vimshottari Dasha, and Manglik status instantly online. Download full formatted PDF report anytime for ₹501.
          </p>
        </div>
      </section>

      {/* 2. Generator Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C1662F] mb-2">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Enter Exact Birth Coordinates</span>
                </div>
                <h3 className="font-temple text-xl font-bold text-[#7B2D26] mb-6">
                  Birth Details Form
                </h3>
                <KundliForm onCalculated={setKundli} />
              </div>
            </div>

            {/* Chart Output Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
                {/* Result header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8D8C3]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1662F]">
                      Vedic Horoscopic Synthesis
                    </span>
                    <h2 className="font-temple text-2xl font-bold text-[#7B2D26]">
                      {kundli.name}&apos;s Lagna Kundli
                    </h2>
                    <p className="text-xs text-[#6E5545]">
                      Born on {kundli.birthDate} at {kundli.birthTime} • {kundli.birthPlace}
                    </p>
                  </div>

                  {/* Format Toggle */}
                  <div className="flex rounded-xl bg-[#FBF3E7] p-1 border border-[#E8D8C3]">
                    <button
                      type="button"
                      onClick={() => setChartType("north")}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                        chartType === "north"
                          ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                          : "text-[#6E5545] hover:text-[#3B2A1E]"
                      }`}
                    >
                      North Indian
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType("south")}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                        chartType === "south"
                          ? "bg-[#7B2D26] text-[#FBF3E7] shadow-sm"
                          : "text-[#6E5545] hover:text-[#3B2A1E]"
                      }`}
                    >
                      South Indian
                    </button>
                  </div>
                </div>

                {/* Paid PDF Report Callout Banner */}
                <div className="my-5 rounded-2xl border border-[#E8A33D] bg-gradient-to-r from-[#FFFDF9] via-[#FAF1E4] to-[#FFFDF9] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B2D26] text-[#E8A33D] shrink-0 font-bold">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-temple font-bold text-sm text-[#7B2D26]">
                          Download Full PDF Report
                        </h4>
                        <span className="rounded-full bg-[#6B8E5A]/20 px-2 py-0.5 text-[10px] font-bold text-[#2A4720]">
                          ₹501
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6E5545] mt-0.5">
                        Complete formatted 12-page printable A4 dossier for this chart.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePdfPurchase}
                    disabled={isProcessingPayment}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-75 ${
                      isPdfUnlocked
                        ? "bg-[#6B8E5A] hover:bg-[#587749] text-white"
                        : "bg-[#7B2D26] hover:bg-[#64231D] text-white"
                    }`}
                  >
                    {isPdfUnlocked ? (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF (Unlocked)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 text-[#E8A33D]" />
                        <span>{isProcessingPayment ? "Processing..." : "Download Full PDF Report — ₹501"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E8D8C3] gap-2 pt-2 overflow-x-auto pb-1">
                  {[
                    { id: "chart", label: "Lagna & D9 Charts" },
                    { id: "planets", label: "Planets" },
                    { id: "kp", label: "KP System" },
                    { id: "ashtakvarga", label: "Ashtakvarga" },
                    { id: "dasha", label: "4-Tier Dasha" },
                    { id: "dosha", label: "Dosha Diagnosis" },
                    { id: "report", label: isPdfUnlocked ? "Full PDF Report (Unlocked)" : "Full PDF Report (₹501)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
                        activeTab === tab.id
                          ? "border-[#7B2D26] text-[#7B2D26]"
                          : "border-transparent text-[#6E5545] hover:text-[#3B2A1E]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="pt-4">
                  {activeTab === "chart" && (
                    <div className="space-y-4">
                      {/* D1 vs D9 Selector */}
                      <div className="flex items-center justify-center gap-2 bg-[#FBF3E7] p-1.5 rounded-xl border border-[#E8D8C3] max-w-md mx-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedVarga("D1")}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                            selectedVarga === "D1"
                              ? "bg-[#7B2D26] text-white shadow-xs"
                              : "text-[#6E5545] hover:text-[#3B2A1E]"
                          }`}
                        >
                          D1 Lagna (Rashi Chakra)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedVarga("D9")}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                            selectedVarga === "D9"
                              ? "bg-[#7B2D26] text-white shadow-xs"
                              : "text-[#6E5545] hover:text-[#3B2A1E]"
                          }`}
                        >
                          D9 Navamsha (Spouse &amp; Dharma)
                        </button>
                      </div>

                      <div className="flex justify-center py-4">
                        {chartType === "north" ? (
                          <NorthIndianChart
                            kundli={kundli}
                            customHouses={selectedVarga === "D9" && d9Houses ? d9Houses : undefined}
                            chartTitle={selectedVarga === "D9" ? "Navamsha Chakra (D9)" : "Lagna Chakra (D1)"}
                            size={360}
                          />
                        ) : (
                          <SouthIndianChart
                            kundli={kundli}
                            customHouses={selectedVarga === "D9" && d9Houses ? d9Houses : undefined}
                            chartTitle={selectedVarga === "D9" ? "Navamsha Chakra (D9)" : "Lagna Chakra (D1)"}
                            size={360}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "planets" && <PlanetaryTable kundli={kundli} />}
                  {activeTab === "kp" && <KPTable kpData={kundli.kpSystem} />}
                  {activeTab === "ashtakvarga" && <AshtakvargaTable ashtakvarga={kundli.ashtakvarga} />}
                  {activeTab === "dasha" && <DashaTimeline dashas={kundli.dashas} />}
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
                </div>

                {/* Lead-Gen Action Strip */}
                <div className="mt-8 pt-6 border-t border-[#E8D8C3] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSignupPrompt(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#7B2D26] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all"
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
              className="mt-4 text-xs font-semibold text-[#6E5545] hover:text-[#3B2A1E]"
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
