import {
  computeRealtimePanchang,
  PANCHANG_LOCATIONS,
  PanchangLocation,
  ChoghadiyaSlot,
  ChandrabalamEntry,
  FestivalOrVratItem,
} from "@/lib/astrology/realtimePanchang";

export type DailyPanchang = ReturnType<typeof computeRealtimePanchang>;

export type {
  PanchangLocation,
  ChoghadiyaSlot,
  ChandrabalamEntry,
  FestivalOrVratItem,
};

export const CITIES_LIST: PanchangLocation[] = PANCHANG_LOCATIONS;

export const getPanchangForCity = (
  cityId: string = "delhi",
  targetDate?: Date | string
): DailyPanchang => {
  return computeRealtimePanchang(cityId, targetDate);
};
