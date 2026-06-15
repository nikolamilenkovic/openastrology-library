import { set_ephe_path, set_sid_mode, julday, calc_ut, solcross_ut, mooncross_ut, revjul, close, constants } from 'sweph';
import { ZodiacUtils } from './astrological-utils';
import { Planet } from './types/vedic.types';
import { ZodiacSign } from './types/common.types';
import { VedicTransitIngress, VedicTransitCalculatorOptions } from './types/vedic-transit.types';

export { VedicTransitCalculatorOptions };

// ─── Ayanamsa map (mirrors vedic-astrology-calculator) ─────────────────────
const AYANAMSA_MAPPING: Record<string, number> = {
    lahiri:          constants.SE_SIDM_LAHIRI,
    raman:           constants.SE_SIDM_RAMAN,
    krishnamurti:    constants.SE_SIDM_KRISHNAMURTI,
    yukteshwar:      constants.SE_SIDM_YUKTESHWAR,
    jnbhasin:        constants.SE_SIDM_JN_BHASIN,
    babinaikamytry:  constants.SE_SIDM_BABYL_KUGLER1,
    truecitra:       constants.SE_SIDM_TRUE_CITRA,
    truerevati:      constants.SE_SIDM_TRUE_REVATI,
    truepushya:      constants.SE_SIDM_TRUE_PUSHYA,
};

// ─── Swiss Ephemeris IDs for Vedic planets ──────────────────────────────────
// Ketu has no dedicated SE ID — it is derived as (SE_TRUE_NODE + 180) % 360.
const PLANET_SE_ID: Record<Exclude<Planet, 'ketu'>, number> = {
    sun:     constants.SE_SUN,
    moon:    constants.SE_MOON,
    mercury: constants.SE_MERCURY,
    venus:   constants.SE_VENUS,
    mars:    constants.SE_MARS,
    jupiter: constants.SE_JUPITER,
    saturn:  constants.SE_SATURN,
    rahu:    constants.SE_TRUE_NODE,
};

// ─── Coarse step sizes in days for the bisection approach ───────────────────
// Each value must be small enough that no planet can traverse a full 30° sign
// in a single step — including during retrograde.
//
//  Moon:    ~15°/day max → 6h step gives ≤3.8° per sample  ✓
//  Mercury: ~2.2°/day direct, ~1.5°/day retrograde → 6h step gives ≤0.6°  ✓
//  Venus:   ~1.2°/day direct, ~0.6°/day retrograde → 12h step gives ≤0.6°  ✓
//  Mars:    ~0.7°/day direct, ~0.4°/day retrograde → 1d step gives ≤0.7°   ✓
//  Jupiter: ~0.24°/day → 5d step gives ≤1.2°                                ✓
//  Saturn:  ~0.13°/day → 7d step gives ≤0.9°                                ✓
//  Rahu/Ketu: ~0.05°/day retrograde → 7d step gives ≤0.35°                  ✓
const STEP_DAYS: Record<Planet, number> = {
    sun:     1.0,   // not used (solcross_ut), kept for completeness
    moon:    0.25,  // not used (mooncross_ut), kept for completeness
    mercury: 0.25,
    venus:   0.5,
    mars:    1.0,
    jupiter: 5.0,
    saturn:  7.0,
    rahu:    7.0,
    ketu:    7.0,
};

// 1 second expressed as a Julian Day fraction
const JD_SECOND = 1.0 / 86400.0;

// Calculation flags shared across all operations
const SIDEREAL_FLAGS       = constants.SEFLG_SWIEPH | constants.SEFLG_SIDEREAL;
const SIDEREAL_FLAGS_SPEED = SIDEREAL_FLAGS | constants.SEFLG_SPEED;

// ─── TransitCalculator ──────────────────────────────────────────────────────

