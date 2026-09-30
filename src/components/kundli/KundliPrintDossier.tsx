"use client";

import React from "react";
import { KundliData } from "@/lib/astrology/types";
import { NorthIndianChart } from "./NorthIndianChart";
import { Printer, Download, Sparkles, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

interface KundliPrintDossierProps {
  kundli: KundliData;
  isPreview?: boolean;
  isUnlocked?: boolean;
  onPurchase?: () => void;
  isProcessingPayment?: boolean;
}

export const KundliPrintDossier: React.FC<KundliPrintDossierProps> = ({
  kundli,
  isPreview = false,
  isUnlocked = false,
  onPurchase,
  isProcessingPayment = false,
}) => {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Navamsha D9 Chart Houses
  const d9Houses = kundli.divisionalCharts?.["D9"]?.houses;

  // Active Dasha Chain
  const activeMaha = kundli.dashas.find((d) => d.isCurrent) || kundli.dashas[0];
  const activeAntar = activeMaha?.antardashas?.find((a) => a.isCurrent);
  const activePrat = activeAntar?.pratyantardashas?.find((p) => p.isCurrent);
  const activeSookshma = activePrat?.sookshmadashas?.find((s) => s.isCurrent);

  return (
    <div className={isPreview ? "space-y-6" : "print-only p-8 bg-white text-black"}>
      {/* Top Action Bar when viewed on screen */}
      {isPreview && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#7B2D26] text-[#FBF3E7] shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-temple text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                <span>Full Janam Kundli Dossier (Printable PDF Version)</span>
              </h3>
              {isUnlocked ? (
                <span className="rounded-full bg-[#6B8E5A] px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Unlocked &bull; Paid
                </span>
              ) : (
                <span className="rounded-full bg-[#E8A33D] px-2.5 py-0.5 text-[10px] font-bold text-[#3B2A1E]">
                  Paid Product: ₹501
                </span>
              )}
            </div>
            <p className="text-xs text-[#E8D8C3] mt-1 font-body">
              {isUnlocked
                ? "Your full PDF report is unlocked! Click below to download or print your clean A4 document."
                : "Full 12-page formatted Vedic horoscope report with dual charts, planetary dignity matrix, and remedies."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isUnlocked ? (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6B8E5A] hover:bg-[#577548] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download / Print Full PDF Dossier</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPurchase}
                disabled={isProcessingPayment}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] hover:bg-[#D5912C] text-[#3B2A1E] px-5 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-75"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isProcessingPayment ? "Processing Order..." : "Download Full PDF Report — ₹501"}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actual Printable Document Container */}
      <div className="bg-white text-[#1a1a1a] p-6 sm:p-8 rounded-2xl border border-[#E8D8C3] shadow-sm font-sans space-y-6 max-w-4xl mx-auto relative">
        {/* Document Header */}
        <div className="border-b-2 border-[#7B2D26] pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#7B2D26]">
              Aapka Astro &bull; Authentic Geocentric Vedic Ephemeris
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#7B2D26] mt-1">
              {kundli.name}&apos;s Vedic Janam Kundli
            </h1>
            <div className="text-xs text-[#555] mt-1">
              Born: <strong className="text-black">{kundli.birthDate}</strong> at <strong className="text-black">{kundli.birthTime}</strong> &bull; Place: <strong className="text-black">{kundli.birthPlace}</strong>
            </div>
            <div className="text-[11px] text-[#777] font-mono mt-0.5">
              Coordinates: {kundli.latitude.toFixed(4)}°N, {kundli.longitude.toFixed(4)}°E &bull; TZ: GMT+{kundli.timezone} &bull; Lahiri Ayanamsa: {kundli.ayanamsa.toFixed(4)}°
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border border-[#7B2D26] bg-[#FBF3E7] px-3 py-1.5 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-[#7B2D26]">Lagna Ascendant</div>
              <div className="text-sm font-bold text-black">{kundli.ascendant.rashiName} ({kundli.ascendant.hindiName})</div>
            </div>
            {isUnlocked && (
              <div className="text-[10px] font-bold text-[#6B8E5A] mt-1 flex items-center justify-end gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Client PDF &bull; ₹501 Paid</span>
              </div>
            )}
          </div>
        </div>

        {/* Vital Astrology Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FBF3E7]/60 p-3.5 rounded-xl border border-[#E8D8C3] text-xs">
          <div>
            <span className="text-[#666] block text-[10px] uppercase font-semibold">Moon Sign (Rashi)</span>
            <span className="font-bold text-[#7B2D26] text-sm">{kundli.moonSign}</span>
          </div>
          <div>
            <span className="text-[#666] block text-[10px] uppercase font-semibold">Sun Sign (Surya)</span>
            <span className="font-bold text-black text-sm">{kundli.sunSign}</span>
          </div>
          <div>
            <span className="text-[#666] block text-[10px] uppercase font-semibold">Nakshatra</span>
            <span className="font-bold text-[#C1662F] text-sm">{kundli.nakshatra} (Pada {kundli.charanPada})</span>
          </div>
          <div>
            <span className="text-[#666] block text-[10px] uppercase font-semibold">Prescribed Gemstone</span>
            <span className="font-bold text-[#2E7D32] text-sm">{kundli.luckyGemstone}</span>
          </div>
        </div>

        {/* Side-by-Side Dual Charts: D1 (Lagna) & D9 (Navamsha) */}
        <div className="page-break-inside-avoid">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase border-b border-[#E8D8C3] pb-1.5 mb-4">
            Primary Horoscopic Kundlis (D1 Lagna Chakra &amp; D9 Navamsha Chakra)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-items-center py-2">
            <div className="w-full flex flex-col items-center">
              <div className="text-xs font-bold text-[#7B2D26] mb-2 uppercase tracking-wide">
                D1 Lagna Kundli (Physical Body &amp; Destiny)
              </div>
              <NorthIndianChart kundli={kundli} size={300} chartTitle="" />
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="text-xs font-bold text-[#7B2D26] mb-2 uppercase tracking-wide">
                D9 Navamsha Kundli (Spouse &amp; Dharma)
              </div>
              {d9Houses ? (
                <NorthIndianChart
                  kundli={kundli}
                  customHouses={d9Houses}
                  size={300}
                  chartTitle=""
                />
              ) : (
                <NorthIndianChart kundli={kundli} size={300} chartTitle="" />
              )}
            </div>
          </div>
        </div>

        {/* Complete Planetary Positions Table */}
        <div className="page-break-inside-avoid">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase border-b border-[#E8D8C3] pb-1.5 mb-3">
            Planetary Longitudes &amp; Dignity Matrix (ग्रह स्पष्ट स्थिति)
          </h3>
          <table className="w-full text-left text-xs border border-[#E8D8C3] rounded-lg overflow-hidden">
            <thead className="bg-[#FBF3E7] text-[#7B2D26] font-bold border-b border-[#E8D8C3]">
              <tr>
                <th className="p-2">Graha</th>
                <th className="p-2">Rashi</th>
                <th className="p-2">Degree</th>
                <th className="p-2">Nakshatra</th>
                <th className="p-2">House</th>
                <th className="p-2">Dignity</th>
                <th className="p-2">Motion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D8C3]/60">
              {kundli.planets.map((p) => (
                <tr key={p.name} className="hover:bg-amber-50/30">
                  <td className="p-2 font-bold text-black flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#7B2D26]">{p.symbol}</span>
                    <span>{p.name} ({p.hindiName})</span>
                  </td>
                  <td className="p-2 text-[#333]">{p.rashiName}</td>
                  <td className="p-2 font-mono text-[11px] text-[#666]">{p.degreeFormatted}</td>
                  <td className="p-2 text-[#444]">{p.nakshatra} (P{p.pada})</td>
                  <td className="p-2 font-bold text-center">{p.house}</td>
                  <td className="p-2 font-semibold">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        p.dignity === "Exalted"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.dignity === "Debilitated"
                          ? "bg-rose-100 text-rose-800"
                          : p.dignity === "Own Sign"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.dignity}
                    </span>
                  </td>
                  <td className="p-2 text-[11px]">
                    {p.isRetrograde ? (
                      <span className="text-amber-800 font-bold">Vakri (R)</span>
                    ) : (
                      <span className="text-emerald-800">Margi (D)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vimshottari Dasha Hierarchy */}
        <div className="page-break-inside-avoid">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase border-b border-[#E8D8C3] pb-1.5 mb-3">
            Current 4-Tier Vimshottari Dasha Timing
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FBF3E7]/80 p-3 rounded-xl border border-[#E8D8C3] text-xs">
            <div className="border-r border-[#E8D8C3] pr-2">
              <span className="text-[10px] font-bold text-[#7B2D26] uppercase block">1. Mahadasha</span>
              <span className="text-sm font-bold text-black">{activeMaha?.planet} ({activeMaha?.hindiName})</span>
              <div className="text-[10px] font-mono text-[#666] mt-0.5">{activeMaha?.startDate} to {activeMaha?.endDate}</div>
            </div>
            <div className="border-r border-[#E8D8C3] pr-2">
              <span className="text-[10px] font-bold text-[#7B2D26] uppercase block">2. Antardasha</span>
              <span className="text-sm font-bold text-black">{activeAntar?.planet || activeMaha?.planet}</span>
              <div className="text-[10px] font-mono text-[#666] mt-0.5">{activeAntar?.startDate} to {activeAntar?.endDate}</div>
            </div>
            <div className="border-r border-[#E8D8C3] pr-2">
              <span className="text-[10px] font-bold text-[#7B2D26] uppercase block">3. Pratyantardasha</span>
              <span className="text-sm font-bold text-black">{activePrat?.planet || "Current"}</span>
              <div className="text-[10px] font-mono text-[#666] mt-0.5">{activePrat?.startDate} to {activePrat?.endDate}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#7B2D26] uppercase block">4. Sookshmadasha</span>
              <span className="text-sm font-bold text-black">{activeSookshma?.planet || "Active"}</span>
              <div className="text-[10px] font-mono text-[#666] mt-0.5">{activeSookshma?.startDate || activePrat?.startDate} to {activeSookshma?.endDate || activePrat?.endDate}</div>
            </div>
          </div>
        </div>

        {/* Authentic Dosha Diagnosis */}
        <div className="page-break-inside-avoid">
          <h3 className="text-sm font-bold text-[#7B2D26] uppercase border-b border-[#E8D8C3] pb-1.5 mb-3">
            Classical Dosha Diagnosis &amp; Remedial Assessment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-[#E8D8C3] bg-white">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#7B2D26]">Manglik Dosha (Kuja)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kundli.doshas.hasManglik ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {kundli.doshas.manglikSeverity}
                </span>
              </div>
              <p className="text-[11px] text-[#555] leading-relaxed">{kundli.doshas.manglikDetails}</p>
            </div>

            <div className="p-3 rounded-lg border border-[#E8D8C3] bg-white">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#7B2D26]">Shani Sade Sati</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kundli.doshas.hasSadeSati ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {kundli.doshas.sadeSatiPhase}
                </span>
              </div>
              <p className="text-[11px] text-[#555] leading-relaxed">{kundli.doshas.sadeSatiDetails}</p>
            </div>

            <div className="p-3 rounded-lg border border-[#E8D8C3] bg-white">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#7B2D26]">Kaal Sarp Dosha</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kundli.doshas.hasKalsarpa ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {kundli.doshas.kalsarpaType}
                </span>
              </div>
              <p className="text-[11px] text-[#555] leading-relaxed">{kundli.doshas.kalsarpaDetails || "All planets are not hemmed between Rahu and Ketu; Kaal Sarp is absent."}</p>
            </div>

            <div className="p-3 rounded-lg border border-[#E8D8C3] bg-white">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#7B2D26]">Pitra Dosha</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kundli.doshas.hasPitraDosha ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {kundli.doshas.hasPitraDosha ? "Detected" : "None"}
                </span>
              </div>
              <p className="text-[11px] text-[#555] leading-relaxed">{kundli.doshas.pitraDoshaDetails || "No afflicted 9th house or Sun affliction observed from ancestors."}</p>
            </div>
          </div>
        </div>

        {/* Auspicious Remedies & Consultation Footer */}
        <div className="border-t-2 border-[#7B2D26] pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold text-[#7B2D26]">Auspicious Alignments:</div>
            <div className="text-[11px] text-[#555]">
              Gemstone: <strong>{kundli.luckyGemstone}</strong> &bull; Color: <strong>{kundli.luckyColor}</strong> &bull; Lucky Number: <strong>{kundli.luckyNumber}</strong> &bull; Ishta Devata: <strong>{kundli.favorableDeity}</strong>
            </div>
          </div>
          <div className="text-right text-[11px] text-[#777]">
            <div>Prepared with Authentic Geocentric Ephemeris by <strong>Aapka Astro</strong></div>
            <div>For 1-on-1 personal consultation, visit <strong>aapkaastro.com/consult</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
