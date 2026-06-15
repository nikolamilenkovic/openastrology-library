import { WesternPlanet } from './western.types';
import { ZodiacSign } from './common.types';

/**
 * A single sign-ingress event: the moment a transiting Western planet enters a
 * new tropical zodiac sign.
 *
 * Retrogrades are fully represented: a planet that enters Gemini, retrograde-enters Taurus,
 * then direct-enters Gemini again will appear as three separate WesternTransitIngress entries.
 *
 * Note: south_node is derived from north_node and its ingresses always coincide with
 * north_node ingresses (within 1 second). Both are included if both are requested.
 */
export interface WesternTransitIngress {
    /** Western planet name */
    planet: WesternPlanet;
    /** The sign the planet just entered */
    sign: ZodiacSign;
    /** The sign the planet was in immediately before this ingress */
    fromSign: ZodiacSign;
    /** UTC Date of the ingress, precise to the second */
    date: Date;
    /** Julian Day (Universal Time) of the ingress */
    jd: number;
    /**
     * Whether the planet was moving in retrograde (decreasing longitude) at the
     * moment of ingress. north_node and south_node are always true.
     */
    isRetrograde: boolean;
    /** Tropical ecliptic longitude (degrees) at the moment of ingress */
    longitude: number;
}

/** Options for WesternTransitCalculator */
export interface WesternTransitCalculatorOptions {
    /**
     * Absolute path to the directory containing Swiss Ephemeris `.se1` files.
     * Defaults to the bundled `ephe/` directory.
     */
    ephePath?: string;
}
