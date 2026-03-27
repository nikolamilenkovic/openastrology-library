import { BirthInfo } from '../../src';
import { DashaCalculator, VedicAstrologyCalculator } from '../../src';

describe('DashaCalculator Integration Tests', () => {
    let chartCalculator: VedicAstrologyCalculator;

    beforeEach(() => {
        chartCalculator = new VedicAstrologyCalculator();
    });

    afterEach(() => {
        chartCalculator.dispose();
    });

    describe('Test Person 1', () => {
        const birthInfo: BirthInfo = {
            name: 'Test Person',
            dateOfBirth: '1990-06-15',
            timeOfBirth: '13:00',
            latitude: 40,
            longitude: -74,
            timezone: 'America/New_York'
        };

        it('should calculate mahadasha periods correctly', async () => {
            const chart = await chartCalculator.calculateChart(birthInfo);
            const { birthDateUtc } = chartCalculator['calculateJulianDay'](birthInfo);
            const dasha = DashaCalculator.calculateVimshottariDasha(chart.planets.moon, birthDateUtc);

            expect(dasha.type).toBe('vimshottari');
            expect(dasha.dashaPeriods).toHaveLength(9);
            expect(dasha.dashaPeriods[0].planet).toBe('jupiter');
            expect(dasha.dashaPeriods[0].startDate.toISOString()).toContain('1985-02-26');
            expect(dasha.dashaPeriods[0].endDate.toISOString()).toContain('2001-02-26');
            expect(dasha.dashaPeriods[1].planet).toBe('saturn');
            expect(dasha.dashaPeriods[1].startDate.toISOString()).toContain('2001-02-26');
            expect(dasha.dashaPeriods[1].endDate.toISOString()).toContain('2020-02-26');
            expect(dasha.dashaPeriods[2].planet).toBe('mercury');
            expect(dasha.dashaPeriods[2].startDate.toISOString()).toContain('2020-02-26');
            expect(dasha.dashaPeriods[2].endDate.toISOString()).toContain('2037-02-26');
            expect(dasha.dashaPeriods[3].planet).toBe('ketu');
            expect(dasha.dashaPeriods[3].startDate.toISOString()).toContain('2037-02-26');
            expect(dasha.dashaPeriods[3].endDate.toISOString()).toContain('2044-02-26');
            expect(dasha.dashaPeriods[4].planet).toBe('venus');
            expect(dasha.dashaPeriods[4].startDate.toISOString()).toContain('2044-02-26');
            expect(dasha.dashaPeriods[4].endDate.toISOString()).toContain('2064-02-26');
            expect(dasha.dashaPeriods[5].planet).toBe('sun');
            expect(dasha.dashaPeriods[5].startDate.toISOString()).toContain('2064-02-26');
            expect(dasha.dashaPeriods[5].endDate.toISOString()).toContain('2070-02-26');
            expect(dasha.dashaPeriods[6].planet).toBe('moon');
            expect(dasha.dashaPeriods[6].startDate.toISOString()).toContain('2070-02-26');
            expect(dasha.dashaPeriods[6].endDate.toISOString()).toContain('2080-02-26');
            expect(dasha.dashaPeriods[7].planet).toBe('mars');
            expect(dasha.dashaPeriods[7].startDate.toISOString()).toContain('2080-02-26');
            expect(dasha.dashaPeriods[7].endDate.toISOString()).toContain('2087-02-26');
            expect(dasha.dashaPeriods[8].planet).toBe('rahu');
            expect(dasha.dashaPeriods[8].startDate.toISOString()).toContain('2087-02-26');
            expect(dasha.dashaPeriods[8].endDate.toISOString()).toContain('2105-02-26');
        });
    });
});
