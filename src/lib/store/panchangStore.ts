import {
  computeRealtimePanchang,
  PANCHANG_LOCATIONS,
  PanchangLocation,
  CustomPanchangLocation,
  ChoghadiyaSlot,
  ChandrabalamEntry,
  FestivalOrVratItem,
} from "@/lib/astrology/realtimePanchang";

export type DailyPanchang = ReturnType<typeof computeRealtimePanchang>;

export type {
  PanchangLocation,
  CustomPanchangLocation,
  ChoghadiyaSlot,
  ChandrabalamEntry,
  FestivalOrVratItem,
};

export const CITIES_LIST: PanchangLocation[] = PANCHANG_LOCATIONS;

export const getPanchangForCity = (
  cityOrCustom: string | CustomPanchangLocation = "delhi",
  targetDate?: Date | string
): DailyPanchang => {
  return computeRealtimePanchang(cityOrCustom, targetDate);
};
