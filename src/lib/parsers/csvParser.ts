import Papa from 'papaparse';
import { FuelConsumption, ElectricityConsumption, ParsedData, ValidationError } from '../types/emissions';

export async function parseFuelCSV(file: File): Promise<ParsedData<FuelConsumption>> {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data: FuelConsumption[] = [];
                const errors: ValidationError[] = [];
                const warnings: ValidationError[] = [];

                results.data.forEach((row: any, index: number) => {
                    try {
                        const fuelData: FuelConsumption = {
                            date: row.date?.trim() || '',
                            fuel_type: row.fuel_type?.trim().toLowerCase() || '',
                            quantity: parseFloat(row.quantity) || 0,
                            unit: row.unit?.trim().toLowerCase() || '',
                            calorific_value: row.calorific_value ? parseFloat(row.calorific_value) : undefined,
                            source_document: row.source_document?.trim() || undefined,
                        };

                        // Basic validation
                        if (!fuelData.date) {
                            errors.push({
                                row: index + 2, // +2 because of header and 0-indexing
                                field: 'date',
                                message: 'Date is required',
                                severity: 'error'
                            });
                        }

                        if (!fuelData.fuel_type) {
                            errors.push({
                                row: index + 2,
                                field: 'fuel_type',
                                message: 'Fuel type is required',
                                severity: 'error'
                            });
                        }

                        if (fuelData.quantity <= 0) {
                            errors.push({
                                row: index + 2,
                                field: 'quantity',
                                message: 'Quantity must be greater than 0',
                                severity: 'error'
                            });
                        }

                        data.push(fuelData);
                    } catch (error) {
                        errors.push({
                            row: index + 2,
                            field: 'general',
                            message: `Error parsing row: ${error}`,
                            severity: 'error'
                        });
                    }
                });

                resolve({ data, errors, warnings });
            },
            error: (error) => {
                resolve({
                    data: [],
                    errors: [{
                        row: 0,
                        field: 'file',
                        message: `Error parsing CSV: ${error.message}`,
                        severity: 'error'
                    }],
                    warnings: []
                });
            }
        });
    });
}

export async function parseElectricityCSV(file: File): Promise<ParsedData<ElectricityConsumption>> {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data: ElectricityConsumption[] = [];
                const errors: ValidationError[] = [];
                const warnings: ValidationError[] = [];

                results.data.forEach((row: any, index: number) => {
                    try {
                        const electricityData: ElectricityConsumption = {
                            date: row.date?.trim() || '',
                            source: row.source?.trim().toLowerCase() || '',
                            consumption: parseFloat(row.consumption) || 0,
                            grid_emission_factor: row.grid_emission_factor ? parseFloat(row.grid_emission_factor) : undefined,
                            meter_reading: row.meter_reading?.trim() || undefined,
                        };

                        // Basic validation
                        if (!electricityData.date) {
                            errors.push({
                                row: index + 2,
                                field: 'date',
                                message: 'Date is required',
                                severity: 'error'
                            });
                        }

                        if (!electricityData.source || !['grid', 'captive'].includes(electricityData.source)) {
                            errors.push({
                                row: index + 2,
                                field: 'source',
                                message: 'Source must be "grid" or "captive"',
                                severity: 'error'
                            });
                        }

                        if (electricityData.consumption <= 0) {
                            errors.push({
                                row: index + 2,
                                field: 'consumption',
                                message: 'Consumption must be greater than 0',
                                severity: 'error'
                            });
                        }

                        data.push(electricityData);
                    } catch (error) {
                        errors.push({
                            row: index + 2,
                            field: 'general',
                            message: `Error parsing row: ${error}`,
                            severity: 'error'
                        });
                    }
                });

                resolve({ data, errors, warnings });
            },
            error: (error) => {
                resolve({
                    data: [],
                    errors: [{
                        row: 0,
                        field: 'file',
                        message: `Error parsing CSV: ${error.message}`,
                        severity: 'error'
                    }],
                    warnings: []
                });
            }
        });
    });
}
