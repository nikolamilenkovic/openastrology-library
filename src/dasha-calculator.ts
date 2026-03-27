import { NakshatraUtils } from './astrological-utils';
import { Planet, PlanetPosition, VimshottariDasha, PlanetDasha, Nakshatra } from './types/vedic.types';

export class DashaCalculator {
    // Vimshottari Dasha periods in years for each planet
    private static readonly VIMSHOTTARI_PERIODS: Record<Planet, number> = {
        sun: 6,
        moon: 10,
        mars: 7,
        rahu: 18,
        jupiter: 16,
        saturn: 19,
        mercury: 17,
        ketu: 7,
        venus: 20
    };

    // Dasha sequence based on Moon's nakshatra lord
    private static readonly DASHA_SEQUENCE: Planet[] = [
        'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'
    ];

    /**
     * Calculate Vimshottari Dasha periods based on Moon's position
     */
    static calculateVimshottariDasha(moonPosition: PlanetPosition, birthDate: Date): VimshottariDasha {
        // Get the nakshatra lord of the Moon
        const moonNakshatra = moonPosition.nakshatra;
        const nakshatraLord = NakshatraUtils.getNakshatraLord(moonNakshatra);
        
        // Calculate how much of the current dasha has elapsed
        const elapsedFraction = this.calculateElapsedDashaFraction(moonPosition);
        
        // Find the starting point in the dasha sequence
        const startingLordIndex = this.DASHA_SEQUENCE.indexOf(nakshatraLord);
        
        // Calculate Maha Dasha periods
        const dashaPeriods = this.calculateMahaDashaPeriods(startingLordIndex, elapsedFraction, birthDate);
        
        return {
            type: 'vimshottari',
            dashaPeriods
        };
    }

    /**
     * Calculate elapsed fraction of current dasha based on Moon's position in nakshatra
     */
    private static calculateElapsedDashaFraction(moonPosition: PlanetPosition): number {
        // Each nakshatra is 13°20' (360°/27)
        const nakshatraLength = 360 / 27;
        
        // Get Moon's longitude and calculate position within current nakshatra
        const moonLongitude = moonPosition.longitude;
        const degreeInNakshatra = moonLongitude % nakshatraLength;
        
        // Calculate elapsed fraction (0 to 1)
        return degreeInNakshatra / nakshatraLength;
    }

    /**
     * Calculate Maha Dasha periods starting from the current lord
     */
    private static calculateMahaDashaPeriods(
        startingLordIndex: number, 
        elapsedFraction: number, 
        birthDate: Date
    ): PlanetDasha[] {
        const dashaPeriods: PlanetDasha[] = [];
        
        // Calculate the original start date of the first dasha (before birth)
        const firstDashaPlanet = this.DASHA_SEQUENCE[startingLordIndex];
        const firstDashaPeriodYears = this.VIMSHOTTARI_PERIODS[firstDashaPlanet];
        const elapsedYears = firstDashaPeriodYears * elapsedFraction;
        
        // Normalize birth date to midnight and start the first dasha from its original beginning (before birth)
        const normalizedBirthDate = new Date(birthDate);
        normalizedBirthDate.setUTCHours(0, 0, 0, 0);
        let currentDate = this.subtractYearsFromDate(normalizedBirthDate, elapsedYears);
        
        // Calculate 120 years of Vimshottari cycle (standard full cycle)
        for (let i = 0; i < this.DASHA_SEQUENCE.length; i++) {
            const planetIndex = (startingLordIndex + i) % this.DASHA_SEQUENCE.length;
            const planet = this.DASHA_SEQUENCE[planetIndex];
            const periodYears = this.VIMSHOTTARI_PERIODS[planet];
            
            // Use full period years for all dashas (including the first one)
            const actualPeriodYears = periodYears;
            
            const startDate = new Date(currentDate);
            const endDate = this.addYearsToDate(currentDate, actualPeriodYears);
            
            // Calculate Antar Dasha (sub-periods) for this Maha Dasha
            const subPeriods = this.calculateAntarDashaPeriods(planet, startDate, endDate);
            
            dashaPeriods.push({
                planet,
                startDate,
                endDate,
                subPeriods
            });
            
            currentDate = endDate;
        }
        
        return dashaPeriods;
    }

