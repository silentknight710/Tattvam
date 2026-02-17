import { FuelConsumption, ElectricityConsumption, EmissionFactor } from '../types/emissions';

// Unit conversion helpers
export function gjToTj(gj: number): number {
    return gj / 1000;
}

export function kwhToMwh(kwh: number): number {
    return kwh / 1000;
}

// Scope 1 calculation
export interface Scope1Result {
    totalEmissions: number; // tCO2e
    breakdown: {
        fuelType: string;
        quantity: number;
        energy: number; // TJ
        emissions: number; // tCO2e
    }[];
}

export function calculateScope1Emissions(
    fuelData: FuelConsumption[],
    emissionFactors: EmissionFactor[]
): Scope1Result {
    const breakdown: Scope1Result['breakdown'] = [];
    let totalEmissions = 0;

    // Group by fuel type
    const fuelGroups = fuelData.reduce((acc, fuel) => {
        if (!acc[fuel.fuel_type]) {
            acc[fuel.fuel_type] = [];
        }
        acc[fuel.fuel_type].push(fuel);
        return acc;
    }, {} as Record<string, FuelConsumption[]>);

    // Calculate emissions for each fuel type
    for (const [fuelType, fuels] of Object.entries(fuelGroups)) {
        // Find emission factor
        const emissionFactor = emissionFactors.find(
            ef => ef.category === 'fuel' && ef.subcategory === fuelType
        );

        if (!emissionFactor) {
            console.warn(`No emission factor found for fuel type: ${fuelType}`);
            continue;
        }

        // Sum up all fuel of this type
        const totalQuantity = fuels.reduce((sum, f) => sum + f.quantity, 0);

        // Use average calorific value or default from first entry
        const avgCalorificValue = fuels[0].calorific_value || getDefaultCalorificValue(fuelType);

        // Calculate energy in TJ
        const energyGJ = totalQuantity * avgCalorificValue;
        const energyTJ = gjToTj(energyGJ);

        // Calculate emissions (EF is in tCO2/TJ)
        const emissions = energyTJ * emissionFactor.factor;

        breakdown.push({
            fuelType,
            quantity: totalQuantity,
            energy: energyTJ,
            emissions
        });

        totalEmissions += emissions;
    }

    return {
        totalEmissions,
        breakdown
    };
}

// Scope 2 calculation
export interface Scope2Result {
    totalEmissions: number; // tCO2e
    gridEmissions: number;
    captiveEmissions: number; // Should be 0 (counted in Scope 1)
}

export function calculateScope2Emissions(
    electricityData: ElectricityConsumption[],
    emissionFactors: EmissionFactor[],
    state: string
): Scope2Result {
    let gridEmissions = 0;

    // Find grid emission factor for the state
    const gridEF = emissionFactors.find(
        ef => ef.category === 'grid' &&
            ef.subcategory === 'state_grid' &&
            ef.region?.toLowerCase() === state.toLowerCase()
    );

    if (!gridEF) {
        console.warn(`No grid emission factor found for state: ${state}`);
        return { totalEmissions: 0, gridEmissions: 0, captiveEmissions: 0 };
    }

    // Calculate emissions for each electricity record
    electricityData.forEach(elec => {
        if (elec.source === 'grid') {
            const consumptionMWh = kwhToMwh(elec.consumption);
            const emissions = consumptionMWh * gridEF.factor;
            gridEmissions += emissions;
        }
        // Captive power emissions are already counted in Scope 1 (fuel combustion)
    });

    return {
        totalEmissions: gridEmissions,
        gridEmissions,
        captiveEmissions: 0
    };
}

// GEI calculation
export interface GEIResult {
    gei: number; // tCO2e per unit
    totalEmissions: number;
    productionVolume: number;
    unit: string;
}

export function calculateGEI(
    totalEmissions: number,
    productionVolume: number,
    productionUnit: string
): GEIResult {
    if (productionVolume === 0) {
        return {
            gei: 0,
            totalEmissions,
            productionVolume,
            unit: productionUnit
        };
    }

    const gei = totalEmissions / productionVolume;

    return {
        gei,
        totalEmissions,
        productionVolume,
        unit: productionUnit
    };
}

// Aggregate emissions by month
export interface MonthlyEmissions {
    month: string; // YYYY-MM
    scope1: number;
    scope2: number;
    total: number;
    gei?: number;
}

export function aggregateEmissionsByMonth(
    emissions: Array<{
        date: string;
        scope1: number;
        scope2: number;
        production?: number;
    }>
): MonthlyEmissions[] {
    const monthlyData: Record<string, MonthlyEmissions> = {};

    emissions.forEach(e => {
        const month = e.date.substring(0, 7); // YYYY-MM

        if (!monthlyData[month]) {
            monthlyData[month] = {
                month,
                scope1: 0,
                scope2: 0,
                total: 0
            };
        }

        monthlyData[month].scope1 += e.scope1;
        monthlyData[month].scope2 += e.scope2;
        monthlyData[month].total += e.scope1 + e.scope2;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
}

// Default calorific values (GJ/unit)
function getDefaultCalorificValue(fuelType: string): number {
    const defaults: Record<string, number> = {
        'coal': 24.5,           // GJ/tonne
        'natural_gas': 38.0,    // GJ/thousand cubic meters
        'diesel': 43.0,         // GJ/tonne
        'biomass': 15.0,        // GJ/tonne
        'furnace_oil': 40.0     // GJ/tonne
    };

    return defaults[fuelType] || 0;
}
