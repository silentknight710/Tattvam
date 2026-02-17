// Plant configuration
export interface Plant {
    id: string;
    name: string;
    location: string;
    plant_type: string;
    production_unit: string;
    state: string;
    created_at: string;
    updated_at: string;
}

// Fuel consumption data
export interface FuelConsumption {
    id?: string;
    plant_id?: string;
    date: string;
    fuel_type: 'coal' | 'natural_gas' | 'diesel' | 'biomass' | 'furnace_oil';
    quantity: number;
    unit: 'tonnes' | 'cubic_meters' | 'liters';
    calorific_value?: number;
    source_document?: string;
    uploaded_at?: string;
    created_at?: string;
}

// Electricity consumption data
export interface ElectricityConsumption {
    id?: string;
    plant_id?: string;
    date: string;
    source: 'grid' | 'captive';
    consumption: number; // kWh
    grid_emission_factor?: number;
    meter_reading?: string;
    uploaded_at?: string;
    created_at?: string;
}

// Emission factors reference
export interface EmissionFactor {
    id: string;
    category: string;
    subcategory: string;
    region?: string;
    factor: number;
    unit: string;
    source: string;
    year: number;
    created_at: string;
}

// Validation error
export interface ValidationError {
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

// Parsed data result
export interface ParsedData<T> {
    data: T[];
    errors: ValidationError[];
    warnings: ValidationError[];
}
