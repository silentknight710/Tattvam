import { supabase } from '../supabase';
import { FuelConsumption, ElectricityConsumption, EmissionFactor } from '../types/emissions';
import {
    calculateScope1Emissions,
    calculateScope2Emissions,
    calculateGEI,
    Scope1Result,
    Scope2Result,
    GEIResult
} from '../calculations/emissionsCalculator';

export interface EmissionsCalculationResult {
    date: string;
    scope1: Scope1Result;
    scope2: Scope2Result;
    gei: GEIResult;
    totalEmissions: number;
}

// Fetch fuel consumption data
export async function fetchFuelConsumption(
    plantId: string,
    startDate?: string,
    endDate?: string
): Promise<FuelConsumption[]> {
    let query = supabase
        .from('fuel_consumption')
        .select('*')
        .eq('plant_id', plantId)
        .order('date', { ascending: true });

    if (startDate) {
        query = query.gte('date', startDate);
    }
    if (endDate) {
        query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching fuel consumption:', error);
        throw error;
    }

    return data || [];
}

// Fetch electricity consumption data
export async function fetchElectricityConsumption(
    plantId: string,
    startDate?: string,
    endDate?: string
): Promise<ElectricityConsumption[]> {
    let query = supabase
        .from('electricity_consumption')
        .select('*')
        .eq('plant_id', plantId)
        .order('date', { ascending: true });

    if (startDate) {
        query = query.gte('date', startDate);
    }
    if (endDate) {
        query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching electricity consumption:', error);
        throw error;
    }

    return data || [];
}

// Fetch emission factors
export async function fetchEmissionFactors(): Promise<EmissionFactor[]> {
    const { data, error } = await supabase
        .from('emission_factors')
        .select('*');

    if (error) {
        console.error('Error fetching emission factors:', error);
        throw error;
    }

    return data || [];
}

// Fetch production data
export async function fetchProductionData(
    plantId: string,
    startDate?: string,
    endDate?: string
): Promise<any[]> {
    let query = supabase
        .from('production_data')
        .select('*')
        .eq('plant_id', plantId)
        .order('date', { ascending: true });

    if (startDate) {
        query = query.gte('date', startDate);
    }
    if (endDate) {
        query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching production data:', error);
        throw error;
    }

    return data || [];
}

// Calculate and save emissions for a date range
export async function calculateAndSaveEmissions(
    plantId: string,
    startDate: string,
    endDate: string
): Promise<EmissionsCalculationResult[]> {
    try {
        // Fetch all required data
        const [fuelData, electricityData, emissionFactors, productionData, plantData] = await Promise.all([
            fetchFuelConsumption(plantId, startDate, endDate),
            fetchElectricityConsumption(plantId, startDate, endDate),
            fetchEmissionFactors(),
            fetchProductionData(plantId, startDate, endDate),
            supabase.from('plants').select('state').eq('id', plantId).single()
        ]);

        if (!plantData.data) {
            throw new Error('Plant not found');
        }

        const state = plantData.data.state || 'Andhra Pradesh';

        // Group data by date
        const dateMap: Record<string, {
            fuel: FuelConsumption[];
            electricity: ElectricityConsumption[];
            production?: any;
        }> = {};

        fuelData.forEach(f => {
            if (!dateMap[f.date]) {
                dateMap[f.date] = { fuel: [], electricity: [] };
            }
            dateMap[f.date].fuel.push(f);
        });

        electricityData.forEach(e => {
            if (!dateMap[e.date]) {
                dateMap[e.date] = { fuel: [], electricity: [] };
            }
            dateMap[e.date].electricity.push(e);
        });

        productionData.forEach(p => {
            if (dateMap[p.date]) {
                dateMap[p.date].production = p;
            }
        });

        // Calculate emissions for each date
        const results: EmissionsCalculationResult[] = [];
        const emissionsToSave: any[] = [];

        for (const [date, data] of Object.entries(dateMap)) {
            const scope1 = calculateScope1Emissions(data.fuel, emissionFactors);
            const scope2 = calculateScope2Emissions(data.electricity, emissionFactors, state);
            const totalEmissions = scope1.totalEmissions + scope2.totalEmissions;

            let gei: GEIResult;
            if (data.production) {
                gei = calculateGEI(
                    totalEmissions,
                    data.production.production_volume,
                    data.production.production_unit
                );
            } else {
                gei = { gei: 0, totalEmissions, productionVolume: 0, unit: 'tonnes' };
            }

            results.push({
                date,
                scope1,
                scope2,
                gei,
                totalEmissions
            });

            // Prepare data for saving
            emissionsToSave.push({
                plant_id: plantId,
                calculation_date: date,
                scope_1_emissions: scope1.totalEmissions,
                scope_2_emissions: scope2.totalEmissions,
                total_emissions: totalEmissions,
                production_volume: data.production?.production_volume || 0,
                gei: gei.gei,
                calculation_metadata: {
                    scope1_breakdown: scope1.breakdown,
                    scope2_grid: scope2.gridEmissions,
                    scope2_captive: scope2.captiveEmissions
                }
            });
        }

        // Save to database (upsert to handle recalculations)
        if (emissionsToSave.length > 0) {
            const { error } = await supabase
                .from('emissions_calculated')
                .upsert(emissionsToSave, {
                    onConflict: 'plant_id,calculation_date'
                });

            if (error) {
                console.error('Error saving emissions:', error);
                throw error;
            }
        }

        return results;
    } catch (error) {
        console.error('Error in calculateAndSaveEmissions:', error);
        throw error;
    }
}

// Fetch calculated emissions
export async function fetchCalculatedEmissions(
    plantId: string,
    startDate?: string,
    endDate?: string
) {
    let query = supabase
        .from('emissions_calculated')
        .select('*')
        .eq('plant_id', plantId)
        .order('calculation_date', { ascending: true });

    if (startDate) {
        query = query.gte('calculation_date', startDate);
    }
    if (endDate) {
        query = query.lte('calculation_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching calculated emissions:', error);
        throw error;
    }

    return data || [];
}