/**
 * Calculates future and past sign-ingress events for Vedic planets using
 * sidereal (nirayana) longitudes.
 *
 * Strategy per planet:
 * - Sun  → `solcross_ut(boundary, jd, flags)` — exact, zero sampling cost
 * - Moon → `mooncross_ut(boundary, jd, flags)` — exact, zero sampling cost
 * - All others → coarse adaptive sampling + bisection to second precision
 *   (`calc_ut` is the Universal-Time variant of `calc`; it accepts JD-UT
 *   directly and is the correct pairing with `julday()`).
 *   sweph exposes no `<planet>cross_ut` helpers beyond Sun and Moon, so
 *   bisection on `calc_ut` is the standard approach for all other bodies.
 */
export class VedicTransitCalculator {
    private readonly ayanamsaId: number;
    private readonly ephePath: string;

    constructor(options: VedicTransitCalculatorOptions = {}) {
        this.ephePath   = options.ephePath ?? (__dirname + '/ephe');
        this.ayanamsaId = AYANAMSA_MAPPING[options.ayanamsa?.toLowerCase() ?? 'lahiri']
                          ?? constants.SE_SIDM_LAHIRI;
    }

    /**
     * Find every sign-ingress event for the given planets within [startDate, endDate].
     * Results are sorted chronologically.
     *
     * Retrograde re-entries are included: a planet that goes back into a previous sign
     * during retrograde and then re-enters the later sign while turning direct will
     * appear as three separate entries.
     *
     * @param planets  Array of Vedic planets to search
     * @param startDate  Inclusive start of the window (UTC)
     * @param endDate    Inclusive end of the window (UTC)
     */
    calculateTransitIngresses(
        planets: Planet[],
        startDate: Date,
        endDate: Date
    ): VedicTransitIngress[] {
        set_ephe_path(this.ephePath);
        set_sid_mode(this.ayanamsaId, 0, 0);

        const jdStart = this.dateToJd(startDate);
        const jdEnd   = this.dateToJd(endDate);

        const all: VedicTransitIngress[] = [];
        for (const planet of planets) {
            all.push(...this.ingressesForPlanet(planet, jdStart, jdEnd));
        }

        return all.sort((a, b) => a.jd - b.jd);
    }

    /** Release Swiss Ephemeris file handles. Call when done. */
    dispose(): void {
        close();
    }

    // ─── Per-planet dispatch ────────────────────────────────────────────────

    private ingressesForPlanet(planet: Planet, jdStart: number, jdEnd: number): VedicTransitIngress[] {
        switch (planet) {
            case 'sun':  return this.sunIngresses(jdStart, jdEnd);
            case 'moon': return this.moonIngresses(jdStart, jdEnd);
            default:     return this.bisectionIngresses(planet, jdStart, jdEnd);
        }
    }

    // ─── Sun: solcross_ut ────────────────────────────────────────────────────
    //
    // solcross_ut(x2cross, jd_ut, flags) finds the exact moment the Sun's
    // geocentric ecliptic longitude crosses x2cross.
    // With SEFLG_SIDEREAL the search operates in sidereal coordinates.
    // No equivalent function exists for any other planet in sweph.

    private sunIngresses(jdStart: number, jdEnd: number): VedicTransitIngress[] {
        const ingresses: VedicTransitIngress[] = [];
        let fromSign = this.lonToSign(this.getLon(constants.SE_SUN, jdStart));
        let jd       = jdStart;

        while (jd < jdEnd) {
            const lon          = this.getLon(constants.SE_SUN, jd);
            const nextBoundary = this.nextSignBoundary(lon);
            const result       = solcross_ut(nextBoundary, jd, SIDEREAL_FLAGS);

            // result.date < jd means sweph reported an error; >= jdEnd is outside window
            if (result.date < jd || result.date >= jdEnd) break;

            const ingressJd  = result.date;
            const ingressLon = this.getLon(constants.SE_SUN, ingressJd);
            // Derive toSign from the boundary we requested, not from lonToSign(ingressLon).
            // mooncross_ut/solcross_ut may return a JD where FP rounding gives a longitude
            // infinitesimally below the boundary (e.g. 59.9999° instead of 60.0°),
            // which would incorrectly map to the old sign.
            const toSign = ZodiacUtils.SIGNS[Math.floor(nextBoundary / 30) % 12];

            ingresses.push({
                planet: 'sun', sign: toSign, fromSign,
                date: this.jdToDate(ingressJd), jd: ingressJd,
                isRetrograde: false, longitude: ingressLon,
            });

            fromSign = toSign;
            jd       = ingressJd + 0.001; // advance ~86 s past the crossing
        }

        return ingresses;
    }

