# Phase 1 Forensic Audit: Daily Panchang & Daily Horoscope (`PANCHANG_HOROSCOPE_AUDIT.md`)

**Audit Date:** September 28, 2026  
**Scope:** [`src/app/panchang/page.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/panchang/page.tsx), [`src/lib/astrology/realtimePanchang.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/realtimePanchang.ts), [`src/lib/store/panchangStore.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/store/panchangStore.ts), [`src/lib/services/panchangService.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/services/panchangService.ts), [`src/app/horoscope/page.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/horoscope/page.tsx), [`src/app/horoscope/[sign]/page.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/horoscope/%5Bsign%5D/page.tsx), [`src/lib/astrology/dailyHoroscope.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/dailyHoroscope.ts), [`src/lib/astrology/ephemeris.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/ephemeris.ts), [`src/lib/i18n/translations.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/i18n/translations.ts), and [`src/context/LanguageContext.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/context/LanguageContext.tsx).

---

## 1. Which Panchang Elements Are Currently Computed vs. Displayed?

### A. Elements Actually Computed via `astronomy-engine`
In [`src/lib/astrology/realtimePanchang.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/realtimePanchang.ts) (used by `/panchang`) and [`src/lib/services/panchangService.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/services/panchangService.ts) (used by `/api/panchang`):
1. **Sunrise (`sunTimes.sunrise`) & Sunset (`sunTimes.sunset`)**: Computed via `Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, ±1, astroTime, 1)`.
2. **Tithi Name & Paksha (`tithi.name`, `tithi.paksha`)**: Evaluated at a single fixed morning instant (`00:30 UTC` / `06:00 AM IST`) using `Math.floor(normalize360(moonSidereal - sunSidereal) / 12)`.
3. **Nakshatra Name, Pada (1–4) & Lord (`nakshatra.name`, `nakshatra.pada`, `nakshatra.lord`)**: Evaluated at `00:30 UTC` (`06:00 AM IST`) using `Math.floor(moonSidereal / 13.333333°)`.
4. **Yoga Name (`yoga.name`)**: Evaluated at `00:30 UTC` (`06:00 AM IST`) using `Math.floor(normalize360(sunSidereal + moonSidereal) / 13.333333°)`.
5. **Karana Name (`karana.name`)**: Evaluated at `00:30 UTC` (`06:00 AM IST`) using `Math.floor(angleDiff / 6)`.
6. **Vara (`vaar`)**: Computed from JavaScript `date.getDay()` (`Ravivara` through `Shanivara`).
7. **Chandra Rashi / Moon Sign (`moonTimes.moonSign`)**: Computed from `Math.floor(moonSidereal / 30)`.
8. **Ayana (`Uttarayana` / `Dakshinayana`)**: Computed from `sunSidereal >= 270 || sunSidereal < 90`.
9. **Samvat & Ritu (`samvat`, `ritu`)**: Approximated via Gregorian calendar arithmetic (`vikram = year + 57`, `shaka = year - 78`, and fixed Gregorian month pairs `month >= 3 && month <= 4 ? "Vasanta"` etc.) rather than true lunar Chaitra Shukla Pratipada or solar Sankranti transitions.

### B. Elements Displayed in the UI That Are Actually Hardcoded Strings (Not Computed)
1. **Moonrise & Moonset (`moonTimes.moonrise`, `moonTimes.moonset`)**:
   - In `realtimePanchang.ts` (lines 193–194), `moonrise` is hardcoded to the literal string `"Active lunar rise"` and `moonset` to `"Active lunar set"`.
   - `/panchang/page.tsx` (line 87) displays `"Active lunar rise"` instead of a time.
2. **All 4 Auspicious Muhurats (`auspiciousTimings`)**:
   - Hardcoded in `realtimePanchang.ts` (lines 197–202) as static strings regardless of date, weekday, or city sunrise/sunset:
     - `abhijitMuhurat`: `"11:51 AM – 12:41 PM"`
     - `amritKaal`: `"08:45 AM – 10:20 AM"`
     - `brahmaMuhurat`: `"04:32 AM – 05:21 AM"`
     - `vijayaMuhurat`: `"02:15 PM – 03:05 PM"`
