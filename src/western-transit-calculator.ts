import { set_ephe_path, julday, calc_ut, solcross_ut, mooncross_ut, revjul, close, constants } from 'sweph';
import { ZodiacUtils } from './astrological-utils';
import { WesternPlanet } from './types/western.types';
import { ZodiacSign } from './types/common.types';
import { WesternTransitIngress, WesternTransitCalculatorOptions } from './types/western-transit.types';

export { WesternTransitCalculatorOptions };

// ─── Swiss Ephemeris IDs for Western planets ─────────────────────────────────
// south_node has no SE ID — it is always (SE_TRUE_NODE + 180) % 360.
const PLANET_SE_ID: Record<Exclude<WesternPlanet, 'south_node'>, number> = {
    sun:        constants.SE_SUN,       // 0
    moon:       constants.SE_MOON,      // 1
    mercury:    constants.SE_MERCURY,   // 2
    venus:      constants.SE_VENUS,     // 3
    mars:       constants.SE_MARS,      // 4
    jupiter:    constants.SE_JUPITER,   // 5
    saturn:     constants.SE_SATURN,    // 6
    uranus:     constants.SE_URANUS,    // 7
    neptune:    constants.SE_NEPTUNE,   // 8
    pluto:      constants.SE_PLUTO,     // 9
    north_node: constants.SE_TRUE_NODE, // 11
    chiron:     constants.SE_CHIRON,    // 15
    lilith:     constants.SE_MEAN_APOG, // 12
};

// ─── Coarse step sizes in days for bisection approach ────────────────────────
// Sized so no planet can traverse a full 30° sign in a single step.
//
//  Moon:       ~15°/day → 6h step gives ≤3.8°          ✓
//  Mercury:    ~2.2°/day → 6h step gives ≤0.6°          ✓
//  Venus:      ~1.2°/day → 12h step gives ≤0.6°         ✓
//  Mars:       ~0.7°/day → 1d step gives ≤0.7°          ✓
//  Jupiter:    ~0.24°/day → 5d step gives ≤1.2°         ✓
//  Saturn:     ~0.13°/day → 7d step gives ≤0.9°         ✓
//  Uranus:     ~0.034°/day → 15d step gives ≤0.5°       ✓
//  Neptune:    ~0.022°/day → 20d step gives ≤0.44°      ✓
//  Pluto:      ~0.014°/day → 30d step gives ≤0.42°      ✓
//  north/south_node: ~0.05°/day retrograde → 7d gives ≤0.35°  ✓
//  Chiron:     ~0.05°/day → 7d step gives ≤0.35°        ✓
//  Lilith:     ~0.11°/day → 5d step gives ≤0.55°        ✓
const STEP_DAYS: Record<WesternPlanet, number> = {
    sun:        1.0,   // not used (solcross_ut)
    moon:       0.25,  // not used (mooncross_ut)
    mercury:    0.25,
    venus:      0.5,
    mars:       1.0,
    jupiter:    5.0,
    saturn:     7.0,
    uranus:     15.0,
    neptune:    20.0,
    pluto:      30.0,
    north_node: 7.0,
    south_node: 7.0,
    chiron:     7.0,
    lilith:     5.0,
};

// 1 second expressed as a Julian Day fraction
const JD_SECOND = 1.0 / 86400.0;

// Tropical (no sidereal flag) — just SEFLG_SWIEPH
const TROPICAL_FLAGS       = constants.SEFLG_SWIEPH;
const TROPICAL_FLAGS_SPEED = TROPICAL_FLAGS | constants.SEFLG_SPEED;

// ─── WesternTransitCalculator ────────────────────────────────────────────────

/**
 * Calculates future and past sign-ingress events for Western planets using
 * tropical (sayana) ecliptic longitudes.
 *
 * Strategy per planet:
 * - Sun        → `solcross_ut(boundary, jd, SEFLG_SWIEPH)` — exact, zero sampling cost
 * - Moon       → `mooncross_ut(boundary, jd, SEFLG_SWIEPH)` — exact, zero sampling cost
 * - All others → coarse adaptive sampling + bisection to second-level precision
 *
 * south_node is derived as (SE_TRUE_NODE + 180) % 360 and its ingresses coincide
 * with north_node ingresses (within 1 second). Both are included when requested.
 *
 * north_node and south_node are always flagged isRetrograde = true (they move
 * retrograde in both tropical and sidereal coordinates ~99% of the time; the
 * rare brief direct periods are owed to the mean-vs-true node distinction but
 * the traditional interpretation treats them as perpetually retrograde).
 */
export class WesternTransitCalculator {
    private readonly ephePath: string;

    constructor(options: WesternTransitCalculatorOptions = {}) {
        this.ephePath = options.ephePath ?? (__dirname + '/ephe');
    }

