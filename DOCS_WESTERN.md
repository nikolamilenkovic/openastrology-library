# openastrology-library - Western Astrology Documentation

Complete documentation for the Western (tropical) astrology module.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [WesternAstrologyCalculator](#westernastrologycalculator)
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
- `seas_*.se1` - small bodies, **required for Chiron**

Place the files in a directory in your project (e.g. `./ephe/`) and provide the path:

```typescript
import path from 'path';
import { WesternAstrologyCalculator } from 'openastrology-library';

const western = new WesternAstrologyCalculator({
  houseSystem: 'placidus',
  ephePath: path.resolve(__dirname, 'ephe')
});
```

---

## Quick Start

```typescript
import { WesternAstrologyCalculator, BirthInfo } from 'openastrology-library';

const birthInfo: BirthInfo = {
  name: 'Jane Doe',
  dateOfBirth: '1990-05-15',
  timeOfBirth: '14:30',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York'
};

const western = new WesternAstrologyCalculator({
  houseSystem: 'placidus',
  orbs: { conjunction: 10 }  // optional custom orb overrides
});

const chart = await western.calculateChart(birthInfo);

console.log('Ascendant:', chart.ascendant.sign, chart.ascendant.degreeDMSFormatted);
console.log('Sun:', chart.planets.sun.sign, chart.planets.sun.degreeDMSFormatted);
console.log('True Node:', chart.planets.true_node.sign);
console.log('Aspects:', chart.aspects.map(a => `${a.planet1} ${a.type} ${a.planet2}`));
console.log('Patterns:', chart.patterns.map(p => p.description));

western.dispose();
```

---

## API Reference

### WesternAstrologyCalculator

The primary class for Western (tropical) birth chart calculations.

#### Constructor

```typescript
const western = new WesternAstrologyCalculator(options?: WesternAstrologyCalculatorOptions);
```

**Options:**
- `houseSystem?: string` - House system (default: `'placidus'`)
  - Options: `'placidus'`, `'koch'`, `'equal'`, `'campanus'`, `'regiomontanus'`, `'porphyrius'`, `'morinus'`, `'wholehouse'`
- `orbs?: Partial<Record<WesternAspectType, number>>` - Override default orbs in degrees
- `ephePath?: string` - Absolute path to directory containing `.se1` ephemeris files

#### Methods

##### `calculateChart(birthInfo)` → `Promise<WesternChartCalculations>`

Calculate a complete Western tropical birth chart with 12 planets (Sun–Pluto + Chiron + True Node), aspects, and chart patterns.

**Result:**

```typescript
{
  birthDateUtc: Date;
  planets: Record<WesternPlanet, WesternPlanetPosition>;
  houses: Record<HouseNumber, HouseInfo>;
  ascendant: WesternAscendant;
  aspects: WesternAspect[];
  patterns: ChartPattern[];
}
```

##### `getAspectsBetween(planets)` → `WesternAspect[]`

Recalculate aspects for a given set of planet positions (useful after manual edits).

##### `getAspectOrbs()` → `Record<WesternAspectType, number>`

Get the effective orb map - defaults merged with any constructor overrides.

```typescript
const orbs = western.getAspectOrbs();
console.log('Conjunction orb:', orbs.conjunction); // 8 (default)
```

##### `detectPatterns(planets, aspects)` → `ChartPattern[]`

Detect chart patterns from a set of planet positions and their pre-calculated aspects.

##### `dispose()`

Release Swiss Ephemeris resources. Always call when done.

---

## Sub-Calculators

Exported for direct use when needed:

```typescript
import { WesternAspectCalculator, ChartPatternCalculator } from 'openastrology-library';
```

### WesternAspectCalculator

##### `WesternAspectCalculator.calculateAspects(planets, customOrbs?)` → `WesternAspect[]`

Calculate all aspects between a set of planet positions.

### ChartPatternCalculator

##### `ChartPatternCalculator.detectPatterns(planets, aspects)` → `ChartPattern[]`

Detect geometric patterns (Grand Trine, T-Square, Grand Cross, Stellium, Yod).

### Default Orbs

| Aspect | Angle | Default Orb |
|--------|-------|-------------|
| Conjunction | 0° | 8° |
| Semi-sextile | 30° | 2° |
| Semi-square | 45° | 2° |
| Sextile | 60° | 6° |
| Quintile | 72° | 2° |
| Square | 90° | 8° |
| Trine | 120° | 8° |
| Sesquiquadrate | 135° | 2° |
| Biquintile | 144° | 2° |
| Quincunx | 150° | 3° |
| Opposition | 180° | 8° |

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

### FormattingUtils

Useful for converting between the `"DD:MM:SS"` format used in `degreeDMSFormatted` and decimal degrees.

```typescript
import { FormattingUtils } from 'openastrology-library';

// Convert decimal degrees to DMS object
FormattingUtils.convertToDMS(15.5);            // { degrees: 15, minutes: 30, seconds: 0 }

// Format DMS as "DD:MM:SS" string
FormattingUtils.formatDMS(15, 30, 45);         // "15:30:45"

// Convert "DD:MM:SS" string to decimal degrees
FormattingUtils.formattedDMStoDegrees('15:30:45'); // 15.5125
```

**Computing absolute longitude from astro.com output:**

Astro.com shows planet positions as sign + degree, e.g. *Capricorn 11°19'59"*.
Convert to the library's 0–360° longitude with:

```typescript
const signIndex: Record<string, number> = {
  aries: 0, taurus: 1, gemini: 2, cancer: 3, leo: 4, virgo: 5,
  libra: 6, scorpio: 7, sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11
};

const longitude = signIndex['capricorn'] * 30 + FormattingUtils.formattedDMStoDegrees('11:19:59');
// 9 * 30 + 11.333 = 281.333°
```

---

## Types Reference

### BirthInfo

```typescript
interface BirthInfo {
  name: string;
  dateOfBirth: string;   // YYYY-MM-DD
  timeOfBirth: string;   // HH:MM (24-hour)
  latitude: number;      // -90 to 90  (Google Maps shows lat first)
  longitude: number;     // -180 to 180
  timezone: string;      // IANA timezone e.g. 'Europe/London'
  gender?: 'male' | 'female';
}
```

### WesternPlanet

```typescript
type WesternPlanet =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
  | 'chiron' | 'true_node';
```

### WesternPlanetPosition

```typescript
interface WesternPlanetPosition {
  name: WesternPlanet;
  longitude: number;          // 0–360 tropical degrees
  latitude: number;
  sign: ZodiacSign;
  degree: number;             // degree within sign (0–30)
  degreeDMS: { degrees: number; minutes: number; seconds: number };
  degreeDMSFormatted: string; // "DD:MM:SS"
  house: HouseNumber;
  isRetrograde: boolean;
  speed: number;              // degrees per day (negative = retrograde)
  dignity: 'Exalted' | 'Domicile' | 'Detriment' | 'Fall' | 'Neutral';
  aspects: WesternAspect[];   // aspects this planet participates in
}
```

### WesternAspect

```typescript
interface WesternAspect {
  planet1: WesternPlanet;
  planet2: WesternPlanet;
  type: WesternAspectType;
  angle: number;       // actual angular separation
  orb: number;         // deviation from exact aspect angle
  maxOrb: number;      // allowed maximum orb for this aspect type
  isApplying: boolean; // true = planets moving toward exact aspect
}
```

### WesternAspectType

```typescript
type WesternAspectType =
  | 'conjunction' | 'semi-sextile' | 'semi-square' | 'sextile'
  | 'quintile' | 'square' | 'trine' | 'sesquiquadrate'
  | 'biquintile' | 'quincunx' | 'opposition';
```

### ChartPattern

```typescript
interface ChartPattern {
  type: 'grand-trine' | 't-square' | 'grand-cross' | 'stellium' | 'yod';
  planets: WesternPlanet[];
  description: string;
  element?: 'fire' | 'earth' | 'air' | 'water'; // for grand trines
}
```

### WesternAscendant

```typescript
interface WesternAscendant {
  sign: ZodiacSign;
  degree: number;
  degreeDMSFormatted: string;
  longitude: number;
}
```

### ZodiacSign

```typescript
type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
```

### HouseInfo

```typescript
interface HouseInfo {
  number: HouseNumber;
  cusp: number;         // tropical longitude of the house cusp (0–360)
  sign: ZodiacSign;
  lord: string;
  planets: string[];    // planet names occupying this house
  strength: number;     // 0–100 (angular 70, succedent 55, cadent 40)
  significance: string[];
}
```

---

## Examples

### Different House Systems

```typescript
const placidus     = new WesternAstrologyCalculator({ houseSystem: 'placidus' });
const koch         = new WesternAstrologyCalculator({ houseSystem: 'koch' });
const equal        = new WesternAstrologyCalculator({ houseSystem: 'equal' });
const wholehouse   = new WesternAstrologyCalculator({ houseSystem: 'wholehouse' });
```

### Custom Orbs

```typescript
const western = new WesternAstrologyCalculator({
  orbs: {
    conjunction: 10,
    opposition: 10,
    trine: 8,
    square: 8,
    sextile: 6
  }
});
```

### Inspect All Planets

```typescript
const western = new WesternAstrologyCalculator();
const chart = await western.calculateChart(birthInfo);

Object.entries(chart.planets).forEach(([name, planet]) => {
  const retro = planet.isRetrograde ? ' (R)' : '';
  console.log(
    `${name.padEnd(10)} ${planet.sign.padEnd(12)} ` +
    `${planet.degreeDMSFormatted}  H${planet.house}  ` +
    `${planet.dignity}${retro}`
  );
});

western.dispose();
```

### Filter Aspects by Type

```typescript
const western = new WesternAstrologyCalculator();
const chart = await western.calculateChart(birthInfo);

const conjunctions = chart.aspects.filter(a => a.type === 'conjunction');
const squares      = chart.aspects.filter(a => a.type === 'square');
const trines       = chart.aspects.filter(a => a.type === 'trine');

console.log('Conjunctions:');
conjunctions.forEach(a => console.log(`  ${a.planet1} ∘ ${a.planet2}  orb ${a.orb.toFixed(2)}°`));

western.dispose();
```

### Applying vs Separating Aspects

```typescript
const applying   = chart.aspects.filter(a => a.isApplying);
const separating = chart.aspects.filter(a => !a.isApplying);

console.log(`Applying: ${applying.length}, Separating: ${separating.length}`);
```

### Chart Patterns

```typescript
const western = new WesternAstrologyCalculator();
const chart = await western.calculateChart(birthInfo);

if (chart.patterns.length === 0) {
  console.log('No major chart patterns detected.');
} else {
  chart.patterns.forEach(p => {
    console.log(`${p.type}: ${p.planets.join(', ')}`);
    console.log(`  ${p.description}`);
    if (p.element) console.log(`  Element: ${p.element}`);
  });
}

western.dispose();
```

### True Node

```typescript
const western = new WesternAstrologyCalculator();
const chart = await western.calculateChart(birthInfo);

const node = chart.planets.true_node;
console.log(`True Node: ${node.sign} ${node.degreeDMSFormatted}  H${node.house}`);
console.log(`Retrograde: ${node.isRetrograde}`);

// Find aspects to the True Node
const nodeAspects = chart.aspects.filter(
  a => a.planet1 === 'true_node' || a.planet2 === 'true_node'
);
nodeAspects.forEach(a => {
  const other = a.planet1 === 'true_node' ? a.planet2 : a.planet1;
  console.log(`  ${other} ${a.type}  orb ${a.orb.toFixed(2)}°`);
});

western.dispose();
```

### Synastry (Two Charts)

```typescript
const western = new WesternAstrologyCalculator();

const chart1 = await western.calculateChart(person1BirthInfo);
const chart2 = await western.calculateChart(person2BirthInfo);

console.log('Sun signs:', chart1.planets.sun.sign, 'vs', chart2.planets.sun.sign);
console.log('Moon signs:', chart1.planets.moon.sign, 'vs', chart2.planets.moon.sign);
console.log('Ascendants:', chart1.ascendant.sign, 'vs', chart2.ascendant.sign);

western.dispose();
```

---

For issues and updates visit the [GitHub repository](https://github.com/nikolamilenkovic/openastrology-library).
