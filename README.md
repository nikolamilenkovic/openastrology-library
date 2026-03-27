# openastrology-library

A comprehensive astrology calculation library - **Vedic** and **Western** - powered by Swiss Ephemeris for high-precision astronomical calculations.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![npm version](https://badge.fury.io/js/openastrology-library.svg)](https://www.npmjs.com/package/openastrology-library)

## Features

### Vedic Astrology (`VedicAstrologyCalculator`)
- **Birth Chart** - Sidereal Rashi charts with multiple ayanamsa systems (Lahiri, Raman, Krishnamurti, etc.)
- **Divisional Charts** - All 16 major Vargas (D1–D60) accessible directly from the calculator
- **Dasha Systems** - Vimshottari Dasha with Maha Dasha and Antar Dasha
- **Yogas** - Raja, Dhana, Neecha Bhanga, Panch Mahapurusha, Arishta
- **Ashtakavarga** - Bhinna & Sarva Ashtakavarga
- **Vedic Aspects** - House-based Drishti with mutual reception
- **Nakshatras** - Full nakshatra and pada calculations
- **House Systems** - Whole Sign, Equal, Placidus, Koch, and more

### Western Astrology (`WesternAstrologyCalculator`)
- **Birth Chart** - Tropical chart with 12 planets (Sun–Pluto + Chiron + True Node)
- **Aspects** - All major and minor aspects with configurable orbs (conjunction, sextile, square, trine, opposition, quincunx, semi-sextile, semi-square, sesquiquadrate, quintile, biquintile)
- **Chart Patterns** - Grand Trine, T-Square, Grand Cross, Stellium, Yod
- **Western Dignities** - Domicile, Exalted, Detriment, Fall (including modern planet rulerships)
- **House Systems** - Placidus (default), Koch, Equal, and more

### Shared
- **Timezone Support** - Automatic timezone and DST handling via Luxon
- **High Precision** - Swiss Ephemeris astronomical accuracy

## Installation

```bash
npm install openastrology-library
```

## Swiss Ephemeris Files

This library uses [Swiss Ephemeris](https://www.astro.com/swisseph/) for astronomical calculations. The ephemeris data files (`.se1`) are **not bundled** with the package due to the Swiss Ephemeris licensing terms - you must supply them yourself.

### Obtaining the files

Download the ephemeris files from Astrodienst AG:

- **Full archive**: https://www.astro.com/ftp/swisseph/ephe/
- For standard date ranges (1800–2400 AD), you need:
  - `sepl_*.se1` - main planets (Sun through Pluto)
  - `semo_*.se1` - Moon
  - `seas_*.se1` - small bodies, **required for Chiron** (Western charts)

Place the downloaded `.se1` files into a directory in your project, e.g. `./ephe/`.

### Passing the path to the calculator

Provide the absolute path via the `ephePath` option when constructing a calculator:

```typescript
import path from 'path';
import { VedicAstrologyCalculator, WesternAstrologyCalculator } from 'openastrology-library';

const ephePath = path.resolve(__dirname, 'ephe'); // directory containing your .se1 files

const vedic = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', ephePath });
const western = new WesternAstrologyCalculator({ houseSystem: 'placidus', ephePath });
```

> **Note for contributors / local development**: a set of ephemeris files is included in `src/ephe/` for convenience during development. These files are intentionally excluded from the published package.

## Quick Start

### Vedic Astrology

```typescript
import { VedicAstrologyCalculator, BirthInfo } from 'openastrology-library';

const birthInfo: BirthInfo = {
  name: 'John Doe',
  dateOfBirth: '1990-05-15',
  timeOfBirth: '14:30',
  location: 'New York, USA',
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
console.log('Sun position:', chart.planets.sun);
console.log('Moon nakshatra:', chart.planets.moon.nakshatra);
console.log('Active yogas:', chart.yogas.map(y => y.name));

// Divisional charts - accessed directly from the calculator
const navamsa = vedic.calculateDivisionalChart(chart, 'D9');
const dasamsa = vedic.calculateDivisionalChart(chart, 'D10');

// Dasha timing
const currentDasha = vedic.getCurrentDasha(chart.dashas.vimshottari, new Date());
console.log('Current Maha Dasha:', currentDasha.mahaDasha?.planet);

vedic.dispose();
```

### Western Astrology

```typescript
import { WesternAstrologyCalculator, BirthInfo } from 'openastrology-library';

const western = new WesternAstrologyCalculator({
  houseSystem: 'placidus',
  orbs: { conjunction: 10 } // optional custom orb overrides
});

const chart = await western.calculateChart(birthInfo);

console.log('Ascendant:', chart.ascendant.sign);
console.log('Uranus sign:', chart.planets.uranus.sign);
console.log('True Node:', chart.planets.true_node.sign);
console.log('Aspects:', chart.aspects.map(a => `${a.planet1} ${a.type} ${a.planet2}`));
console.log('Patterns:', chart.patterns.map(p => p.description));

western.dispose();
```

## Documentation

- 🪐 **[Vedic Astrology Documentation](./DOCS_VEDIC.md)** - VedicAstrologyCalculator, divisional charts, dashas, yogas, ashtakavarga
- ☀️ **[Western Astrology Documentation](./DOCS_WESTERN.md)** - WesternAstrologyCalculator, aspects, chart patterns, dignities

## License

This library follows the Swiss Ephemeris licensing model:

- **AGPL-3.0** (default) - Free for open source projects
- **LGPL-3.0** - For commercial use if you own a Swiss Ephemeris professional license

See [LICENSING.md](LICENSING.md) for detailed information.

### Quick Guide:
- ✅ Open source project? Use the free AGPL-3.0 license
- ⚠️ Commercial/proprietary app? Get a Swiss Ephemeris professional license from [Astrodienst AG](https://www.astro.com/swisseph/), then use this library under LGPL-3.0
- 💰 **No payment needed to this library** - only to Astrodienst AG for Swiss Ephemeris

## Credits

- **Swiss Ephemeris** by Astrodienst AG
- **swisseph** Node.js bindings
- **Luxon** for timezone handling

## Contributing

Contributions are welcome! This library is part of the OpenAstrology project.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

- 📧 Issues: [GitHub Issues](https://github.com/nikolamilenkovic/openastrology-library/issues)
- 🪐 Vedic docs: [DOCS_VEDIC.md](./DOCS_VEDIC.md)
- ☀️ Western docs: [DOCS_WESTERN.md](./DOCS_WESTERN.md)

---

Made with ❤️ for the astrology community