    // ─── Moon: mooncross_ut ──────────────────────────────────────────────────
    //
    // mooncross_ut is the Moon-specific counterpart to solcross_ut.
    // The Moon's geocentric longitude always increases (it never retrogrades
    // geocentrically), so chaining forward crossings is correct and complete.

    private moonIngresses(jdStart: number, jdEnd: number): VedicTransitIngress[] {
        const ingresses: VedicTransitIngress[] = [];
        let fromSign = this.lonToSign(this.getLon(constants.SE_MOON, jdStart));
        let jd       = jdStart;

        while (jd < jdEnd) {
            const lon          = this.getLon(constants.SE_MOON, jd);
            const nextBoundary = this.nextSignBoundary(lon);
            const result       = mooncross_ut(nextBoundary, jd, SIDEREAL_FLAGS);

            if (result.date < jd || result.date >= jdEnd) break;

            const ingressJd  = result.date;
            const ingressLon = this.getLon(constants.SE_MOON, ingressJd);
            // Derive toSign from the boundary crossed — same FP-safety reason as for Sun.
            const toSign = ZodiacUtils.SIGNS[Math.floor(nextBoundary / 30) % 12];

            ingresses.push({
                planet: 'moon', sign: toSign, fromSign,
                date: this.jdToDate(ingressJd), jd: ingressJd,
                isRetrograde: false, longitude: ingressLon,
            });

            fromSign = toSign;
            jd       = ingressJd + 0.001;
        }

        return ingresses;
    }

    // ─── Other planets: coarse step + bisection ──────────────────────────────
    //
    // calc_ut(jd_ut, planet, flags) is the Universal-Time variant of calc().
    // It accepts JD in UT (as returned by julday()) directly.
    // sweph provides no crossing helpers for Mercury, Venus, Mars, Jupiter,
    // Saturn, Rahu, or Ketu, so we use adaptive sampling + bisection instead:
    //
    //  1. Walk forward in planet-specific steps, computing sidereal longitude.
    //  2. When the sign index changes between two samples, bisect the interval
    //     down to 1-second precision.
    //
    // Ketu is derived as (SE_TRUE_NODE + 180) % 360; no separate SE body exists.
    // Rahu and Ketu are always flagged isRetrograde = true (traditional Vedic
    // interpretation of the nodes as always vakra / retrograde).

