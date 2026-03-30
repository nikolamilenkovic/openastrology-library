import { DateTime } from 'luxon';
import * as swisseph from 'swisseph';
import { ChartPatternCalculator } from './chart-pattern-calculator';
import { WesternAspectCalculator } from './western-aspect-calculator';
import { ZodiacSign, HouseNumber, HouseInfo } from './types/common.types';
import { ZodiacUtils, HouseUtils, FormattingUtils } from './astrological-utils';
import { BirthInfo, WesternChartCalculations, WesternPlanetPosition, WesternPlanet, WesternAspect, WesternAspectType, WesternAstrologyCalculatorOptions, ChartPattern } from './types/western.types';

export { WesternAstrologyCalculatorOptions };

export class WesternAstrologyCalculator {
    private readonly houseSystem: string;
    private readonly customOrbs?: Partial<Record<WesternAspectType, number>>;

    // Swiss Ephemeris codes for Western planets (tropical)
    // south_node is derived from north_node and not fetched from SE directly
    private static readonly PLANET_MAPPING: Record<Exclude<WesternPlanet, 'south_node'>, number> = {
        sun: 0, // SE_SUN
        moon: 1, // SE_MOON
        mercury: 2, // SE_MERCURY
        venus: 3, // SE_VENUS
        mars: 4, // SE_MARS
        jupiter: 5, // SE_JUPITER
        saturn: 6, // SE_SATURN
        uranus: 7, // SE_URANUS
        neptune: 8, // SE_NEPTUNE
        pluto: 9, // SE_PLUTO
        chiron: 15,    // SE_CHIRON
        north_node: 11, // SE_TRUE_NODE (North Node)
        lilith: 12      // SE_MEAN_APOG (Mean Black Moon Lilith)
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

    // Western tropical dignities
    // Domicile (own sign)
    private static readonly DOMICILE: Partial<Record<WesternPlanet, ZodiacSign[]>> = {
        sun: ['leo'],
        moon: ['cancer'],
        mercury: ['gemini', 'virgo'],
        venus: ['taurus', 'libra'],
        mars: ['aries', 'scorpio'],
        jupiter: ['sagittarius', 'pisces'],
        saturn: ['capricorn', 'aquarius'],
        uranus: ['aquarius'],
        neptune: ['pisces'],
        pluto: ['scorpio']
        // Chiron: no traditional domicile
    };

    // Exaltation signs
    private static readonly EXALTATION: Partial<Record<WesternPlanet, ZodiacSign>> = {
        sun: 'aries',
        moon: 'taurus',
        mercury: 'virgo',
        venus: 'pisces',
        mars: 'capricorn',
        jupiter: 'cancer',
        saturn: 'libra'
        // Outer planets / Chiron: contested, omitted
    };

    // Detriment signs (opposite of domicile)
    private static readonly DETRIMENT: Partial<Record<WesternPlanet, ZodiacSign[]>> = {
        sun: ['aquarius'],
        moon: ['capricorn'],
        mercury: ['sagittarius', 'pisces'],
        venus: ['aries', 'scorpio'],
        mars: ['libra', 'taurus'],
        jupiter: ['gemini', 'virgo'],
        saturn: ['cancer', 'leo'],
        uranus: ['leo'],
        neptune: ['virgo'],
        pluto: ['taurus']
    };

    // Fall signs (opposite of exaltation)
    private static readonly FALL: Partial<Record<WesternPlanet, ZodiacSign>> = {
        sun: 'libra',
        moon: 'scorpio',
        mercury: 'pisces',
        venus: 'virgo',
        mars: 'cancer',
        jupiter: 'capricorn',
        saturn: 'aries'
    };

    constructor(options: WesternAstrologyCalculatorOptions = {}) {
        const ephePath = options.ephePath ?? (__dirname + '/ephe');
        swisseph.swe_set_ephe_path(ephePath);
        this.houseSystem = options.houseSystem?.toLowerCase() || 'placidus';
        this.customOrbs = options.orbs;
    }

    // ─── Primary calculation ────────────────────────────────────────────────────

    /**
     * Calculate a complete Western tropical birth chart.
     */
    async calculateChart(birthInfo: BirthInfo): Promise<WesternChartCalculations> {
        try {
            this.validateBirthInfo(birthInfo);

            const { julianDay, birthDateUtc } = this.calculateJulianDay(birthInfo);

            // Western astrology: do NOT set sidereal mode
            // swisseph stays in tropical (default) mode

            const planets = await this.calculatePlanetaryPositions(julianDay);
            const { houses, ascendant, descendant, mc, ic } = await this.calculateHouses(julianDay, birthInfo.latitude, birthInfo.longitude);

            this.assignPlanetsToHouses(planets, houses);

            const aspects = WesternAspectCalculator.calculateAspects(planets, this.customOrbs);
            const patterns = ChartPatternCalculator.detectPatterns(planets, aspects);

            const elementCounts: Record<'fire' | 'earth' | 'air' | 'water', number> = { fire: 0, earth: 0, air: 0, water: 0 };
            const qualityCounts: Record<'cardinal' | 'fixed' | 'mutable', number> = { cardinal: 0, fixed: 0, mutable: 0 };
            for (const planet of Object.values(planets)) {
                elementCounts[planet.element]++;
                qualityCounts[planet.quality]++;
            }

            return {
                birthDateUtc,
                planets,
                houses,
                ascendant,
                descendant,
                mc,
                ic,
                elementCounts,
                qualityCounts,
                aspects,
                patterns
            };
        } catch (error: any) {
            throw new Error(`Western chart calculation failed: ${error.message}`);
        }
    }

    // ─── Aspect helpers (proxied from WesternAspectCalculator) ─────────────────

    /**
     * Recalculate aspects for a set of planet positions (useful after manual edits).
     */
    getAspectsBetween(planets: Record<WesternPlanet, WesternPlanetPosition>): WesternAspect[] {
        return WesternAspectCalculator.calculateAspects(planets, this.customOrbs);
    }

    /**
     * Get the effective orb map in use (defaults + any custom overrides).
     */
    getAspectOrbs(): Record<WesternAspectType, number> {
        return WesternAspectCalculator.getAspectOrbs(this.customOrbs);
    }

    // ─── Pattern helpers (proxied from ChartPatternCalculator) ─────────────────

    /**
     * Detect chart patterns from a set of planet positions and their aspects.
     */
    detectPatterns(planets: Record<WesternPlanet, WesternPlanetPosition>, aspects: WesternAspect[]): ChartPattern[] {
        return ChartPatternCalculator.detectPatterns(planets, aspects);
    }

    /**
     * Release Swiss Ephemeris resources.
     */
    dispose(): void {
        swisseph.swe_close();
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

        if (typeof birthInfo.latitude !== 'number' || birthInfo.latitude < -90 || birthInfo.latitude > 90) throw new Error('Latitude must be a number between -90 and 90');

        if (typeof birthInfo.longitude !== 'number' || birthInfo.longitude < -180 || birthInfo.longitude > 180) throw new Error('Longitude must be a number between -180 and 180');
    }

    private calculateJulianDay(birthInfo: BirthInfo): { julianDay: number; birthDateUtc: Date } {
        const [year, month, day] = birthInfo.dateOfBirth.split('-').map(Number);
        let hour = 0,
            minute = 0;

        if (birthInfo.timeOfBirth) {
            const [h, m] = birthInfo.timeOfBirth.split(':').map(Number);
            hour = h;
            minute = m;
        }

        const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: birthInfo.timezone || 'UTC' });

