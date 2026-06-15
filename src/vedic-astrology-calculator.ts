import { DateTime } from 'luxon';
import { set_ephe_path, set_sid_mode, get_ayanamsa, julday, calc, houses as calcHouses, close, constants } from 'sweph';
import { YogaCalculator } from './yoga-calculator';
import { DashaCalculator } from './dasha-calculator';
import { AspectCalculator } from './aspect-calculator';
import { AshtakavargaCalculator } from './ashtakavarga-calculator';
import { DivisionalChartCalculator } from './divisional-chart-calculator';
import { ZodiacUtils, NakshatraUtils, HouseUtils, FormattingUtils } from './astrological-utils';
import { BirthInfo, VedicChartCalculations, PlanetPosition, HouseInfo, Planet, ZodiacSign, HouseNumber, VedicAstrologyCalculatorOptions, PlanetAspect, VimshottariDasha, PlanetDasha, Nakshatra, AshtakavargaCalculations } from './types/vedic.types';

export { VedicAstrologyCalculatorOptions };

export class VedicAstrologyCalculator {
    private readonly ayanamsa: string;
    private readonly houseSystem: string;

    private static readonly PLANET_MAPPING: Record<string, number> = {
        sun: constants.SE_SUN,
        moon: constants.SE_MOON,
        mercury: constants.SE_MERCURY,
        venus: constants.SE_VENUS,
        mars: constants.SE_MARS,
        jupiter: constants.SE_JUPITER,
        saturn: constants.SE_SATURN,
        rahu: constants.SE_TRUE_NODE,
        ketu: constants.SE_TRUE_NODE // Ketu is 180 degrees from Rahu
    };

    // Combustion distances in degrees (traditional Vedic values)
    private static readonly COMBUSTION_DISTANCES: Record<Planet, number> = {
        sun: 0, // Sun cannot be combust
        moon: 12,
        mercury: 14,
        venus: 10,
        mars: 17,
        jupiter: 11,
        saturn: 15,
        rahu: 0, // Shadow planets are not traditionally considered combust
        ketu: 0
    };

    private static readonly AYANAMSA_MAPPING: Record<string, number> = {
        lahiri: constants.SE_SIDM_LAHIRI,
        raman: constants.SE_SIDM_RAMAN,
        krishnamurti: constants.SE_SIDM_KRISHNAMURTI,
        yukteshwar: constants.SE_SIDM_YUKTESHWAR,
        jnbhasin: constants.SE_SIDM_JN_BHASIN,
        babinaikamytry: constants.SE_SIDM_BABYL_KUGLER1,
        truecitra: constants.SE_SIDM_TRUE_CITRA,
        truerevati: constants.SE_SIDM_TRUE_REVATI,
        truepushya: constants.SE_SIDM_TRUE_PUSHYA
    };

    private static readonly HOUSE_SYSTEM_MAPPING: Record<string, string> = {
        placidus: 'P',
        koch: 'K',
        equal: 'E',
        campanus: 'C',
        meridian: 'M',
        regiomontanus: 'R',
        porphyrius: 'O',
        morinus: 'U',
        wholehouse: 'W'
    };

    constructor(options: VedicAstrologyCalculatorOptions = {}) {
        const ephePath = options.ephePath ?? (__dirname + '/ephe');
        set_ephe_path(ephePath);

        this.ayanamsa = options.ayanamsa?.toLowerCase() || 'lahiri';
        this.houseSystem = options.houseSystem?.toLowerCase() || 'equal';
    }

    // ─── Primary calculation ────────────────────────────────────────────────────

    /**
     * Calculate a complete Vedic birth chart.
     */
    async calculateChart(birthInfo: BirthInfo): Promise<VedicChartCalculations> {
        try {
            this.validateBirthInfo(birthInfo);

            const { julianDay, birthDateUtc } = this.calculateJulianDay(birthInfo);

            const ayanamsaType = VedicAstrologyCalculator.AYANAMSA_MAPPING[this.ayanamsa] || constants.SE_SIDM_LAHIRI;
            set_sid_mode(ayanamsaType, 0, 0);

            const ayanamsaValue = get_ayanamsa(julianDay);

            const planets = await this.calculatePlanetaryPositions(julianDay);
            const { houses, ascendant } = await this.calculateHouses(julianDay, birthInfo.latitude, birthInfo.longitude, this.houseSystem);

            this.assignPlanetsToHouses(planets, houses, this.houseSystem);

            AspectCalculator.calculateVedicAspects(planets);

            const yogas = YogaCalculator.calculateYogas(planets);

            const dashas = {
                vimshottari: DashaCalculator.calculateVimshottariDasha(planets.moon, birthDateUtc)
            };

            const ashtakavarga = AshtakavargaCalculator.calculateAshtakavarga(planets, ascendant.sign);

            return {
                birthDateUtc,
                planets,
                houses,
                yogas,
                dashas,
                ayanamsa: ayanamsaValue,
                ascendant,
                ashtakavarga
            };
        } catch (error: any) {
            throw new Error(`Chart calculation failed: ${error.message}`);
        }
    }

