// Western Astrology specific types
import { ZodiacSign, HouseNumber, BirthInfo, DegreeDMS, HouseInfo, HousePositions } from './common.types';

// Re-export common types
export { ZodiacSign, HouseNumber, BirthInfo, DegreeDMS, HouseInfo, HousePositions };

// Western planets include classical + outer + Chiron
export type WesternPlanet =
    | 'sun'
    | 'moon'
    | 'mercury'
    | 'venus'
    | 'mars'
    | 'jupiter'
    | 'saturn'
    | 'uranus'
    | 'neptune'
    | 'pluto'
    | 'chiron'
    | 'north_node'
    | 'south_node'
    | 'lilith';

// All Western aspect types (major + minor)
export type WesternAspectType =
    | 'conjunction'    // 0°
    | 'semi-sextile'   // 30°
    | 'semi-square'    // 45°
    | 'sextile'        // 60°
    | 'quintile'       // 72°
    | 'square'         // 90°
    | 'trine'          // 120°
    | 'sesquiquadrate' // 135°
    | 'biquintile'     // 144°
    | 'quincunx'       // 150°
    | 'opposition';    // 180°

// Default orbs in degrees for each aspect type
export const DEFAULT_WESTERN_ORBS: Record<WesternAspectType, number> = {
    conjunction: 8,
    'semi-sextile': 2,
    'semi-square': 2,
    sextile: 6,
    quintile: 2,
    square: 8,
    trine: 8,
    sesquiquadrate: 2,
    biquintile: 2,
    quincunx: 3,
    opposition: 8
};

// The exact angle for each aspect type
export const WESTERN_ASPECT_ANGLES: Record<WesternAspectType, number> = {
    conjunction: 0,
    'semi-sextile': 30,
    'semi-square': 45,
    sextile: 60,
    quintile: 72,
    square: 90,
    trine: 120,
    sesquiquadrate: 135,
    biquintile: 144,
    quincunx: 150,
    opposition: 180
};

// Chart pattern types (Western equivalent of yogas)
export type ChartPatternType =
    | 'grand-trine'
    | 't-square'
    | 'grand-cross'
    | 'stellium'
    | 'yod';

// A Western aspect between two planets
export interface WesternAspect {
    planet1: WesternPlanet;
    planet2: WesternPlanet;
    type: WesternAspectType;
    angle: number;        // exact angular separation in degrees
    orb: number;          // actual orb (deviation from exact aspect angle)
    maxOrb: number;       // allowed maximum orb for this aspect type
    isApplying: boolean;  // true = planets moving toward exact aspect
}

// A chart pattern (geometric configuration of multiple planets)
export interface ChartPattern {
    type: ChartPatternType;
    planets: WesternPlanet[];
    description: string;
    element?: 'fire' | 'earth' | 'air' | 'water'; // grand trine element
}

// Western planet position (tropical, no nakshatra, no combustion)
export interface WesternPlanetPosition {
    name: WesternPlanet;
    longitude: number;          // 0-360 tropical degrees
    latitude: number;
    sign: ZodiacSign;
    degree: number;             // degree within sign (0-30)
    degreeDMS: DegreeDMS;
    degreeDMSFormatted: string;
    house: HouseNumber;
    isRetrograde: boolean;
    speed: number;              // degrees per day
    dignity: string;            // Exalted | Debilitated | Domicile | Detriment | Neutral
    element: 'fire' | 'earth' | 'air' | 'water';
    quality: 'cardinal' | 'fixed' | 'mutable';
    aspects: WesternAspect[];
}

export type WesternPlanetaryPositions = {
    [K in WesternPlanet]: WesternPlanetPosition;
};

// Ascendant info for Western chart
export interface WesternAscendant {
    sign: ZodiacSign;
    degree: number;
    degreeDMSFormatted: string;
    longitude: number;
}

// Generic angular point (Dsc, MC, IC share the same shape as WesternAscendant)
export type WesternAngle = WesternAscendant;

// Complete Western birth chart result
export interface WesternChartCalculations {
    birthDateUtc: Date;
    planets: WesternPlanetaryPositions;
    houses: HousePositions;
    ascendant: WesternAscendant;
    descendant: WesternAngle;
    mc: WesternAngle;
    ic: WesternAngle;
    elementCounts: Record<'fire' | 'earth' | 'air' | 'water', number>;
    qualityCounts: Record<'cardinal' | 'fixed' | 'mutable', number>;
    aspects: WesternAspect[];
    patterns: ChartPattern[];
}

// Calculator options
export interface WesternAstrologyCalculatorOptions {
    houseSystem?: string; // default: 'placidus'
    orbs?: Partial<Record<WesternAspectType, number>>; // override default orbs
    /** Absolute path to the directory containing Swiss Ephemeris `.se1` files. */
    ephePath?: string;
}
