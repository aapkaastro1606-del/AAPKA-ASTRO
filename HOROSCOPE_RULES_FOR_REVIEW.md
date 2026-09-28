# HOROSCOPE_RULES_FOR_REVIEW.md
## Vedic Chandra Rashi (Moon Sign) Gochara & Scoring Specification
**Status**: **DRAFT FOR ASTROLOGICAL REVIEW — Awaiting Review & Calibration by Acharya Niraj Kumar**  
**Engine Source File**: [`src/lib/astrology/gocharaRules.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/gocharaRules.ts) & [`src/lib/astrology/dailyHoroscope.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/dailyHoroscope.ts)  
**Ayanamsa**: Chitra Paksha Lahiri (IAU 1976 / Meeus nutation, matching Drik / Rashtriya Panchang)

> **Note to Acharya Niraj Kumar (आचार्य नीरज कुमार जी के अवलोकनार्थ)**:  
> This document exports the exact classical Gochara (planetary transit from Chandra Rashi / जन्म चन्द्र राशि से गोचर) rules, Vedha (वेध) pairs, Combustion (अस्त) orbs, Naisargika Maitri (नैसर्गिक मैत्री), and Domain Scoring weights currently implemented in the Aapka Astro Horoscope Engine.  
> **These rules are presented for your review and correction, and are not treated as final until approved by you.** Any house classification, Vedha exception, or domain weight in [`src/lib/astrology/gocharaRules.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/astrology/gocharaRules.ts) can be adjusted directly per your guidance.

---

## 1. Planet × House-from-Moon Gochara Table (नवग्रह गोचर नियम तालिका — चन्द्र राशि से भाव १ से १२)

In Vedic Jyotish, daily and short-term transit results (*Gochara Phala*) are reckoned from the natal Moon Sign (**Chandra Rashi / जन्म राशि**), where the Moon's sign is counted as **House 1 (प्रथम भाव)**.

| Planet (ग्रह) | Favourable Houses from Moon (शुभ गोचर भाव) | Mixed / Neutral Houses (मिश्रित / सम भाव) | Unfavourable / Challenging Houses (अशुभ / सावधानी सूचक भाव) | Vedha Pairs: `Good House -> Obstructing House` (वेध स्थान युग्म) | Classical Reference (शास्त्रीय आधार) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sun (सूर्य)** | **3, 6, 10, 11** | **1, 2, 9** | **4, 5, 7, 8, 12** | `3→9`, `6→12`, `10→4`, `11→5` *(Exception: Saturn-Sun have no mutual Vedha / सूर्य-शनि में परस्पर वेध नहीं होता)* | *Phaladeepika* Ch. 26 v. 12; *Brihat Samhita* Ch. 104 |
| **Moon (चन्द्र)** | **1, 3, 6, 7, 10, 11** | **2, 5, 9** | **4, 8 (Chandra Ashtama / चन्द्राष्टम), 12** | `1→5`, `3→9`, `6→12`, `7→2`, `10→4`, `11→8` *(Exception: Moon-Mercury have no mutual Vedha / चन्द्र-बुध में परस्पर वेध नहीं होता)* | *Phaladeepika* Ch. 26 v. 13; *Brihat Samhita* Ch. 104 |
| **Mars (मंगल)** | **3, 6, 11** | **10, 2** | **1, 4, 5, 7, 8, 9, 12** | `3→12`, `6→9`, `11→5` | *Phaladeepika* Ch. 26 v. 14; *Brihat Samhita* Ch. 104 |
| **Mercury (बुध)** | **2, 4, 6, 8, 10, 11** | **1, 9** | **3, 5, 7, 12** | `2→5`, `4→3`, `6→9`, `8→1`, `10→8`, `11→12` *(Exception: Mercury-Moon have no mutual Vedha)* | *Phaladeepika* Ch. 26 v. 15; *Brihat Samhita* Ch. 104 |
| **Jupiter (गुरु)** | **2, 5, 7, 9, 11** | **1, 4, 10** | **3, 6, 8, 12** | `2→12`, `5→4`, `7→3`, `9→10`, `11→8` | *Phaladeepika* Ch. 26 v. 16; *Brihat Samhita* Ch. 104 |
| **Venus (शुक्र)** | **1, 2, 3, 4, 5, 8, 9, 11, 12** | **7** | **6, 10** | `1→8`, `2→7`, `3→1`, `4→10`, `5→9`, `8→5`, `9→11`, `11→6`, `12→3` | *Phaladeepika* Ch. 26 v. 17; *Brihat Samhita* Ch. 104 |
| **Saturn (शनि)** | **3, 6, 11** | **10, 9** | **1 (Janma Shani / साढ़ेसाती द्वितीय चरण), 2 (साढ़ेसाती अंतिम चरण), 4 (Kantaka / ढैय्या), 5, 7, 8 (Ashtama Shani / अष्टम ढैय्या), 12 (साढ़ेसाती प्रथम चरण)** | `3→12`, `6→9`, `11→5` *(Exception: Saturn-Sun have no mutual Vedha)* | *Phaladeepika* Ch. 26 v. 18; *Brihat Samhita* Ch. 104 |
| **Rahu (राहु)** | **3, 6, 10, 11** | **2, 9** | **1, 4, 5, 7, 8, 12** | `3→12`, `6→9`, `11→5` | *Phaladeepika* Ch. 26 v. 23; *Uttara Kalamrita* |
| **Ketu (केतु)** | **3, 6, 11** | **9, 12 (Moksha / आध्यात्मिक चिंतन)** | **1, 2, 4, 5, 7, 8, 10** | `3→12`, `6→9`, `11→5` | *Phaladeepika* Ch. 26 v. 23; *Uttara Kalamrita* |

---

## 2. Combustion (Asta / अस्त) & Retrograde (Vakri / वक्री) Rules (सूर्यास्त एवं वक्री ग्रह नियम)

### 2.1 Combustion Orbs from the Sun (*Surya Siddhanta* Ch. 9 — कालांश / अस्त अंश)
When a planet comes within the following angular separation (`|Planet Longitude - Sun Longitude|`) from the Sun, it is marked **Combust (`Asta / अस्त`)**:
- **Moon (चन्द्र)**: `12°`
- **Mars (मंगल)**: `17°`
- **Mercury (बुध)**: `14°` (Direct / मार्गी), `12°` (Retrograde / वक्री)
- **Jupiter (गुरु)**: `11°`
- **Venus (शुक्र)**: `10°` (Direct / मार्गी), `8°` (Retrograde / वक्री)
- **Saturn (शनि)**: `15°`

**Effect in Engine**:
- If a planet is in a **Favourable** house from the Moon but is **Combust (`Asta`)**, its outward material fruit is tempered from `Favourable` to `Mixed` (`+3` instead of `+5` in domain scoring), and its `Asta` status is explicitly disclosed in `"Why this reading?"`.

### 2.2 Retrograde (`Vakri / वक्री`) Motion
- Computed directly from daily sidereal longitudinal speed (`dλ/dt < 0`) via `astronomy-engine`.
- When an inner/slower planet (`Mars`, `Mercury`, `Jupiter`, `Venus`, `Saturn`) is **Retrograde (`Vakri`)**, the reading adds specific cautionary/reflective counsel (e.g., reviewing written contracts and communication when `Mercury` is `Vakri`) and marks `[Retrograde (Vakri) / वक्री]` in the transit table.

---

## 3. Chandra Gochar (12 Houses from Moon) Summary in English & Hindi (चन्द्र गोचर के बारह भावों का फल)

| House from Moon (चन्द्र से भाव) | Verdict (निर्णय) | English Meaning (सार) | Hindi Meaning (हिन्दी सार) |
| :--- | :--- | :--- | :--- |
| **1st (प्रथम — जन्म चन्द्र)** | **Favourable (शुभ)** | Mental clarity, self-confidence, good food, comfort, and recognition. | आत्मबल, मानसिक प्रसन्नता, उत्तम भोजन, सुख-सुविधा और मान-सम्मान में वृद्धि। |
| **2nd (द्वितीय — धन/कुटुंब)** | **Mixed (मिश्रित)** | Focus on family duties and speech discipline; monitor expenses carefully. | वाणी में संयम और पारिवारिक दायित्वों पर ध्यान दें; अनावश्यक खर्चों पर नियंत्रण रखें। |
| **3rd (तृतीय — पराक्रम)** | **Favourable (शुभ)** | Victory in initiatives, support from siblings/colleagues, short productive travel, and financial gains. | पराक्रम व उत्साह में वृद्धि, भाई-बहनों व सहकर्मियों से सहयोग, कार्यों में सफलता और धन लाभ। |
| **4th (चतुर्थ — सुख भाव)** | **Unfavourable (सावधानी)** | Emotional restlessness or domestic errands; maintain calm at home and avoid hasty property decisions. | मन में थोड़ी चंचलता या घरेलू व्यस्तता; पारिवारिक संवाद में धैर्य और शांति बनाए रखें। |
| **5th (पंचम — बुद्धि/संतान)** | **Mixed (मिश्रित)** | Reflective creative energy; avoid speculative risk and overthinking in romance. | चिंतनशील प्रवृत्ति; शेयर/सट्टे या जल्दबाजी के निवेश से बचें तथा प्रेम संबंधों में स्पष्ट संवाद रखें। |
| **6th (षष्ठ — रोग/रिपु विजय)** | **Favourable (शुभ)** | Overcoming obstacles and competitors, clearing pending tasks, and strong recovery/immunity. | विरोधियों और बाधाओं पर विजय, रुके कार्यों की पूर्ति, स्वास्थ्य में सुधार और कार्यक्षेत्र में सफलता। |
| **7th (सप्तम — कलत्र/व्यापार)** | **Favourable (शुभ)** | Harmony in marriage/partnerships, profitable client dealings, and respected social standing. | दांपत्य जीवन में मधुरता, साझेदारी व व्यापार में लाभ तथा सामाजिक प्रतिष्ठा में वृद्धि। |
| **8th (अष्टम — चन्द्राष्टम)** | **Unfavourable (चन्द्राष्टम)** | *Chandra Ashtama*: Pause major launches or high-risk ventures for ~54 hours; prioritize rest, patience, and spiritual sadhana. | **चन्द्राष्टम**: आज बड़े जोखिम, नए अनुबंध या विवाद से बचें; धैर्य, विश्राम और इष्ट-स्मरण को प्राथमिकता दें। |
| **9th (नवम — धर्म/भाग्य)** | **Mixed (मिश्रित)** | Inclination toward dharma, study, mentorship, and long-term planning through steady effort. | धर्म-कर्म, स्वाध्याय और वरिष्ठजनों के मार्गदर्शन से लाभ; निरंतर परिश्रम से भाग्य का सहयोग। |
| **10th (दशम — कर्म/राज्य)** | **Favourable (शुभ)** | Career fulfillment, authority, appreciation from seniors, and execution of key goals. | कर्मक्षेत्र में उन्नति, अधिकारियों से सराहना, पद-प्रतिष्ठा और महत्वपूर्ण लक्ष्यों की सिद्धि। |
| **11th (एकादश — लाभ भाव)** | **Favourable (अति शुभ)** | Financial gains, fulfillment of desires, networking success, and joyful family gatherings. | आय के स्रोतों में वृद्धि, मनोकामना पूर्ति, मित्रों से लाभ और पारिवारिक हर्षोल्लास। |
| **12th (द्वादश — व्यय/ध्यान)** | **Unfavourable (सावधानी)** | Watch unplanned expenses and sleep hygiene; channel energy into research, charity (Satvik Dana), and meditation. | आकस्मिक खर्चों और थकान से बचें; शोध कार्य, सात्विक दान और ध्यान-साधना के लिए समय अनुकूल। |

---

## 4. Explicit Domain Scoring Formula (चारों क्षेत्रों के अंक निर्धारण का सूत्र)

Every domain score (`Love`, `Career`, `Health`, `Finance`, and `Family`) starts from a transparent **Baseline of `68`** (bounded to `45..96`) and adds/subtracts exact rule-based points:

1. **Naisargika Maitri (राशि स्वामी एवं वारेश/नक्षत्रेश मैत्री — *BPHS* Ch. 3)**:
   - Rashi Lord is a natural friend (`Mitrata`) of today's Weekday Lord (`Vara Lord`): **`+3`** (Enemy: **`-2`**)
   - Rashi Lord is a natural friend (`Mitrata`) of today's Nakshatra Lord: **`+3`** (Enemy: **`-2`**)

2. **Chandra Gochar House Impact (चन्द्र गोचर भाव प्रभाव)**:
   - Transiting Moon is in a **Primary House** for that domain: **`+10`**
   - Transiting Moon is in another **Favourable House** (`1, 3, 6, 7, 10, 11`): **`+6`**
   - Transiting Moon is in a **Challenging House** for that domain (`6, 8, 12` or `4`): **`-8`**

3. **Domain Karaka Planet Gochar (क्षेत्र के कारक ग्रहों का गोचर बल)**:
   - Each Domain Karaka in a `Favourable` house: **`+5`** (`+3` if Combust / अस्त)
   - Each Domain Karaka in a `Mixed` house: **`+1`**
   - Each Domain Karaka in an `Unfavourable` house: **`-3`**

4. **Benefic Occupation of Primary Houses (शुभ ग्रहों की उपस्थिति)**:
   - Each primary house occupied by a natural benefic (`Jupiter / गुरु`, `Venus / शुक्र`, `Mercury / बुध`): **`+3`**

| Domain (क्षेत्र) | Primary Houses from Moon (मुख्य भाव) | Challenging Houses (चुनौतीपूर्ण भाव) | Domain Karaka Planets (कारक ग्रह) |
| :--- | :--- | :--- | :--- |
| **Love & Relationships (प्रेम एवं दांपत्य)** | `7, 5, 1, 11` | `6, 8, 12` | **Venus (शुक्र)**, **Jupiter (गुरु)**, **Moon (चन्द्र)** |
| **Career & Profession (करियर एवं व्यवसाय)** | `10, 6, 11, 3` | `8, 12, 4` | **Saturn (शनि)**, **Sun (सूर्य)**, **Mercury (बुध)**, **Mars (मंगल)** |
| **Health & Vitality (स्वास्थ्य एवं ऊर्जा)** | `1, 3, 6, 11` | `8, 12, 4` | **Sun (सूर्य)**, **Moon (चन्द्र)**, **Mars (मंगल)**, **Saturn (शनि)** |
| **Finance & Wealth (आर्थिक एवं धन)** | `2, 11, 9, 5` | `12, 8, 6` | **Jupiter (गुरु)**, **Venus (शुक्र)**, **Mercury (बुध)** |