    // ─── Divisional chart (proxied from DivisionalChartCalculator) ──────────────

    /**
     * Calculate a divisional chart (Varga) from the base birth chart.
     * @param chart  The Vedic birth chart returned by calculateChart()
     * @param type   Divisional chart type string, e.g. 'D9', 'D10'
     */
    calculateDivisionalChart(chart: VedicChartCalculations, type: string): VedicChartCalculations {
        return DivisionalChartCalculator.calculateDivisionalChart(chart, type);
    }

    /**
     * Calculate all supported divisional charts at once.
     */
    calculateAllDivisionalCharts(chart: VedicChartCalculations): Record<string, VedicChartCalculations> {
        return DivisionalChartCalculator.calculateAllDivisionalCharts(chart);
    }

    // ─── Dasha helpers (proxied from DashaCalculator) ──────────────────────────

    /**
     * Find the current Maha Dasha and Antar Dasha for a given date.
     */
    getCurrentDasha(dashas: VimshottariDasha, date: Date): { mahaDasha?: PlanetDasha; antarDasha?: PlanetDasha } {
        return DashaCalculator.getCurrentDasha(dashas, date);
    }

    /**
     * Get the remaining time in a dasha period.
     */
    getRemainingDashaTime(dasha: PlanetDasha, currentDate: Date): { years: number; months: number; days: number } {
        return DashaCalculator.getRemainingDashaTime(dasha, currentDate);
    }

    /**
     * Get the dasha lord planet for a given nakshatra.
     */
    getDashaLord(nakshatra: Nakshatra): Planet {
        return DashaCalculator.getDashaLord(nakshatra);
    }

    // ─── Aspect helpers (proxied from AspectCalculator) ─────────────────────────

    /**
     * Find planets in mutual reception (exchange of sign lords).
     */
    getMutualReception(planets: Record<Planet, PlanetPosition>): Array<{ planet1: Planet; planet2: Planet }> {
        return AspectCalculator.getMutualReception(planets);
    }

    /**
     * Get the Vedic aspect distances (house offsets) cast by a planet.
     */
    getPlanetAspects(planet: Planet): number[] {
        return AspectCalculator.getPlanetAspects(planet);
    }

    /**
     * Get a human-readable description of a planet's aspects.
     */
    getAspectDescription(planet: Planet, aspects: PlanetAspect[]): string {
        return AspectCalculator.getAspectDescription(planet, aspects);
    }

    // ─── Ashtakavarga (proxied from AshtakavargaCalculator) ─────────────────────

    /**
     * Calculate Bhinna and Sarva Ashtakavarga for a birth chart.
     * @param chart  The Vedic birth chart returned by calculateChart()
     */
    calculateAshtakavarga(chart: VedicChartCalculations): AshtakavargaCalculations {
        return AshtakavargaCalculator.calculateAshtakavarga(chart.planets, chart.ascendant.sign);
    }

    // ─── Combustion ─────────────────────────────────────────────────────────────

    /**
     * Get detailed combustion information for a planet.
     */
    getCombustionInfo(
        planetName: Planet,
        planetLongitude: number,
        sunLongitude: number
    ): { isCombust: boolean; distance: number; combustionDistance: number; severity?: 'Mild' | 'Moderate' | 'Severe' } {
        const isCombust = this.isPlanetCombust(planetName, planetLongitude, sunLongitude);

        let distance = Math.abs(planetLongitude - sunLongitude);
        if (distance > 180) distance = 360 - distance;

        const combustionDistance = VedicAstrologyCalculator.COMBUSTION_DISTANCES[planetName];

        let severity: 'Mild' | 'Moderate' | 'Severe' | undefined;
        if (isCombust && combustionDistance > 0) {
            const ratio = distance / combustionDistance;
            if (ratio <= 0.3) severity = 'Severe';
            else if (ratio <= 0.6) severity = 'Moderate';
            else severity = 'Mild';
        }

        return { isCombust, distance, combustionDistance, severity };
    }