3. **All 4 Inauspicious Timings (`inauspiciousTimings`)**:
   - Hardcoded in `realtimePanchang.ts` (lines 203–208) as static strings that **do not even vary by weekday (`Vara`) or day length (`Dinamana`)**:
     - `rahuKaal`: `"07:42 AM – 09:14 AM (Avoid new ventures)"` (permanently stuck on a Monday-style morning window even on Sunday, Tuesday, etc.)
     - `yamaganda`: `"10:45 AM – 12:17 PM"`
     - `gulikaKaal`: `"01:48 PM – 03:20 PM"`
     - `durMuhurat`: `"12:41 PM – 01:31 PM"`
4. **Choghadiya (`panchangService.ts` lines 260–269)**:
   - Hardcoded fixed clock intervals and fixed sequence in `panchangService.ts`; not rendered on `/panchang/page.tsx` at all.

### C. Traditional Panchang Elements Currently Missing from `/panchang`
- Real Moonrise (`Chandrodaya`) and Moonset (`Chandrastama`) times from `Astronomy.SearchRiseSet(Astronomy.Body.Moon, ...)`.
- True solar-day proportional (`Dinamana` 8-fold division) Rahu Kaal, Yamaganda, and Gulika Kaal per weekday (`Vara`), plus true `Abhijit Muhurat` (8th of 15 Muhurats of `Dinamana`), `Brahma Muhurat` (2 Muhurats before Sunrise), `Vijaya Muhurat` (11th of 15 Muhurats), and `Godhuli Muhurat`.
- Day & Night **Choghadiya** (`Udyoga/Udveg`, `Char`, `Labh`, `Amrit`, `Kaal`, `Shubh`, `Rog`) dynamically computed from Sunrise-to-Sunset and Sunset-to-next-Sunrise.
- **Surya Rashi (Sun Sign)** & **Surya Nakshatra**, **Lunar Month (Amanta & Purnimanta Masa)**, **Disha Shool**, **Nakshatra Pada transition times**, and a date picker (currently `/panchang` only shows today).

---

## 2. Location Handling & Timezones for Non-IST Locations