        const dtUtc = dt.toUTC();
        const timeDecimal = dtUtc.hour + dtUtc.minute / 60 + dtUtc.second / 3600;
        const julianDay = swisseph.swe_julday(dtUtc.year, dtUtc.month, dtUtc.day, timeDecimal, swisseph.SE_GREG_CAL);

        return { julianDay, birthDateUtc: dtUtc.toJSDate() };
    }

    private async calculatePlanetaryPositions(julianDay: number): Promise<Record<WesternPlanet, WesternPlanetPosition>> {
        const planets: Record<WesternPlanet, WesternPlanetPosition> = {} as any;

        for (const [planetName, planetId] of Object.entries(WesternAstrologyCalculator.PLANET_MAPPING) as [WesternPlanet, number][]) {
            try {
                // Tropical mode: SEFLG_SPEED only (no SEFLG_SIDEREAL)
                const result = swisseph.swe_calc(julianDay, planetId, swisseph.SEFLG_SPEED) as any;
                if (result.rflag < 0 || result.error) throw new Error(`Failed to calculate ${planetName} position: ${result.error ?? 'rflag=' + result.rflag}`);

                const longitude = result.longitude || 0;
                const latitude = result.latitude || 0;
                const speed = result.longitudeSpeed || 0;

                const sign = ZodiacUtils.getSignFromLongitude(longitude);
                const degree = ZodiacUtils.getDegreeInSign(longitude);
                const degreeDMS = FormattingUtils.convertToDMS(degree);

                planets[planetName] = {
                    name: planetName,
                    longitude,
                    latitude,
                    sign,
                    degree,
                    degreeDMS,
                    degreeDMSFormatted: FormattingUtils.formatDMS(degreeDMS.degrees, degreeDMS.minutes, degreeDMS.seconds),
                    house: 1, // Assigned later
                    isRetrograde: speed < 0,
                    speed,
                    dignity: this.calculateDignity(planetName, sign),
                    element: ZodiacUtils.getElement(sign),
                    quality: ZodiacUtils.getQuality(sign),
                    aspects: []
                };
            } catch (error: any) {
                throw new Error(`Failed to calculate position for ${planetName}: ${error.message}`);
            }
        }

        // Derive South Node from North Node (exactly 180° opposite on the ecliptic)
        const northNode = planets['north_node'];
        const southNodeLongitude = (northNode.longitude + 180) % 360;
        const southNodeSign = ZodiacUtils.getSignFromLongitude(southNodeLongitude);
        const southNodeDegree = ZodiacUtils.getDegreeInSign(southNodeLongitude);
        const southNodeDegreeDMS = FormattingUtils.convertToDMS(southNodeDegree);
        planets['south_node'] = {
            name: 'south_node',
            longitude: southNodeLongitude,
            latitude: 0,
            sign: southNodeSign,
            degree: southNodeDegree,
            degreeDMS: southNodeDegreeDMS,
            degreeDMSFormatted: FormattingUtils.formatDMS(southNodeDegreeDMS.degrees, southNodeDegreeDMS.minutes, southNodeDegreeDMS.seconds),
            house: 1, // assigned later in assignPlanetsToHouses
            isRetrograde: northNode.isRetrograde,
            speed: northNode.speed,
            dignity: this.calculateDignity('south_node', southNodeSign),
            element: ZodiacUtils.getElement(southNodeSign),
            quality: ZodiacUtils.getQuality(southNodeSign),
            aspects: []
        };

        return planets;
    }

    private async calculateHouses(julianDay: number, latitude: number, longitude: number): Promise<{ houses: Record<HouseNumber, HouseInfo>; ascendant: any; descendant: any; mc: any; ic: any }> {
        const hsysCode = WesternAstrologyCalculator.HOUSE_SYSTEM_MAPPING[this.houseSystem] || 'P';
        const result = swisseph.swe_houses(julianDay, latitude, longitude, hsysCode) as any;

        if (!result || !result.house) throw new Error('Failed to calculate houses: Invalid result from Swiss Ephemeris');

        // Western: use tropical ascendant directly (no ayanamsa subtraction)
        const ascendantLongitude = result.ascendant % 360;
        const ascendantSign = ZodiacUtils.getSignFromLongitude(ascendantLongitude);
        const ascendantDegree = ZodiacUtils.getDegreeInSign(ascendantLongitude);
        const ascendantDegreeDMS = FormattingUtils.convertToDMS(ascendantDegree);

        const ascendant = {
            sign: ascendantSign,
            degree: ascendantDegree,
            degreeDMSFormatted: FormattingUtils.formatDMS(ascendantDegreeDMS.degrees, ascendantDegreeDMS.minutes, ascendantDegreeDMS.seconds),
            longitude: ascendantLongitude
        };

        // Descendant: exactly opposite the Ascendant
        const descendantLongitude = (ascendantLongitude + 180) % 360;
        const descendantSign = ZodiacUtils.getSignFromLongitude(descendantLongitude);
        const descendantDegree = ZodiacUtils.getDegreeInSign(descendantLongitude);
        const descendantDegreeDMS = FormattingUtils.convertToDMS(descendantDegree);
        const descendant = {
            sign: descendantSign,
            degree: descendantDegree,
            degreeDMSFormatted: FormattingUtils.formatDMS(descendantDegreeDMS.degrees, descendantDegreeDMS.minutes, descendantDegreeDMS.seconds),
            longitude: descendantLongitude
        };

        // MC (Midheaven): returned directly by Swiss Ephemeris
        const mcLongitude = result.mc % 360;
        const mcSign = ZodiacUtils.getSignFromLongitude(mcLongitude);
        const mcDegree = ZodiacUtils.getDegreeInSign(mcLongitude);
        const mcDegreeDMS = FormattingUtils.convertToDMS(mcDegree);
        const mc = {
            sign: mcSign,
            degree: mcDegree,
            degreeDMSFormatted: FormattingUtils.formatDMS(mcDegreeDMS.degrees, mcDegreeDMS.minutes, mcDegreeDMS.seconds),
            longitude: mcLongitude
        };

        // IC (Imum Coeli): exactly opposite the MC
        const icLongitude = (mcLongitude + 180) % 360;
        const icSign = ZodiacUtils.getSignFromLongitude(icLongitude);
        const icDegree = ZodiacUtils.getDegreeInSign(icLongitude);
        const icDegreeDMS = FormattingUtils.convertToDMS(icDegree);
        const ic = {
            sign: icSign,
            degree: icDegree,
            degreeDMSFormatted: FormattingUtils.formatDMS(icDegreeDMS.degrees, icDegreeDMS.minutes, icDegreeDMS.seconds),
            longitude: icLongitude
        };

        const houses: Record<HouseNumber, HouseInfo> = {} as any;

        for (let i = 0; i < 12; i++) {
            const houseNum = (i + 1) as HouseNumber;
            const cusp = result.house[i] % 360;
            const sign = ZodiacUtils.getSignFromLongitude(cusp);
            const lord = ZodiacUtils.getSignLord(sign);

            houses[houseNum] = {
                number: houseNum,
                cusp,
                sign,
                lord,
                planets: [],
                strength: this.calculateHouseStrength(houseNum),
                significance: HouseUtils.getHouseSignificance(houseNum)
            };
        }

        return { houses, ascendant, descendant, mc, ic };
    }

    private assignPlanetsToHouses(planets: Record<WesternPlanet, WesternPlanetPosition>, houses: Record<HouseNumber, HouseInfo>): void {
        const houseCusps: number[] = [];
        for (let i = 1; i <= 12; i++) houseCusps.push(houses[i as HouseNumber].cusp);

        for (const [planetName, planetPos] of Object.entries(planets) as [WesternPlanet, WesternPlanetPosition][]) {
            const house = this.findHouseForPlanet(planetPos.longitude, houseCusps);
            planetPos.house = house;
            houses[house].planets.push(planetName);
        }
    }

    private findHouseForPlanet(longitude: number, houseCusps: number[]): HouseNumber {
        for (let i = 0; i < 12; i++) {
            const currentCusp = houseCusps[i];
            const nextCusp = houseCusps[(i + 1) % 12];

            if (nextCusp > currentCusp) {
                if (longitude >= currentCusp && longitude < nextCusp) return (i + 1) as HouseNumber;
            } else {
                // Crosses 0°
                if (longitude >= currentCusp || longitude < nextCusp) return (i + 1) as HouseNumber;
            }
        }
        return 1;
    }

    private calculateDignity(planet: WesternPlanet, sign: ZodiacSign): string {
        if (WesternAstrologyCalculator.EXALTATION[planet] === sign) return 'Exalted';
        if (WesternAstrologyCalculator.FALL[planet] === sign) return 'Fall';
        if (WesternAstrologyCalculator.DOMICILE[planet]?.includes(sign)) return 'Domicile';
        if (WesternAstrologyCalculator.DETRIMENT[planet]?.includes(sign)) return 'Detriment';
        return 'Neutral';
    }

    private calculateHouseStrength(houseNumber: HouseNumber): number {
        let strength = 50;
        if ([1, 4, 7, 10].includes(houseNumber)) strength += 20; // Angular
        if ([2, 5, 8, 11].includes(houseNumber)) strength += 5; // Succedent
        if ([3, 6, 9, 12].includes(houseNumber)) strength -= 10; // Cadent
        return Math.max(0, Math.min(100, strength));
    }
}