    /**
     * Calculate Antar Dasha (sub-periods) for a given Maha Dasha
     */
    private static calculateAntarDashaPeriods(
        mahaDashaPlanet: Planet, 
        mahaDashaStart: Date, 
        mahaDashaEnd: Date
    ): PlanetDasha[] {
        const subPeriods: PlanetDasha[] = [];
        const totalDurationMs = mahaDashaEnd.getTime() - mahaDashaStart.getTime();
        const mahaDashaPeriodYears = this.VIMSHOTTARI_PERIODS[mahaDashaPlanet];
        
        // Find starting position of Maha Dasha lord in sequence
        const startIndex = this.DASHA_SEQUENCE.indexOf(mahaDashaPlanet);
        let currentDate = new Date(mahaDashaStart);
        
        // Calculate the total of all sub-planet periods to normalize
        let totalSubPeriodYears = 0;
        for (let i = 0; i < this.DASHA_SEQUENCE.length; i++) {
            const subPlanetIndex = (startIndex + i) % this.DASHA_SEQUENCE.length;
            const subPlanet = this.DASHA_SEQUENCE[subPlanetIndex];
            totalSubPeriodYears += this.VIMSHOTTARI_PERIODS[subPlanet];
        }
        
        // Calculate sub-periods for all 9 planets in sequence
        for (let i = 0; i < this.DASHA_SEQUENCE.length; i++) {
            const subPlanetIndex = (startIndex + i) % this.DASHA_SEQUENCE.length;
            const subPlanet = this.DASHA_SEQUENCE[subPlanetIndex];
            const subPlanetPeriodYears = this.VIMSHOTTARI_PERIODS[subPlanet];
            
            // Calculate proportional duration for this sub-period
            // Formula: (SubPlanet × MahaDasha) / Total of all planets
            const subPeriodFraction = (subPlanetPeriodYears * mahaDashaPeriodYears) / (totalSubPeriodYears * mahaDashaPeriodYears);
            const subPeriodDurationMs = totalDurationMs * subPeriodFraction;
            
            const startDate = new Date(currentDate);
            const endDate = new Date(currentDate.getTime() + subPeriodDurationMs);
            
            // Ensure the last sub-period ends exactly at maha dasha end
            if (i === this.DASHA_SEQUENCE.length - 1) {
                endDate.setTime(mahaDashaEnd.getTime());
            }
            
            subPeriods.push({
                planet: subPlanet,
                startDate,
                endDate,
                subPeriods: [] // Not calculating Pratyantar Dasha for now
            });
            
            currentDate = new Date(endDate);
        }
        
        return subPeriods;
    }

    /**
     * Add years to a date accounting for leap years
     */
    private static addYearsToDate(date: Date, years: number): Date {
        const result = new Date(date);
        const wholePart = Math.floor(years);
        const fractionalPart = years - wholePart;
        
        // Add whole years
        result.setFullYear(result.getFullYear() + wholePart);
        
        // Add fractional part (in days)
        const daysToAdd = fractionalPart * 365.25; // Account for leap years
        result.setTime(result.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
        
        // Normalize to midnight (remove time components)
        result.setUTCHours(0, 0, 0, 0);
        
        return result;
    }

    /**
     * Subtract years from a date accounting for leap years
     */
    private static subtractYearsFromDate(date: Date, years: number): Date {
        const result = new Date(date);
        const wholePart = Math.floor(years);
        const fractionalPart = years - wholePart;
        
        // Subtract whole years
        result.setFullYear(result.getFullYear() - wholePart);
        
        // Subtract fractional part (in days)
        const daysToSubtract = fractionalPart * 365.25; // Account for leap years
        result.setTime(result.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
        
        // Normalize to midnight (remove time components)
        result.setUTCHours(0, 0, 0, 0);
        
        return result;
    }


    /**
     * Get current dasha period for a given date
     */
    static getCurrentDasha(dashas: VimshottariDasha, date: Date): {
        mahaDasha?: PlanetDasha;
        antarDasha?: PlanetDasha;
    } {
        // Find current Maha Dasha
        const mahaDasha = dashas.dashaPeriods.find(dasha => 
            date >= dasha.startDate && date <= dasha.endDate
        );
        
        if (!mahaDasha) {
            return { mahaDasha: undefined, antarDasha: undefined };
        }
        
        // Find current Antar Dasha
        const antarDasha = mahaDasha.subPeriods.find(subDasha => 
            date >= subDasha.startDate && date <= subDasha.endDate
        );
        
        return { mahaDasha, antarDasha };
    }

    /**
     * Get remaining time in current dasha period
     */
    static getRemainingDashaTime(dasha: PlanetDasha, currentDate: Date): {
        years: number;
        months: number;
        days: number;
    } {
        const remainingMs = dasha.endDate.getTime() - currentDate.getTime();
        const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        
        const years = Math.floor(remainingDays / 365.25);
        const months = Math.floor((remainingDays % 365.25) / 30.44);
        const days = Math.floor(remainingDays % 30.44);
        
        return { years, months, days };
    }

    /**
     * Get dasha lord for a given nakshatra
     */
    static getDashaLord(nakshatra: Nakshatra): Planet {
        return NakshatraUtils.getNakshatraLord(nakshatra);
    }
}