    private bisectionIngresses(planet: Planet, jdStart: number, jdEnd: number): VedicTransitIngress[] {
        const isKetu           = planet === 'ketu';
        const alwaysRetrograde = planet === 'rahu' || planet === 'ketu';
        const seId             = isKetu
            ? constants.SE_TRUE_NODE
            : PLANET_SE_ID[planet as Exclude<Planet, 'ketu'>];
        const step             = STEP_DAYS[planet];
        const ingresses: VedicTransitIngress[] = [];

        // Seed with the initial state
        const startRaw    = this.getLon(seId, jdStart);
        let prevLon       = isKetu ? (startRaw + 180) % 360 : startRaw;
        let prevSignIdx   = this.lonToSignIdx(prevLon);
        let prevSign      = this.lonToSign(prevLon);
        let prevJd        = jdStart;

        let jd = jdStart + step;
        while (jd <= jdEnd + step) {
            const jdClamped = Math.min(jd, jdEnd);
            const rawLon    = this.getLon(seId, jdClamped);
            const lon       = isKetu ? (rawLon + 180) % 360 : rawLon;
            const signIdx   = this.lonToSignIdx(lon);

            if (signIdx !== prevSignIdx) {
                // Sign boundary crossed — bisect to second-level precision
                const exactJd = this.bisect(seId, isKetu, prevJd, jdClamped, prevSignIdx);

                if (exactJd >= jdStart && exactJd <= jdEnd) {
                    const exactRaw  = this.getLon(seId, exactJd);
                    const exactLon  = isKetu ? (exactRaw + 180) % 360 : exactRaw;
                    const exactSign = this.lonToSign(exactLon);
                    const speed     = alwaysRetrograde
                        ? -1
                        : calc_ut(exactJd, seId, SIDEREAL_FLAGS_SPEED).data[3];

                    ingresses.push({
                        planet, sign: exactSign, fromSign: prevSign,
                        date: this.jdToDate(exactJd), jd: exactJd,
                        isRetrograde: alwaysRetrograde || speed < 0,
                        longitude: exactLon,
                    });
                }

                prevSign    = this.lonToSign(lon);
                prevSignIdx = signIdx;
            }

            prevJd  = jdClamped;
            prevLon = lon;
            if (jdClamped >= jdEnd) break;
            jd += step;
        }

        return ingresses;
    }

    // ─── Bisection to 1-second precision ─────────────────────────────────────
    //
    // Returns `hi` — the earliest confirmed JD in the new sign (NOT the midpoint).
    // `hi` is always ≤ 1 second past the exact crossing, guaranteeing that
    // getLon(seId, hi) returns a longitude in the new sign (sign !== fromSign).

    private bisect(
        seId: number,
        isKetu: boolean,
        lo: number,
        hi: number,
        fromSignIdx: number
    ): number {
        // 64 iterations converge to < 1 microsecond; 1-second precision needs ~17
        for (let i = 0; i < 64; i++) {
            if (hi - lo <= JD_SECOND) break;
            const mid    = (lo + hi) * 0.5;
            const rawLon = this.getLon(seId, mid);
            const lon    = isKetu ? (rawLon + 180) % 360 : rawLon;
            if (this.lonToSignIdx(lon) === fromSignIdx) lo = mid;
            else                                         hi = mid;
        }
        // Return hi: the first JD confirmed to be in the new sign (within 1 s of crossing)
        return hi;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Sidereal longitude at a given JD-UT via calc_ut. */
    private getLon(seId: number, jd: number): number {
        return calc_ut(jd, seId, SIDEREAL_FLAGS).data[0];
    }

    /**
     * The next sign-boundary longitude clockwise from `lon`.
     * Handles the Pisces→Aries wraparound (returns 0 when lon is in Pisces).
     */
    private nextSignBoundary(lon: number): number {
        const normalised = ((lon % 360) + 360) % 360;
        return ((Math.floor(normalised / 30) + 1) % 12) * 30;
    }

    /** 0-based sign index from sidereal longitude (0=Aries … 11=Pisces). */
    private lonToSignIdx(lon: number): number {
        return Math.floor(((lon % 360) + 360) % 360 / 30);
    }

    private lonToSign(lon: number): ZodiacSign {
        return ZodiacUtils.getSignFromLongitude(((lon % 360) + 360) % 360);
    }

    private dateToJd(date: Date): number {
        const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
        return julday(
            date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
            h, constants.SE_GREG_CAL
        );
    }

    private jdToDate(jd: number): Date {
        const { year, month, day, hour } = revjul(jd, constants.SE_GREG_CAL);
        const h   = Math.floor(hour);
        const rem = (hour - h) * 60;
        const m   = Math.floor(rem);
        const s   = Math.round((rem - m) * 60);
        // Date.UTC handles s=60 overflow correctly (carries to next minute)
        return new Date(Date.UTC(year, month - 1, day, h, m, s));
    }
}
