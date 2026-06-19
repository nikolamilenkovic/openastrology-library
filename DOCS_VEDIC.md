# openastrology-library - Vedic Astrology Documentation

Complete documentation for the Vedic (sidereal) astrology module.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [VedicAstrologyCalculator](#vedicastrologycalculator)
  - [VedicTransitCalculator](#vedicransitcalculator)
  - [Sub-Calculators](#sub-calculators)
- [Utility Classes](#utility-classes)
- [Types Reference](#types-reference)
- [Examples](#examples)

---

## Installation

```bash
npm install openastrology-library
```

### Swiss Ephemeris Files

This library uses [Swiss Ephemeris](https://www.astro.com/swisseph/) for astronomical calculations. The ephemeris data files (`.se1`) are **not bundled** with the package - you must supply them yourself.

Download from Astrodienst AG: https://www.astro.com/ftp/swisseph/ephe/

For standard date ranges (1800–2400 AD), you need:
- `sepl_*.se1` - main planets (Sun through Pluto)
- `semo_*.se1` - Moon

Place the files in a directory in your project (e.g. `./ephe/`) and provide the path:

```typescript
import path from 'path';
import { VedicAstrologyCalculator } from 'openastrology-library';

const vedic = new VedicAstrologyCalculator({
  ayanamsa: 'lahiri',
  ephePath: path.resolve(__dirname, 'ephe')
});
```

---

## Quick Start

```typescript
import { VedicAstrologyCalculator, BirthInfo } from 'openastrology-library';

const birthInfo: BirthInfo = {
  name: 'John Doe',
  dateOfBirth: '1990-05-15',
  timeOfBirth: '14:30',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York'
};

const vedic = new VedicAstrologyCalculator({
  ayanamsa: 'lahiri',
  houseSystem: 'wholehouse'
});

const chart = await vedic.calculateChart(birthInfo);

console.log('Ascendant:', chart.ascendant.sign);
console.log('Sun position:', chart.planets.sun.sign, chart.planets.sun.degreeDMSFormatted);
console.log('Moon nakshatra:', chart.planets.moon.nakshatra);
console.log('Active yogas:', chart.yogas.map(y => y.name));

// Divisional charts
const navamsa = vedic.calculateDivisionalChart(chart, 'D9');

// Ashtakavarga
const ashtakavarga = vedic.calculateAshtakavarga(chart);

// Dasha timing
const currentDasha = vedic.getCurrentDasha(chart.dashas.vimshottari, new Date());
console.log('Current Maha Dasha:', currentDasha.mahaDasha?.planet);

vedic.dispose();
```

---

## API Reference

### VedicAstrologyCalculator

The primary class for Vedic (sidereal) birth chart calculations. Exposes all Vedic sub-calculators as a single facade.

#### Constructor

```typescript
const vedic = new VedicAstrologyCalculator(options?: VedicAstrologyCalculatorOptions);
```

**Options:**
- `ayanamsa?: string` - Ayanamsa system (default: `'lahiri'`)
  - Options: `'lahiri'`, `'raman'`, `'krishnamurti'`, `'yukteshwar'`, `'jnbhasin'`, `'truecitra'`, `'truerevati'`, `'truepushya'`
- `houseSystem?: string` - House system (default: `'equal'`)
  - Options: `'wholehouse'`, `'equal'`, `'placidus'`, `'koch'`, `'campanus'`, `'meridian'`, `'regiomontanus'`, `'porphyrius'`, `'morinus'`
- `ephePath?: string` - Absolute path to directory containing `.se1` ephemeris files

#### Methods

##### `calculateChart(birthInfo)` → `Promise<VedicChartCalculations>`

Calculate a complete Vedic birth chart including planets, houses, nakshatras, yogas, dashas, and ashtakavarga.

##### `calculateDivisionalChart(chart, type)` → `VedicChartCalculations`

Calculate a divisional chart (Varga). `type` is a string like `'D9'`, `'D10'`, etc.

**Supported types:** D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D16, D20, D24, D27, D30, D40, D45, D60

##### `calculateAllDivisionalCharts(chart)` → `Record<string, VedicChartCalculations>`

Calculate all 19 supported divisional charts at once.

##### `calculateAshtakavarga(chart)` → `AshtakavargaCalculations`

Calculate Bhinna and Sarva Ashtakavarga from a birth chart.

```typescript
const ashtakavarga = vedic.calculateAshtakavarga(chart);
console.log('Sun BAV:', ashtakavarga.bhinna.sun);
console.log('Sarva Ashtakavarga:', ashtakavarga.sarva);
```

> Ashtakavarga is also pre-calculated on the chart as `chart.ashtakavarga`. Use this method when recalculating on a divisional chart.

##### `getCurrentDasha(dashas, date)` → `{ mahaDasha?, antarDasha? }`

Find the active Maha Dasha and Antar Dasha for a given date.

##### `getRemainingDashaTime(dasha, currentDate)` → `{ years, months, days }`

Get the remaining time in a dasha period.

##### `getDashaLord(nakshatra)` → `Planet`

Get the dasha lord planet for a given nakshatra.

##### `getMutualReception(planets)` → `Array<{ planet1, planet2 }>`

Find planets in mutual reception (exchange of sign lords).

##### `getPlanetAspects(planet)` → `number[]`

Get the Vedic aspect house distances cast by a planet.

##### `getAspectDescription(planet, aspects)` → `string`

Get a human-readable description of a planet's aspects.

##### `getCombustionInfo(planetName, planetLongitude, sunLongitude)`

Get detailed combustion information for a planet.

```typescript
const info = vedic.getCombustionInfo(
  'mercury',
  chart.planets.mercury.longitude,
  chart.planets.sun.longitude
);
// { isCombust: true, distance: 5.2, combustionDistance: 14, severity: 'Moderate' }
```

Returns: `{ isCombust, distance, combustionDistance, severity? }`
Severity values: `'Mild'` | `'Moderate'` | `'Severe'`

##### `dispose()`

Release Swiss Ephemeris resources. Always call when done.

---

## VedicTransitCalculator

Finds every sidereal sign-ingress event (gochar) for one or more Vedic planets over a date range. Results are precise to the second.

```typescript
import { VedicTransitCalculator } from 'openastrology-library';

const transit = new VedicTransitCalculator({ ayanamsa: 'lahiri' });
```

### Constructor

```typescript
new VedicTransitCalculator(options?: VedicTransitCalculatorOptions)
```

**Options:**
- `ayanamsa?: string` — Ayanamsa system (default: `'lahiri'`). Same values as `VedicAstrologyCalculator`.
- `ephePath?: string` — Absolute path to directory containing `.se1` ephemeris files.

### Methods

##### `calculateTransitIngresses(planets, startDate, endDate)` → `VedicTransitIngress[]`

Returns all sign-ingress events for the given planets in chronological order.

**Retrograde re-entries are included**: a planet that enters Gemini, retrogrades back into Taurus, then re-enters Gemini while turning direct will appear as three separate entries.

```typescript
const ingresses = transit.calculateTransitIngresses(
  ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'],
  new Date('2026-01-01'),
  new Date('2031-01-01')
);

ingresses.forEach(ing => {
  const retro = ing.isRetrograde ? ' (R)' : '';
  console.log(
    `${ing.planet.padEnd(8)} ${ing.fromSign} → ${ing.sign}` +
    `  ${ing.date.toISOString()}${retro}`
  );
});
```

##### `dispose()`

Release Swiss Ephemeris file handles. Call when done.

### Precision

| Planet | Method | Typical cost (5-year window) |
|--------|--------|------------------------------|
| Sun | `solcross_ut` | ~60 calls |
| Moon | `mooncross_ut` | ~811 calls |
| Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu | bisection on `calc_ut` | ~20 000 calls total |

All ingresses are precise to **≤1 second**.

---

## Sub-Calculators

All sub-calculators are also exported for direct use when needed:

```typescript
import {
  DivisionalChartCalculator,
  DashaCalculator,
  AshtakavargaCalculator,
  AspectCalculator,
  YogaCalculator
} from 'openastrology-library';
```

### DivisionalChartCalculator

| Chart | Name | Purpose |
|-------|------|---------|
| `D1` | Rashi | Birth Chart |
| `D2` | Hora | Wealth |
| `D3` | Drekkana | Siblings, courage |
| `D4` | Chaturthamsa | Fortune, property |
| `D5` | Panchamsa | Fame, authority |
| `D6` | Shashthamsa | Health, enemies |
| `D7` | Saptamsa | Children, creativity |
| `D8` | Ashtamsa | Longevity, sudden events |
| `D9` | Navamsa | Spouse, dharma |
| `D10` | Dasamsa | Career, profession |
| `D11` | Rudramsa | Destruction, death |
| `D12` | Dwadasamsa | Parents |
| `D16` | Shodasamsa | Vehicles, comforts |
| `D20` | Vimsamsa | Spiritual progress |
| `D24` | Chaturvimsamsa | Education, learning |
| `D27` | Saptavimsamsa | Strengths, weaknesses |
| `D30` | Trimsamsa | Evils, misfortune |
| `D40` | Khavedamsa | Auspicious effects |
| `D45` | Akshavedamsa | Character, conduct |
| `D60` | Shashtiamsa | Past life, karmic effects |

### DashaCalculator

##### `DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate)` → `VimshottariDasha`

```typescript
import { DashaCalculator } from 'openastrology-library';

const dashas = DashaCalculator.calculateVimshottariDasha(
  chart.planets.moon,
  new Date(birthInfo.dateOfBirth)
);
```

##### `DashaCalculator.getCurrentDasha(dasha, date)`

```typescript
const current = DashaCalculator.getCurrentDasha(chart.dashas.vimshottari, new Date());
console.log('Maha Dasha:', current.mahaDasha?.planet);
console.log('Antar Dasha:', current.antarDasha?.planet);
console.log('Pratyantar Dasha:', current.pratyantarDasha?.planet);
```

### AshtakavargaCalculator

##### `AshtakavargaCalculator.calculateAshtakavarga(planets, ascendantSign)` → `AshtakavargaCalculations`

```typescript
// Preferred: use the facade
const ashtakavarga = vedic.calculateAshtakavarga(chart);

// Direct static call (e.g. on a divisional chart)
import { AshtakavargaCalculator } from 'openastrology-library';
const ashtakavarga = AshtakavargaCalculator.calculateAshtakavarga(
  chart.planets,
  chart.ascendant.sign
);
```

##### `AshtakavargaCalculator.getAshtakavargaSummary(ashtakavarga)`

```typescript
const summary = AshtakavargaCalculator.getAshtakavargaSummary(ashtakavarga);
console.log('Total points:', summary.totalPoints);
console.log('Strongest sign:', summary.strongestSign);
console.log('Weakest sign:', summary.weakestSign);
```

---

## Utility Classes

### ZodiacUtils

```typescript
import { ZodiacUtils } from 'openastrology-library';

ZodiacUtils.getSignFromLongitude(120.5);  // 'leo'
ZodiacUtils.getSignLord('leo');            // 'sun'
ZodiacUtils.getSignElement('aries');       // 'fire'
ZodiacUtils.getSignQuality('taurus');      // 'fixed'
ZodiacUtils.getDegreeInSign(125.5);        // 5.5
```

### NakshatraUtils

```typescript
import { NakshatraUtils } from 'openastrology-library';

NakshatraUtils.getNakshatraFromLongitude(45.8);  // 'rohini'
NakshatraUtils.getNakshatraPada(45.8);            // 2
NakshatraUtils.getNakshatraLord('ashwini');        // 'ketu'
NakshatraUtils.getNakshatraElement('bharani');     // 'earth'
```

### HouseUtils

```typescript
import { HouseUtils } from 'openastrology-library';

HouseUtils.getHouseSignificance(10);
// ['career', 'profession', 'status', 'father', 'government']
```

### FormattingUtils

```typescript
import { FormattingUtils } from 'openastrology-library';

FormattingUtils.convertToDMS(15.5);            // { degrees: 15, minutes: 30, seconds: 0 }
FormattingUtils.formatDMS(15, 30, 45);         // "15:30:45"
FormattingUtils.formattedDMStoDegrees('15:30:45'); // 15.5125
```

---

## Types Reference

### BirthInfo

```typescript
interface BirthInfo {
  name: string;
  dateOfBirth: string;   // YYYY-MM-DD
  timeOfBirth: string;   // HH:MM (24-hour)
  latitude: number;      // -90 to 90
  longitude: number;     // -180 to 180
  timezone: string;      // IANA timezone e.g. 'America/New_York'
  gender?: 'male' | 'female';
}
```

### VedicChartCalculations

```typescript
interface VedicChartCalculations {
  birthDateUtc: Date;
  planets: Record<Planet, PlanetPosition>;
  houses: Record<HouseNumber, HouseInfo>;
  yogas: Yoga[];
  ayanamsa: number;
  ascendant: {
    sign: ZodiacSign;
    degree: number;
    degreeDMSFormatted: string;
    nakshatra: Nakshatra;
    nakshatraPada: number;
    longitude: number;
  };
  ashtakavarga: AshtakavargaCalculations;
  dashas: {
    vimshottari: VimshottariDasha;
  };
}
```

### PlanetPosition

```typescript
interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  sign: ZodiacSign;
  degree: number;
  degreeDMS: { degrees: number; minutes: number; seconds: number };
  degreeDMSFormatted: string;
  nakshatra: Nakshatra;
  nakshatraPada: number;
  pada: number;
  house: HouseNumber;
  isRetrograde: boolean;
  isCombust: boolean;
  speed: number;
  dignity: VedicDignity; // 'exalted' | 'debilitated' | 'own_sign' | 'neutral'
  aspects: Aspect[];
}
```

### VedicTransitIngress

```typescript
interface VedicTransitIngress {
  planet: Planet;        // Vedic planet name
  sign: ZodiacSign;      // sign entered
  fromSign: ZodiacSign;  // sign it was in before
  date: Date;            // UTC, second-level precision
  jd: number;            // Julian Day (UT) of the ingress
  isRetrograde: boolean; // true if planet was retrograde at ingress
                         // Rahu and Ketu are always true
  longitude: number;     // sidereal ecliptic longitude at ingress (degrees)
}
```

### VedicTransitCalculatorOptions

```typescript
interface VedicTransitCalculatorOptions {
  ayanamsa?: string;  // default: 'lahiri'
  ephePath?: string;
}
```

### Planet

```typescript
type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' |
              'jupiter' | 'saturn' | 'rahu' | 'ketu';
```

### ZodiacSign

```typescript
type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' |
                  'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
```

### Nakshatra

```typescript
type Nakshatra =
  'ashwini' | 'bharani' | 'krittika' | 'rohini' | 'mrigashira' |
  'ardra' | 'punarvasu' | 'pushya' | 'ashlesha' | 'magha' |
  'purva phalguni' | 'uttara phalguni' | 'hasta' | 'chitra' | 'swati' |
  'vishakha' | 'anuradha' | 'jyeshtha' | 'mula' | 'purva ashadha' |
  'uttara ashadha' | 'shravana' | 'dhanishta' | 'shatabhisha' |
  'purva bhadrapada' | 'uttara bhadrapada' | 'revati';
```

### HouseInfo

```typescript
interface HouseInfo {
  number: HouseNumber;
  cusp: number;
  sign: ZodiacSign;
  lord: Planet;
  planets: string[];
  strength: number;
  significance: string[];
}
```

---

## Examples

### Different Ayanamsa and House Systems

```typescript
// Lahiri + Whole Sign (traditional)
const lahiri = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'wholehouse' });

// Raman + Equal
const raman = new VedicAstrologyCalculator({ ayanamsa: 'raman', houseSystem: 'equal' });

// KP system (Krishnamurti + Placidus)
const kp = new VedicAstrologyCalculator({ ayanamsa: 'krishnamurti', houseSystem: 'placidus' });
```

### Divisional Charts

```typescript
const vedic = new VedicAstrologyCalculator();
const chart = await vedic.calculateChart(birthInfo);

const navamsa    = vedic.calculateDivisionalChart(chart, 'D9');   // Spouse / dharma
const dasamsa    = vedic.calculateDivisionalChart(chart, 'D10');  // Career
const dwadasamsa = vedic.calculateDivisionalChart(chart, 'D12');  // Parents

console.log('D9 Moon:', navamsa.planets.moon.sign);
console.log('D10 Sun:', dasamsa.planets.sun.sign);
console.log('D12 Jupiter:', dwadasamsa.planets.jupiter.sign);

vedic.dispose();
```

### Current Dasha Period

```typescript
const vedic = new VedicAstrologyCalculator();
const chart = await vedic.calculateChart(birthInfo);

const current = vedic.getCurrentDasha(chart.dashas.vimshottari, new Date());

console.log('Maha Dasha:', current.mahaDasha?.planet);
console.log('  From:', current.mahaDasha?.startDate);
console.log('  To:',   current.mahaDasha?.endDate);
console.log('Antar Dasha:', current.antarDasha?.planet);

const remaining = vedic.getRemainingDashaTime(current.mahaDasha!, new Date());
console.log(`Remaining: ${remaining.years}y ${remaining.months}m ${remaining.days}d`);

vedic.dispose();
```

### Yogas

```typescript
const vedic = new VedicAstrologyCalculator();
const chart = await vedic.calculateChart(birthInfo);

chart.yogas.filter(y => y.type === 'Raja').forEach(yoga => {
  console.log(`${yoga.name}: ${yoga.description}`);
});

vedic.dispose();
```

### Ashtakavarga

```typescript
const vedic = new VedicAstrologyCalculator();
const chart = await vedic.calculateChart(birthInfo);

const ashtakavarga = vedic.calculateAshtakavarga(chart);
const summary = AshtakavargaCalculator.getAshtakavargaSummary(ashtakavarga);

console.log('Strongest sign:', summary.strongestSign);
console.log('Weakest sign:', summary.weakestSign);

// Bhinna Ashtakavarga per sign for Moon
ashtakavarga.bhinna.moon.sun.forEach((points, i) => {
  const sign = ZodiacUtils.getSignFromLongitude(i * 30);
  console.log(`  ${sign}: ${points}`);
});

vedic.dispose();
```

### Combustion Check

```typescript
const vedic = new VedicAstrologyCalculator();
const chart = await vedic.calculateChart(birthInfo);

Object.entries(chart.planets).forEach(([name, planet]) => {
  if (planet.isCombust) {
    const info = vedic.getCombustionInfo(
      name as Planet,
      planet.longitude,
      chart.planets.sun.longitude
    );
    console.log(`${name}: ${info.severity} combustion (${info.distance.toFixed(1)}° from Sun)`);
  }
});

vedic.dispose();
```

### Planetary Aspects

```typescript
const vedic = new VedicAstrologyCalculator();
const chart = await vedic.calculateChart(birthInfo);

// Mars aspects 4th, 7th, and 8th houses from its position
// Jupiter aspects 5th, 7th, and 9th houses from its position
chart.planets.jupiter.aspects.forEach(aspect => {
  console.log(`Jupiter aspects house ${aspect.house}`);
  if (aspect.aspectingPlanets.length > 0)
    console.log('  Also aspected by:', aspect.aspectingPlanets.join(', '));
});

vedic.dispose();
```

### Complete Chart Analysis

```typescript
const vedic = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'wholehouse' });
const chart = await vedic.calculateChart(birthInfo);

console.log(`Ayanamsa: ${chart.ayanamsa.toFixed(4)}°`);
console.log(`Ascendant: ${chart.ascendant.sign} ${chart.ascendant.degreeDMSFormatted}`);
console.log(`  Nakshatra: ${chart.ascendant.nakshatra} pada ${chart.ascendant.nakshatraPada}`);

Object.entries(chart.planets).forEach(([name, p]) => {
  const retro = p.isRetrograde ? ' (R)' : '';
  const combust = p.isCombust ? ' (combust)' : '';
  console.log(`${name.padEnd(8)} ${p.sign.padEnd(12)} ${p.degreeDMSFormatted}  H${p.house}  ${p.nakshatra}${retro}${combust}`);
});

vedic.dispose();
```

---

### Transit Ingresses (Gochar)

```typescript
import { VedicTransitCalculator } from 'openastrology-library';

const transit = new VedicTransitCalculator({ ayanamsa: 'lahiri' });

// Find all sign changes for all 9 Vedic planets over the next 5 years
const ingresses = transit.calculateTransitIngresses(
  ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'],
  new Date('2026-01-01'),
  new Date('2031-01-01')
);

// Filter to Jupiter and Saturn only (slow, significant transits)
const outerPlanetIngresses = ingresses.filter(
  ing => ing.planet === 'jupiter' || ing.planet === 'saturn'
);

outerPlanetIngresses.forEach(ing => {
  console.log(
    `${ing.planet} enters ${ing.sign} on ${ing.date.toDateString()}` +
    (ing.isRetrograde ? ' (retrograde)' : ' (direct)')
  );
});

// Makar Sankranti: Sun entering Capricorn
const makarSankranti = ingresses.find(
  ing => ing.planet === 'sun' && ing.sign === 'capricorn'
);
console.log('Makar Sankranti 2026:', makarSankranti?.date.toDateString());

// Rahu/Ketu axis ingresses (always retrograde)
const rahuIngresses = ingresses.filter(ing => ing.planet === 'rahu');
console.log(`Rahu sign changes: ${rahuIngresses.length}`);

transit.dispose();
```

---

For issues and updates visit the [GitHub repository](https://github.com/nikolamilenkovic/openastrology-library).
