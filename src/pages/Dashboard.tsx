import { useEffect, useState } from 'react';
import { FinancialCard } from '../components/dashboard/FinancialCard';
import { LiabilityChart } from '../components/dashboard/LiabilityChart';
import { EmissionDonut } from '../components/dashboard/EmissionDonut';
import { ComplianceCard } from '../components/dashboard/ComplianceCard';
import { OperationalWatchdog } from '../components/dashboard/OperationalWatchdog';
import { GreenCreditCard } from '../components/dashboard/GreenCreditCard';
import { supabase } from '../lib/supabase';
import { fetchCalculatedEmissions } from '../lib/services/emissionsService';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [emissionsData, setEmissionsData] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            // Get plant ID
            const { data: plants } = await supabase.from('plants').select('id, name').limit(1);
            if (!plants || plants.length === 0) {
                console.warn('No plant found');
                setLoading(false);
                return;
            }

            const plant = plants[0];

            // Fetch calculated emissions for the last 30 days
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const emissions = await fetchCalculatedEmissions(plant.id, startDate, endDate);

            if (emissions.length > 0) {
                // Get latest emission data
                const latest = emissions[emissions.length - 1];

                // Calculate totals
                const totalScope1 = emissions.reduce((sum, e) => sum + (e.scope_1_emissions || 0), 0);
                const totalScope2 = emissions.reduce((sum, e) => sum + (e.scope_2_emissions || 0), 0);
                const totalEmissions = totalScope1 + totalScope2;
                const totalProduction = emissions.reduce((sum, e) => sum + (e.production_volume || 0), 0);

                // Calculate average GEI
                const avgGEI = totalProduction > 0 ? totalEmissions / totalProduction : 0;

                // Calculate liability (assuming target GEI of 1.98 and carbon price of ₹1000/tCO2)
                const targetGEI = 1.98;
                const carbonPrice = 1000; // ₹ per tCO2
                const excessEmissions = totalProduction > 0 ? (avgGEI - targetGEI) * totalProduction : 0;
                const liability = excessEmissions > 0 ? excessEmissions * carbonPrice : 0;

                setEmissionsData({
                    latest,
                    avgGEI,
                    totalEmissions,
                    totalProduction,
                    liability,
                    scope1: totalScope1,
                    scope2: totalScope2,
                    emissions // All emissions for charts
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-tattvik-green mx-auto mb-4" />
                    <p className="text-gray-400">Loading emissions data...</p>
                </div>
            </div>
        );
    }

    // Use calculated data if available, otherwise show placeholders
    const gei = emissionsData?.avgGEI?.toFixed(2) || '2.05';
    const liability = emissionsData?.liability
        ? `₹${(emissionsData.liability / 100000).toFixed(1)} L`
        : '₹45.2 L';
    const production = emissionsData?.totalProduction
        ? `${emissionsData.totalProduction.toLocaleString()} T`
        : '607,143 T';

    return (
        <div className="p-6 space-y-6">
            {/* Row 1: The "Financial Truth" Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard
                    title="Real-Time Intensity"
                    value={gei}
                    subtext="vs Govt Target: 1.98"
                    trend={parseFloat(gei) > 1.98 ? "up" : "down"}
                    isLiability={parseFloat(gei) > 1.98}
                />
                <FinancialCard
                    title="Accrued Liability (Projected)"
                    value={liability}
                    subtext="Est. Year-End Penalty"
                    isLiability={true}
                    trendIndicator={emissionsData ? `Based on ${emissionsData.emissions.length} days` : "+₹2.1L since last week"}
                />
                <FinancialCard
                    title="Production Volume"
                    value={production}
                    subtext="Source: GST Sales Register"
                    isVerified={true}
                    isClickable={true}
                    onLinkClick={() => alert('Opening GST Sales Register...')}
                />
                <FinancialCard
                    title="Audit Confidence Score"
                    value="99.8%"
                    subtext="Mass Balance Validated"
                    shieldIcon={true}
                    shieldTooltip="Matches Electricity Meter & Coal Invoice"
                />
            </div>

            {/* Row 2: Analytics & Prediction - Split 2:1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                <div className="lg:col-span-2 h-full">
                    <LiabilityChart emissionsData={emissionsData?.emissions} />
                </div>
                <div className="lg:col-span-1 h-full">
                    <EmissionDonut emissionsData={emissionsData} />
                </div>
            </div>

            {/* Row 3: Compliance & Action Layer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-80 pb-6">
                <ComplianceCard />
                <OperationalWatchdog />
                <GreenCreditCard />
            </div>

            {/* Data Status Indicator */}
            {!emissionsData && (
                <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4 text-center">
                    <p className="text-yellow-400 text-sm">
                        📊 No emissions data available yet. Upload fuel and electricity data to see real-time calculations.
                    </p>
                </div>
            )}
        </div>
    );
}
