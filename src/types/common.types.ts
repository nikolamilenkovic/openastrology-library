// Shared types used by both Vedic and Western astrology

export type ZodiacSign =
    | 'aries'
    | 'taurus'
    | 'gemini'
    | 'cancer'
    | 'leo'
    | 'virgo'
    | 'libra'
    | 'scorpio'
    | 'sagittarius'
    | 'capricorn'
    | 'aquarius'
    | 'pisces';

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Birth Information - common input for all calculators
export interface BirthInfo {
    name: string;
    dateOfBirth: string; // YYYY-MM-DD format
    timeOfBirth: string; // HH:MM format
    latitude: number;
    longitude: number;
    timezone: string;
    gender?: 'male' | 'female';
}

export class DegreeDMS {
    degrees: number = 0; // 0-360
    minutes: number = 0; // 0-59
    seconds: number = 0; // 0-59
}

// House Information - shared structure
export interface HouseInfo {
    number: HouseNumber;
    cusp: number; // cusp longitude in degrees
    sign: ZodiacSign;
    lord: string; // planet name (typed as string to allow both Vedic and Western planets)
    planets: string[]; // Planet names in this house
    strength: number; // House strength (0-100)
    significance: string[]; // What this house represents
}

export type HousePositions = {
    [K in HouseNumber]: HouseInfo;
};
