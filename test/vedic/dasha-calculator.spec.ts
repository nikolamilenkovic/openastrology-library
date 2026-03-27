import { DashaCalculator } from '../../src';
import { PlanetPosition, Planet } from '../../src';

describe('DashaCalculator', () => {
    // Mock Moon position for testing
    const createMockMoonPosition = (nakshatra: string, longitude: number): PlanetPosition => ({
        name: 'moon',
        longitude: longitude,
        latitude: 0,
        sign: 'cancer' as any,
        degree: 15,
        degreeDMS: { degrees: 15, minutes: 0, seconds: 0 },
        degreeDMSFormatted: '15°00\'00"',
        nakshatra: nakshatra as any,
        nakshatraPada: 2,
        pada: 2,
        house: 4,
        isRetrograde: false,
        isCombust: false,
        speed: 13.2,
        dignity: 'Own Sign',
        aspects: []
    });

    describe('calculateVimshottariDasha', () => {
        it('should calculate dasha periods starting from Ketu when Moon is in Ashwini', () => {
            // Ashwini starts at 0° and is ruled by Ketu
            const moonPosition = createMockMoonPosition('ashwini', 5); // 5° longitude (within Ashwini)
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            expect(result.type).toBe('vimshottari');
            expect(result.dashaPeriods).toHaveLength(9);
            
            // First dasha should be Ketu (Ashwini's lord)
            expect(result.dashaPeriods[0].planet).toBe('ketu');
            // First dasha now starts from its original date (before birth), not birth date
            expect(result.dashaPeriods[0].startDate).not.toEqual(birthDate);
            expect(result.dashaPeriods[0].startDate.getTime()).toBeLessThan(birthDate.getTime());
            
            // Verify the sequence follows Vimshottari order starting from Ketu
            const expectedSequence: Planet[] = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
            result.dashaPeriods.forEach((dasha, index) => {
                expect(dasha.planet).toBe(expectedSequence[index]);
            });
        });

        it('should calculate dasha periods starting from Venus when Moon is in Bharani', () => {
            // Bharani is ruled by Venus (second nakshatra, ~13.33° to ~26.66°)
            const moonPosition = createMockMoonPosition('bharani', 20); // 20° longitude (within Bharani)
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            expect(result.type).toBe('vimshottari');
            expect(result.dashaPeriods).toHaveLength(9);
            
            // First dasha should be Venus (Bharani's lord)
            expect(result.dashaPeriods[0].planet).toBe('venus');
            
            // Verify the sequence follows Vimshottari order starting from Venus
            const expectedSequence: Planet[] = ['venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu'];
            result.dashaPeriods.forEach((dasha, index) => {
                expect(dasha.planet).toBe(expectedSequence[index]);
            });
        });

        it('should calculate correct dasha durations', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0); // Start of Ashwini (no elapsed portion)
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            // Check Ketu dasha (7 years)
            const ketuDasha = result.dashaPeriods[0];
            const ketuDurationYears = (ketuDasha.endDate.getTime() - ketuDasha.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            expect(ketuDurationYears).toBeCloseTo(7, 1);

            // Check Venus dasha (20 years)
            const venusDasha = result.dashaPeriods[1];
            const venusDurationYears = (venusDasha.endDate.getTime() - venusDasha.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            expect(venusDurationYears).toBeCloseTo(20, 1);
        });

        it('should calculate full dasha periods even when Moon has traversed part of nakshatra', () => {
            // Moon at end of Ashwini (should still show full Ketu dasha period from original start)
            const moonPosition = createMockMoonPosition('ashwini', 13.2); // Near end of Ashwini
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            // First dasha (Ketu) should still be the full 7 years from its original start
            const ketuDasha = result.dashaPeriods[0];
            const ketuDurationYears = (ketuDasha.endDate.getTime() - ketuDasha.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            expect(ketuDurationYears).toBeCloseTo(7, 0.01); // Full Ketu period
            
            // Birth date should fall within the Ketu dasha period
            expect(birthDate.getTime()).toBeGreaterThanOrEqual(ketuDasha.startDate.getTime());
            expect(birthDate.getTime()).toBeLessThanOrEqual(ketuDasha.endDate.getTime());
        });

        it('should calculate antar dasha periods for each maha dasha', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0);
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            // Check that each maha dasha has 9 antar dasha periods
            result.dashaPeriods.forEach(mahaDasha => {
                expect(mahaDasha.subPeriods).toHaveLength(9);
                
                // Verify antar dasha sequence starts with maha dasha lord
                expect(mahaDasha.subPeriods[0].planet).toBe(mahaDasha.planet);
                
                // Verify all sub-periods are within the maha dasha timeframe (with small tolerance)
                mahaDasha.subPeriods.forEach(antarDasha => {
                    expect(antarDasha.startDate.getTime()).toBeGreaterThanOrEqual(mahaDasha.startDate.getTime());
                    // Allow small tolerance for rounding errors (1 second)
                    expect(antarDasha.endDate.getTime()).toBeLessThanOrEqual(mahaDasha.endDate.getTime() + 1000);
                });
                
                // Verify the last antar dasha ends exactly at maha dasha end
                const lastAntar = mahaDasha.subPeriods[mahaDasha.subPeriods.length - 1];
                expect(lastAntar.endDate.getTime()).toBe(mahaDasha.endDate.getTime());
            });
        });

        it('should have no gaps between dasha periods', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0);
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            // Check that each dasha starts exactly when the previous one ends
            for (let i = 1; i < result.dashaPeriods.length; i++) {
                const previousEnd = result.dashaPeriods[i - 1].endDate.getTime();
                const currentStart = result.dashaPeriods[i].startDate.getTime();
                expect(currentStart).toBe(previousEnd);
            }

            // Check antar dasha continuity within each maha dasha
            result.dashaPeriods.forEach(mahaDasha => {
                for (let i = 1; i < mahaDasha.subPeriods.length; i++) {
                    const previousEnd = mahaDasha.subPeriods[i - 1].endDate.getTime();
                    const currentStart = mahaDasha.subPeriods[i].startDate.getTime();
                    expect(Math.abs(currentStart - previousEnd)).toBeLessThan(1000); // Allow 1 second tolerance
                }
            });
        });
    });

    describe('getCurrentDasha', () => {
        it('should find current maha and antar dasha for a given date', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0);
            const birthDate = new Date('1990-01-01T00:00:00Z');
            const dashas = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            // Test date within first dasha
            const testDate = new Date('1992-01-01T00:00:00Z');
            const current = DashaCalculator.getCurrentDasha(dashas, testDate);

            expect(current.mahaDasha).toBeTruthy();
            expect(current.mahaDasha!.planet).toBe('ketu');
            expect(current.antarDasha).toBeTruthy();
            expect(current.antarDasha!.planet).toBeTruthy();
        });

        it('should return null for date outside dasha range', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0);
            const birthDate = new Date('1990-01-01T00:00:00Z');
            const dashas = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            // Test date before birth
            const testDate = new Date('1980-01-01T00:00:00Z');
            const current = DashaCalculator.getCurrentDasha(dashas, testDate);

            expect(current.mahaDasha).toBeUndefined();
            expect(current.antarDasha).toBeUndefined();
        });
    });

    describe('getRemainingDashaTime', () => {
        it('should calculate remaining time correctly', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0);
            const birthDate = new Date('1990-01-01T00:00:00Z');
            const dashas = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);

            const firstDasha = dashas.dashaPeriods[0];
            const currentDate = new Date('1991-01-01T00:00:00Z'); // 1 year after birth

            const remaining = DashaCalculator.getRemainingDashaTime(firstDasha, currentDate);

            expect(remaining.years).toBe(6); // 7 - 1 = 6 years remaining from 7-year Ketu dasha
            expect(remaining.months).toBeGreaterThanOrEqual(0);
            expect(remaining.days).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getDashaLord', () => {
        it('should return correct dasha lord for each nakshatra', () => {
            expect(DashaCalculator.getDashaLord('ashwini')).toBe('ketu');
            expect(DashaCalculator.getDashaLord('bharani')).toBe('venus');
            expect(DashaCalculator.getDashaLord('krittika')).toBe('sun');
            expect(DashaCalculator.getDashaLord('rohini')).toBe('moon');
            expect(DashaCalculator.getDashaLord('mrigashira')).toBe('mars');
            expect(DashaCalculator.getDashaLord('ardra')).toBe('rahu');
            expect(DashaCalculator.getDashaLord('punarvasu')).toBe('jupiter');
            expect(DashaCalculator.getDashaLord('pushya')).toBe('saturn');
            expect(DashaCalculator.getDashaLord('ashlesha')).toBe('mercury');
        });
    });

    describe('Edge cases and validation', () => {
        it('should handle Moon at exact nakshatra boundaries', () => {
            // Moon at exact start of Bharani (13.333...°)
            const moonPosition = createMockMoonPosition('bharani', 13.333333);
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);
            expect(result.dashaPeriods[0].planet).toBe('venus');
        });

        it('should handle leap years correctly in date calculations', () => {
            const moonPosition = createMockMoonPosition('ashwini', 0);
            const birthDate = new Date('2000-02-29T00:00:00Z'); // Leap year

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);
            
            // Verify that calculations work with leap year birth date
            expect(result.dashaPeriods).toHaveLength(9);
            expect(result.dashaPeriods[0].startDate).toEqual(birthDate);
        });

        it('should maintain full duration for all dashas regardless of nakshatra position', () => {
            const moonPosition = createMockMoonPosition('ashwini', 6.666); // 50% through Ashwini
            const birthDate = new Date('1990-01-01T00:00:00Z');

            const result = DashaCalculator.calculateVimshottariDasha(moonPosition, birthDate);
            
            // First dasha should be the full 7 years (not reduced to 3.5 years)
            const ketuDasha = result.dashaPeriods[0];
            const ketuDurationYears = (ketuDasha.endDate.getTime() - ketuDasha.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            expect(ketuDurationYears).toBeCloseTo(7, 0.01); // Full Ketu period
            
            // Birth date should fall within the dasha period
            expect(birthDate.getTime()).toBeGreaterThanOrEqual(ketuDasha.startDate.getTime());
            expect(birthDate.getTime()).toBeLessThanOrEqual(ketuDasha.endDate.getTime());
        });
    });
});