    /**
     * Find every sign-ingress event for the given planets within [startDate, endDate].
     * Results are sorted chronologically.
     *
     * @param planets    Array of Western planets to search
     * @param startDate  Inclusive start of the window (UTC)
     * @param endDate    Inclusive end of the window (UTC)
     */
    calculateTransitIngresses(
        planets: WesternPlanet[],
        startDate: Date,
        endDate: Date
    ): WesternTransitIngress[] {
        set_ephe_path(this.ephePath);
        // No set_sid_mode — tropical mode is the default

        const jdStart = this.dateToJd(startDate);
        const jdEnd   = this.dateToJd(endDate);

        const all: WesternTransitIngress[] = [];
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

    private ingressesForPlanet(
        planet: WesternPlanet,
        jdStart: number,
        jdEnd: number
    ): WesternTransitIngress[] {
        switch (planet) {
            case 'sun':  return this.sunIngresses(jdStart, jdEnd);
            case 'moon': return this.moonIngresses(jdStart, jdEnd);
            default:     return this.bisectionIngresses(planet, jdStart, jdEnd);
        }
    }

    // ─── Sun: solcross_ut ────────────────────────────────────────────────────

    private sunIngresses(jdStart: number, jdEnd: number): WesternTransitIngress[] {
        const ingresses: WesternTransitIngress[] = [];
        let fromSign = this.lonToSign(this.getLon(constants.SE_SUN, jdStart));
        let jd       = jdStart;

        while (jd < jdEnd) {
            const lon          = this.getLon(constants.SE_SUN, jd);
            const nextBoundary = this.nextSignBoundary(lon);
            const result       = solcross_ut(nextBoundary, jd, TROPICAL_FLAGS);

            if (result.date < jd || result.date >= jdEnd) break;

            const ingressJd  = result.date;
            const ingressLon = this.getLon(constants.SE_SUN, ingressJd);
            const toSign     = ZodiacUtils.SIGNS[Math.floor(nextBoundary / 30) % 12];

            ingresses.push({
                planet: 'sun', sign: toSign, fromSign,
                date: this.jdToDate(ingressJd), jd: ingressJd,
                isRetrograde: false, longitude: ingressLon,
            });

            fromSign = toSign;
            jd       = ingressJd + 0.001;
        }

        return ingresses;
    }

    // ─── Moon: mooncross_ut ──────────────────────────────────────────────────

    private moonIngresses(jdStart: number, jdEnd: number): WesternTransitIngress[] {
        const ingresses: WesternTransitIngress[] = [];
        let fromSign = this.lonToSign(this.getLon(constants.SE_MOON, jdStart));
        let jd       = jdStart;

        while (jd < jdEnd) {
            const lon          = this.getLon(constants.SE_MOON, jd);
            const nextBoundary = this.nextSignBoundary(lon);
            const result       = mooncross_ut(nextBoundary, jd, TROPICAL_FLAGS);

            if (result.date < jd || result.date >= jdEnd) break;

            const ingressJd  = result.date;
            const ingressLon = this.getLon(constants.SE_MOON, ingressJd);
            const toSign     = ZodiacUtils.SIGNS[Math.floor(nextBoundary / 30) % 12];

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
    // south_node has no SE body — it is derived as (SE_TRUE_NODE + 180) % 360.
    // north_node and south_node are always flagged isRetrograde = true.

    private bisectionIngresses(
        planet: WesternPlanet,
        jdStart: number,
        jdEnd: number
    ): WesternTransitIngress[] {
        const isSouthNode      = planet === 'south_node';
        const alwaysRetrograde = planet === 'north_node' || planet === 'south_node';
        const seId             = isSouthNode
            ? constants.SE_TRUE_NODE
            : PLANET_SE_ID[planet as Exclude<WesternPlanet, 'south_node'>];
        const step             = STEP_DAYS[planet];
        const ingresses: WesternTransitIngress[] = [];

        const startRaw  = this.getLon(seId, jdStart);
        let prevLon     = isSouthNode ? (startRaw + 180) % 360 : startRaw;
        let prevSignIdx = this.lonToSignIdx(prevLon);
        let prevSign    = this.lonToSign(prevLon);
        let prevJd      = jdStart;

        let jd = jdStart + step;
        while (jd <= jdEnd + step) {
            const jdClamped = Math.min(jd, jdEnd);
            const rawLon    = this.getLon(seId, jdClamped);
            const lon       = isSouthNode ? (rawLon + 180) % 360 : rawLon;
            const signIdx   = this.lonToSignIdx(lon);

            if (signIdx !== prevSignIdx) {
                const exactJd = this.bisect(seId, isSouthNode, prevJd, jdClamped, prevSignIdx);

                if (exactJd >= jdStart && exactJd <= jdEnd) {
                    const exactRaw  = this.getLon(seId, exactJd);
                    const exactLon  = isSouthNode ? (exactRaw + 180) % 360 : exactRaw;
                    const exactSign = this.lonToSign(exactLon);
                    const speed     = alwaysRetrograde
                        ? -1
                        : calc_ut(exactJd, seId, TROPICAL_FLAGS_SPEED).data[3];

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
    // Returns `hi` — the earliest confirmed JD in the new sign (within 1 s of crossing).

    private bisect(
        seId: number,
        isSouthNode: boolean,
        lo: number,
        hi: number,
        fromSignIdx: number
    ): number {
        for (let i = 0; i < 64; i++) {
            if (hi - lo <= JD_SECOND) break;
            const mid    = (lo + hi) * 0.5;
            const rawLon = this.getLon(seId, mid);
            const lon    = isSouthNode ? (rawLon + 180) % 360 : rawLon;
            if (this.lonToSignIdx(lon) === fromSignIdx) lo = mid;
            else                                         hi = mid;
        }
        return hi;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private getLon(seId: number, jd: number): number {
        return calc_ut(jd, seId, TROPICAL_FLAGS).data[0];
    }

    private nextSignBoundary(lon: number): number {
        const normalised = ((lon % 360) + 360) % 360;
        return ((Math.floor(normalised / 30) + 1) % 12) * 30;
    }

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
        return new Date(Date.UTC(year, month - 1, day, h, m, s));
    }
}