1. **Locations Currently Supported**:
   - `/panchang/page.tsx` defaults to `"delhi"` (`New Delhi: 28.6139° N, 77.2090° E`) and offers a `<select>` dropdown with **only 6 hardcoded Indian cities** (`delhi`, `varanasi`, `mumbai`, `bengaluru`, `jaipur`, `kolkata`) defined in `CITIES_LIST` (`src/lib/store/panchangStore.ts`) and `CITY_COORDINATES` (`src/lib/astrology/realtimePanchang.ts`).
   - Note that [`src/lib/astrology/indianCities.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/indianCities.ts) exists in the repo for Kundli generation, but `/panchang` does not use it.
   - Because Tithi/Nakshatra/Yoga/Karana are evaluated at a fixed `00:30 UTC` (`06:00 AM IST`) rather than at the city's actual sunrise, and because all Muhurat/Rahu Kaal timings are hardcoded strings, switching between the 6 cities on `/panchang` currently **only changes the Sunrise and Sunset strings** while leaving Rahu Kaal, Abhijit Muhurat, and all 5 limbs identical.
2. **Timezone Handling for Non-IST Locations**:
   - **None.** `formatISTTime(date)` in `realtimePanchang.ts` (lines 63–69) and `fmtIST` in `panchangService.ts` (lines 184–192) manually add `5 hours 30 minutes` to UTC (`date.getUTCHours() + 5` and `date.getUTCMinutes() + 30`).
   - There is no IANA timezone support (`Intl.DateTimeFormat(..., { timeZone })`) and no international cities (e.g., London, New York, Dubai, Toronto, Singapore, Sydney) in the Panchang selector.

---

## 3. Transition End Times (`endsAt`), Intra-Day Changes, and `Kshaya` / `Vriddhi` Tithis

1. **Are Transition End Times Shown?**
   - **No.** `realtimePanchang.ts` (lines 170, 176, 181, 185) populates `endsAt` with static placeholder text:
     - `tithi.endsAt`: `"Calculated per solar sunrise day"`
     - `nakshatra.endsAt`: `"Transitions during active transit"`
     - `yoga.endsAt`: `"Calculated per Moon-Sun sum"`
     - `karana.endsAt`: `"Transitions at half-tithi"`
   - The UI (`src/app/panchang/page.tsx` lines 122, 140, 156, 172) literally renders:
     - *"Active until **Calculated per solar sunrise day**. Followed by..."*
     - *"Governing Lord: **...**. Active till **Transitions during active transit**."*
2. **Intra-Day Limb Changes & Root-Finding**:
   - **Not implemented.** The code does not perform bisection/secant root-finding on `(moonLon(t) - sunLon(t)) mod 12° = 0` (for Tithi/Karana), `moonSid(t) mod 13°20' = 0` (for Nakshatra), or `(sunSid(t) + moonSid(t)) mod 13°20' = 0` (for Yoga).
   - If a Tithi, Nakshatra, Yoga, or Karana ends at e.g. `02:41 PM` and transitions to the next limb for the remainder of the day, neither the exact end timestamp nor the subsequent limb's end time (or the second Karana of the day) is computed.
3. **Skipped (`Kshaya`) or Repeated (`Vriddhi` / `Adhika`) Tithis at Sunrise**:
   - **Not handled.** Because the code evaluates Tithi at a fixed `00:30 UTC` (`06:00 AM IST`) instead of comparing the Tithi prevailing at `Sunrise(Day 0)` against `Sunrise(Day 1)` and `Sunrise(Day -1)`:
     - It cannot detect a **Vriddhi (Adhika) Tithi** (where the same Tithi is present at two consecutive sunrises because no 12° boundary crossing occurred between `Sunrise(Day 0)` and `Sunrise(Day 1)`).
     - It cannot detect a **Kshaya Tithi** (where a Tithi starts *after* `Sunrise(Day 0)` and ends *before* `Sunrise(Day 1)`, meaning two 12° boundaries are crossed between consecutive sunrises).

---

## 4. Ayanamsa, Lunar Node Convention (Mean vs. True Rahu/Ketu), and Sunrise Definition

1. **Ayanamsa Used**:
   - **Chitra Paksha Lahiri Ayanamsa** (linear precession approximation from J2000.0):
     - In `realtimePanchang.ts` (lines 56–61): `23.8566 + 1.396 * ((currentYear - 2000.0) / 100.0)`.
     - In `ephemeris.ts` (lines 109–113) and `panchangService.ts` (line 117): `23.85709167 + (daysFromJ2000 * 50.290966) / (365.25 * 3600)` (`23°51'25.53"` at J2000.0 with `50.290966"/yr` precession).
2. **Node Convention (Mean vs. True Rahu/Ketu)**:
   - In [`src/lib/astrology/ephemeris.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/ephemeris.ts#L166-L171) (`getRahuLongitude`), the **Mean Ascending Lunar Node (Mean Rahu)** is computed via the Meeus polynomial (`125.04452° - 1934.136261° * T + ...`), with Ketu set to `(Rahu + 180°) % 360`. True Node (`Spashta Rahu`) is not computed.
   - Neither `realtimePanchang.ts` nor `dailyHoroscope.ts` currently invokes `getRahuLongitude`.
3. **Sunrise Definition Used**:
   - `Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, astroTime, 1)` is used.
   - By default in `astronomy-engine`, `SearchRiseSet` finds the instant when the **apparent upper limb of the Sun** crosses the horizon including standard atmospheric refraction (`34'` refraction + `16'` solar semi-diameter, i.e. geometric altitude `-0.8333°`). Traditional Indian Drik Panchang standards often specify either *Udaya Lagna / Kendra* (center of solar disk with refraction) or apparent upper limb; this convention is currently undocumented in the UI.

---

## 5. How Daily Horoscope Currently Generates Text & Domain Scores

1. **How Text Is Generated**:
   - [`src/lib/astrology/dailyHoroscope.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/dailyHoroscope.ts#L205-L542) (`DailyHoroscopeService.getHoroscope`) is a **100% static, hardcoded dictionary (`DAILY_PREDICTIONS`)** indexed by `sign.id` (`aries` through `pisces`).
   - It does **not** run `astronomy-engine` or calculate any real planetary transits (`Gochara`).
   - Every single day of the year, `DailyHoroscopeService.getHoroscope("aries")` returns the exact same summary, the exact same remedy, the exact same lucky number (`9`), the exact same auspicious time (`09:15 AM - 10:45 AM`), and the exact same static string `planetaryTransit: "Moon transits your 10th house of profession under favorable aspect of Mars"`—regardless of which Rashi the Moon or Mars is actually occupying that day.
2. **Basis of the Four Domain Scores (`Love`, `Career`, `Health`, `Finance`)**:
   - In `src/lib/astrology/dailyHoroscope.ts` (lines 510–532), the scores are **hardcoded static integers that never change for any sign or any date**:
     - `overallScore`: `5` (for all 12 signs, every day)
     - `love.score`: `88` (for all 12 signs, every day)
     - `career.score`: `92` (for all 12 signs, every day)
     - `health.score`: `85` (for all 12 signs, every day)
     - `finance.score`: `90` (for all 12 signs, every day)
   - There is currently zero transit-house (`Chandra Ashtama`, `Gochara` house from Moon sign, Vedha, benefic/malefic aspect, or ruling planet dignity) computation behind these numbers.

---

## 6. Current State of Hindi Support & URL vs. `localStorage` Behavior

1. **Where Hindi Exists Today**:
   - [`src/lib/i18n/translations.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/i18n/translations.ts): Contains 35 top-level UI keys (`nav_*`, `status_*`, `hero_*`, `services_*`, `horoscope_title`, `panchang_title`, `footer_guarantee`).
   - [`src/context/LanguageContext.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/context/LanguageContext.tsx): React context storing `language: "en" | "hi"`.
   - [`src/lib/astrology/dailyHoroscope.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/dailyHoroscope.ts): Static fields (`summaryHindi`, `loveHindi`, `careerHindi`, `healthHindi`, `financeHindi`, `luckyColorHindi`, `remedyHindi`, `hindiName`, `rulingPlanetHindi`).
2. **Does It Translate Only UI Labels or Also Generated Panchang/Horoscope Content?**
   - **Daily Panchang (`/panchang/page.tsx`)**: Does **not** import or use `useLanguage()` at all. 100% of the Panchang data (`Tithi`, `Nakshatra`, `Yoga`, `Karana`, `Vara`, `Ritu`, `Samvat`, `Ayana`, `Sunrise/Sunset` labels, `Rahu Kaal`, city names, and cosmic significance) is rendered in **English only**. Switching the site language to Hindi in the Navbar leaves `/panchang` completely in English.
   - **Daily Horoscope Index (`/horoscope/page.tsx`)**: Server Component with **no language awareness**. Renders all cards, summaries, ruling planets, lucky colors, and CTAs in English only (only displaying the Rashi's Hindi name in parentheses).
   - **Daily Horoscope Sign Detail (`/horoscope/[sign]/page.tsx`)**: Server Component that renders both English and static Hindi lines stacked inside the same cards, while keeping all headings, navigation breadcrumbs, metadata labels (`Element`, `Ruling Planet`), `planetaryTransit`, `auspiciousTime`, and consultation CTAs in **English only**.
3. **Does the Language Toggle Change the URL, or Only `localStorage`?**
   - In [`src/context/LanguageContext.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/context/LanguageContext.tsx#L32-L40), `setLanguage(lang)` **only updates `localStorage` (`aapka_astro_lang`) and `document.documentElement.lang`**.
   - It does **not** update or sync with URL query parameters (e.g. `?lang=hi`) or routes, meaning a Hindi reader cannot share a direct link that opens in Hindi, nor do Server Components know the selected language.
