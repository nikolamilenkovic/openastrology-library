import { Planet } from './vedic.types';
import { ZodiacSign } from './common.types';

/**
 * A single sign-ingress event: the moment a transiting Vedic planet enters a new sidereal zodiac sign.
 *
 * Retrogrades are fully represented: a planet that enters Gemini, retrograde-enters Taurus,
 * then direct-enters Gemini again will appear as three separate VedicTransitIngress entries.
 */
export interface VedicTransitIngress {
    /** Vedic planet name */
    planet: Planet;
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
     * moment of ingress.
     * Rahu and Ketu are always true; Sun and Moon are always false.
     */
    isRetrograde: boolean;
    /** Sidereal ecliptic longitude (degrees) at the moment of ingress */
    longitude: number;
}

/** Options for VedicTransitCalculator */
export interface VedicTransitCalculatorOptions {
    /**
     * Ayanamsa system to use for sidereal longitude conversion.
     * Accepted values (case-insensitive): 'lahiri' | 'raman' | 'krishnamurti' |
     * 'yukteshwar' | 'jnbhasin' | 'babinaikamytry' | 'truecitra' | 'truerevati' | 'truepushya'
     * @default 'lahiri'
     */
    ayanamsa?: string;
    /**
     * Absolute path to the directory containing Swiss Ephemeris `.se1` files.
     * Defaults to the bundled `ephe/` directory.
     */
    ephePath?: string;
}
