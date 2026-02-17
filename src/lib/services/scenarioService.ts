import { EmissionsCalculationResult } from './emissionsService';

export interface ProjectionPoint {
    month: string;
    actual: number | null;
    projected: number | null;
    cap: number;
    annotation?: string;
    isProjected: boolean;
}

export interface ScenarioResult {
    bau: ProjectionPoint[];
    scenario: ProjectionPoint[];
}

/**
 * Calculates future emission projections based on historical data.
 * 
 * @param history The historical emissions data rows.
 * @param monthsToProject Number of future months to project (default: 6).
 */
export function calculateProjections(
    history: EmissionsCalculationResult[],
    monthsToProject: number = 6
): ScenarioResult {
    // 1. Process Historical Data
    // Group by month and calculate average GEI per month
    // Note: This assumes history is already sorted by date

    if (!history || history.length === 0) {
        return { bau: [], scenario: [] };
    }

    const processedHistory: ProjectionPoint[] = [];
    const monthlyData: Record<string, { totalGEI: number, count: number, date: Date }> = {};

    history.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { totalGEI: 0, count: 0, date };
        }

        monthlyData[monthKey].totalGEI += item.gei.gei;
        monthlyData[monthKey].count += 1;
    });

    // Convert monthly averages to points
    Object.values(monthlyData).forEach(m => {
        processedHistory.push({
            month: m.date.toLocaleDateString('en-US', { month: 'short' }),
            actual: m.totalGEI / m.count,
            projected: null,
            cap: 1.98,
            isProjected: false
        });
    });

    // 2. Calculate Baseline (Average of last 3 available months)
    // If less than 3 months, use what we have.
    const last3Months = processedHistory.slice(-3);
    const avgGEI = last3Months.reduce((sum, p) => sum + (p.actual || 0), 0) / last3Months.length;

    // 3. Generate Future Points
    const lastDate = history[history.length - 1].date ? new Date(history[history.length - 1].date) : new Date();

    // BAU: Follows the average trend
    const bauProjections: ProjectionPoint[] = [];

    // Scenario: Simulates a 5-8% increase due to factor X (e.g. low quality coal)
    const scenarioProjections: ProjectionPoint[] = [];

    // Base Modifiers for Scenario (ramp up then stabilize)
    const scenarioModifiers = [1.02, 1.05, 1.08, 1.07, 1.06, 1.06];

    for (let i = 1; i <= monthsToProject; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + i);
        const monthLabel = nextDate.toLocaleDateString('en-US', { month: 'short' });

        // BAU
        bauProjections.push({
            month: monthLabel,
            actual: null,
            projected: avgGEI,
            cap: 1.98,
            isProjected: true
        });

        // High Risk Scenario
        const modifier = i <= scenarioModifiers.length ? scenarioModifiers[i - 1] : 1.05;
        scenarioProjections.push({
            month: monthLabel,
            actual: null,
            projected: avgGEI * modifier,
            cap: 1.98,
            isProjected: true,
            annotation: i === 3 ? 'Shift: Low Quality Coal' : undefined
        });
    }

    // Combine History + Projections
    // For smooth charting, the first projected point should start where actual ends?
    // In Recharts, we can just append the array. 

    // Return full datasets
    return {
        bau: [...processedHistory, ...bauProjections],
        scenario: [...processedHistory, ...scenarioProjections]
    };
}