    /**
     * Release Swiss Ephemeris resources.
     */
    dispose(): void {
        close();
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private validateBirthInfo(birthInfo: BirthInfo): void {
        if (!birthInfo) throw new Error('Birth information is required');
        if (!birthInfo.dateOfBirth) throw new Error('Date of birth is required');

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(birthInfo.dateOfBirth)) throw new Error('Invalid date format. Expected YYYY-MM-DD');

        const birthDate = new Date(birthInfo.dateOfBirth);
        if (isNaN(birthDate.getTime())) throw new Error('Invalid birth date');

        const now = new Date();
        const minDate = new Date(1800, 0, 1);
        if (birthDate > now) throw new Error('Birth date cannot be in the future');
        if (birthDate < minDate) throw new Error('Birth date too far in the past');

        if (birthInfo.timeOfBirth) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(birthInfo.timeOfBirth)) throw new Error('Invalid time format. Expected HH:MM');
        }

        if (typeof birthInfo.latitude !== 'number' || birthInfo.latitude < -90 || birthInfo.latitude > 90)
            throw new Error('Latitude must be a number between -90 and 90');

        if (typeof birthInfo.longitude !== 'number' || birthInfo.longitude < -180 || birthInfo.longitude > 180)
            throw new Error('Longitude must be a number between -180 and 180');

    }

    private calculateJulianDay(birthInfo: BirthInfo): { julianDay: number; birthDateUtc: Date } {
        const [year, month, day] = birthInfo.dateOfBirth.split('-').map(Number);

        let hour = 0;
        let minute = 0;

        if (birthInfo.timeOfBirth) {
            const [h, m] = birthInfo.timeOfBirth.split(':').map(Number);
            hour = h;
            minute = m;
        }

        const dt = DateTime.fromObject(
            { year, month, day, hour, minute },
            { zone: birthInfo.timezone || 'UTC' }
        );

        const dtUtc = dt.toUTC();
        const timeDecimal = dtUtc.hour + dtUtc.minute / 60 + dtUtc.second / 3600;
        const julianDay = julday(dtUtc.year, dtUtc.month, dtUtc.day, timeDecimal, constants.SE_GREG_CAL);
        const birthDateUtc = dt.toUTC().toJSDate();

        return { julianDay, birthDateUtc };
    }

    private async calculatePlanetaryPositions(julianDay: number): Promise<Record<Planet, PlanetPosition>> {
        const planets: Record<Planet, PlanetPosition> = {} as any;
        let sunLongitude = 0;

        const sunResult = calc(julianDay, constants.SE_SUN, constants.SEFLG_SIDEREAL | constants.SEFLG_SPEED);
        if (sunResult.flag >= 0) sunLongitude = sunResult.data[0] || 0;

        for (const [planetName, planetId] of Object.entries(VedicAstrologyCalculator.PLANET_MAPPING)) {
            try {
                let position: number[];

                if (planetName === 'ketu') {
                    const rahuResult = calc(julianDay, constants.SE_TRUE_NODE, constants.SEFLG_SIDEREAL | constants.SEFLG_SPEED);
                    if (rahuResult.flag < 0) throw new Error(`Failed to calculate Rahu position for Ketu calculation`);
                    position = [
                        (rahuResult.data[0] + 180) % 360,
                        rahuResult.data[1] || 0,
                        rahuResult.data[2] || 1,
                        rahuResult.data[3] || 0,
                        rahuResult.data[4] || 0,
                        rahuResult.data[5] || 0
                    ];
                } else {
                    const result = calc(julianDay, planetId, constants.SEFLG_SIDEREAL | constants.SEFLG_SPEED);
                    if (result.flag < 0) throw new Error(`Failed to calculate ${planetName} position`);
                    position = [
                        result.data[0] || 0,
                        result.data[1] || 0,
                        result.data[2] || 1,
                        result.data[3] || 0,
                        result.data[4] || 0,
                        result.data[5] || 0
                    ];
                }

                const longitude = position[0];
                const latitude = position[1];
                const speed = position[3];

                const sign = ZodiacUtils.getSignFromLongitude(longitude);
                const degree = ZodiacUtils.getDegreeInSign(longitude);
                const nakshatra = NakshatraUtils.getNakshatraFromLongitude(longitude);
                const nakshatraPada = NakshatraUtils.getNakshatraPada(longitude);
                const degreeDMS = FormattingUtils.convertToDMS(degree);

                planets[planetName as Planet] = {
                    name: planetName,
                    longitude,
                    latitude,
                    sign,
                    degree,
                    degreeDMS,
                    degreeDMSFormatted: FormattingUtils.formatDMS(degreeDMS.degrees, degreeDMS.minutes, degreeDMS.seconds),
                    nakshatra,
                    nakshatraPada,
                    pada: nakshatraPada,
                    house: 1, // Assigned later
                    isRetrograde: planetName === 'rahu' || planetName === 'ketu' ? true : speed < 0,
                    isCombust: this.isPlanetCombust(planetName as Planet, longitude, sunLongitude),
                    speed,
                    dignity: this.calculatePlanetaryDignity(planetName as Planet, sign),
                    aspects: []
                };
            } catch (error: any) {
                throw new Error(`Failed to calculate position for ${planetName}: ${error.message}`);
            }
        }

        return planets;
    }

    private async calculateHouses(
        julianDay: number,
        latitude: number,
        longitude: number,
        houseSystem?: string
    ): Promise<{ houses: Record<HouseNumber, HouseInfo>; ascendant: any }> {
        const systemToUse = houseSystem || this.houseSystem;
        const hsysCode = VedicAstrologyCalculator.HOUSE_SYSTEM_MAPPING[systemToUse] || 'E';

        const ayanamsaValue = get_ayanamsa(julianDay);
        const result = calcHouses(julianDay, latitude, longitude, hsysCode);

        if (!result || !result.data?.houses) throw new Error(`Failed to calculate houses: Invalid result from Swiss Ephemeris`);

        let ascendantLongitude = (result.data.points[0] - ayanamsaValue + 360) % 360;

        const ascendantSign = ZodiacUtils.getSignFromLongitude(ascendantLongitude);
        const ascendantDegree = ZodiacUtils.getDegreeInSign(ascendantLongitude);
        const ascendantDegreeDMS = FormattingUtils.convertToDMS(ascendantDegree);
        const ascendantNakshatra = NakshatraUtils.getNakshatraFromLongitude(ascendantLongitude);
        const ascendantNakshatraPada = NakshatraUtils.getNakshatraPada(ascendantLongitude);

        const ascendant = {
            sign: ascendantSign,
            degree: ascendantDegree,
            degreeDMSFormatted: FormattingUtils.formatDMS(ascendantDegreeDMS.degrees, ascendantDegreeDMS.minutes, ascendantDegreeDMS.seconds),
            nakshatra: ascendantNakshatra,
            nakshatraPada: ascendantNakshatraPada,
            longitude: ascendantLongitude
        };

        const houses: Record<HouseNumber, HouseInfo> = {} as any;

        if (systemToUse === 'wholehouse') {
            const ascendantSignIndex = Math.floor(ascendantLongitude / 30);
            for (let i = 1; i <= 12; i++) {
                const houseNum = i as HouseNumber;
                const houseSignIndex = (ascendantSignIndex + i - 1) % 12;
                const cusp = houseSignIndex * 30;
                const sign = ZodiacUtils.getSignFromLongitude(cusp);
                const lord = ZodiacUtils.getSignLord(sign);
                houses[houseNum] = {
                    number: houseNum, cusp, sign, lord,
                    planets: [],
                    strength: this.calculateHouseStrength(houseNum, sign),
                    significance: HouseUtils.getHouseSignificance(houseNum)
                };
            }
        } else if (systemToUse === 'equal') {
            for (let i = 1; i <= 12; i++) {
                const houseNum = i as HouseNumber;
                const cusp = (ascendantLongitude + (i - 1) * 30) % 360;
                const sign = ZodiacUtils.getSignFromLongitude(cusp);
                const lord = ZodiacUtils.getSignLord(sign);
                houses[houseNum] = {
                    number: houseNum, cusp, sign, lord,
                    planets: [],
                    strength: this.calculateHouseStrength(houseNum, sign),
                    significance: HouseUtils.getHouseSignificance(houseNum)
                };
            }
        } else {
            for (let i = 0; i < 12; i++) {
                const houseNum = (i + 1) as HouseNumber;
                const cusp = (result.data.houses[i] - ayanamsaValue + 360) % 360;
                const sign = ZodiacUtils.getSignFromLongitude(cusp);
                const lord = ZodiacUtils.getSignLord(sign);
                houses[houseNum] = {
                    number: houseNum, cusp, sign, lord,
                    planets: [],
                    strength: this.calculateHouseStrength(houseNum, sign),
                    significance: HouseUtils.getHouseSignificance(houseNum)
                };
            }
        }

        return { houses, ascendant };
    }

    private assignPlanetsToHouses(
        planets: Record<Planet, PlanetPosition>,
        houses: Record<HouseNumber, HouseInfo>,
        houseSystem?: string
    ): void {
        const systemToUse = houseSystem || this.houseSystem;
        const houseCusps: number[] = [];
        for (let i = 1; i <= 12; i++) houseCusps.push(houses[i as HouseNumber].cusp);

        const isWholeSignHouses = systemToUse === 'wholehouse';
        const isEqualHouses = systemToUse === 'equal';

        for (const [planetName, planetPos] of Object.entries(planets)) {
            const house = this.findHouseForPlanet(planetPos.longitude, houseCusps, isWholeSignHouses, isEqualHouses);
            planetPos.house = house;
            houses[house].planets.push(planetName);
        }
    }

    private findHouseForPlanet(
        longitude: number,
        houseCusps: number[],
        isWholeSignHouses = false,
        isEqualHouses = false
    ): HouseNumber {
        if (isWholeSignHouses) {
            const planetSignIndex = Math.floor(longitude / 30);
            for (let i = 0; i < 12; i++) {
                if (Math.floor(houseCusps[i] / 30) === planetSignIndex) return (i + 1) as HouseNumber;
            }
        } else if (isEqualHouses) {
            const ascendantSignIndex = Math.floor(houseCusps[0] / 30);
            const planetSignIndex = Math.floor(longitude / 30);
            return ((planetSignIndex - ascendantSignIndex + 12) % 12 + 1) as HouseNumber;
        } else {
            for (let i = 0; i < 12; i++) {
                const currentCusp = houseCusps[i];
                const nextCusp = houseCusps[(i + 1) % 12];
                if (nextCusp > currentCusp) {
                    if (longitude >= currentCusp && longitude < nextCusp) return (i + 1) as HouseNumber;
                } else {
                    if (longitude >= currentCusp || longitude < nextCusp) return (i + 1) as HouseNumber;
                }
            }
        }
        return 1;
    }

    private calculatePlanetaryDignity(planet: Planet, sign: ZodiacSign): string {
        const exaltation: Record<Planet, ZodiacSign> = {
            sun: 'aries', moon: 'taurus', mars: 'capricorn', mercury: 'virgo',
            jupiter: 'cancer', venus: 'pisces', saturn: 'libra',
            rahu: 'gemini', ketu: 'sagittarius'
        };
        const debilitation: Record<Planet, ZodiacSign> = {
            sun: 'libra', moon: 'scorpio', mars: 'cancer', mercury: 'pisces',
            jupiter: 'capricorn', venus: 'virgo', saturn: 'aries',
            rahu: 'sagittarius', ketu: 'gemini'
        };
        const ownSigns: Record<Planet, ZodiacSign[]> = {
            sun: ['leo'], moon: ['cancer'], mars: ['aries', 'scorpio'],
            mercury: ['gemini', 'virgo'], jupiter: ['sagittarius', 'pisces'],
            venus: ['taurus', 'libra'], saturn: ['capricorn', 'aquarius'],
            rahu: [], ketu: []
        };

        if (exaltation[planet] === sign) return 'Exalted';
        if (debilitation[planet] === sign) return 'Debilitated';
        if (ownSigns[planet]?.includes(sign)) return 'Own Sign';
        return 'Neutral';
    }

    private calculateHouseStrength(houseNumber: HouseNumber, _sign: ZodiacSign): number {
        let strength = 50;
        if ([1, 4, 7, 10].includes(houseNumber)) strength += 20;
        if ([1, 5, 9].includes(houseNumber)) strength += 15;
        if ([6, 8, 12].includes(houseNumber)) strength -= 15;
        return Math.max(0, Math.min(100, strength));
    }

    private isPlanetCombust(planetName: Planet, planetLongitude: number, sunLongitude: number): boolean {
        if (planetName === 'sun' || planetName === 'rahu' || planetName === 'ketu') return false;
        const combustionDistance = VedicAstrologyCalculator.COMBUSTION_DISTANCES[planetName];
        if (combustionDistance === 0) return false;
        let angularDistance = Math.abs(planetLongitude - sunLongitude);
        if (angularDistance > 180) angularDistance = 360 - angularDistance;
        return angularDistance <= combustionDistance;
    }
}
