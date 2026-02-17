import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface EmissionDonutProps {
    emissionsData?: any;
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function EmissionDonut({ emissionsData }: EmissionDonutProps) {
    // Use real data if available, otherwise use placeholder data
    const data = emissionsData?.latest?.calculation_metadata?.scope1_breakdown
        ? [
            ...emissionsData.latest.calculation_metadata.scope1_breakdown.map((fuel: any) => ({
                name: `${fuel.fuelType.charAt(0).toUpperCase() + fuel.fuelType.slice(1)} (Scope 1)`,
                value: fuel.emissions,
                rupees: `₹${(fuel.emissions * 1000 / 10000000).toFixed(1)} Cr`, // Rough cost estimate
                color: getFuelColor(fuel.fuelType)
            })),
            {
                name: 'Grid Power (Scope 2)',
                value: emissionsData.latest.scope_2_emissions || 0,
                rupees: `₹${(emissionsData.latest.scope_2_emissions * 1000 / 10000000).toFixed(1)} Cr`,
                color: '#059669'
            }
        ]
        : [
            { name: 'Coal (Scope 1)', value: 56, rupees: '₹1.2 Cr', color: '#FF3B30' },
            { name: 'Power (Scope 2)', value: 30, rupees: '₹1.1 Cr', color: '#059669' },
            { name: 'Logistics (Scope 3)', value: 14, rupees: '₹0.5 Cr', color: '#FFD700' },
        ];

    const totalCost = data.reduce((sum, item) => {
        const cost = parseFloat(item.rupees.replace('₹', '').replace(' Cr', ''));
        return sum + cost;
    }, 0);

    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex flex-col space-y-2 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-300">{entry.value}</span>
                        </div>
                        <span className="text-gray-400 font-mono">{data[index].rupees}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm rounded-xl border border-[#333] p-6 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-white mb-4">Emission Sources</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1E1E1E',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Legend content={renderLegend} />
                    <text
                        x="50%"
                        y="45%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-white font-mono"
                        fontSize={14}
                    >
                        ₹{totalCost.toFixed(1)} Cr
                    </text>
                    <text
                        x="50%"
                        y="52%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-gray-400"
                        fontSize={10}
                    >
                        Total Cost
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function getFuelColor(fuelType: string): string {
    const colors: Record<string, string> = {
        'coal': '#FF3B30',
        'natural_gas': '#FF9500',
        'diesel': '#FFCC00',
        'biomass': '#34C759',
        'furnace_oil': '#AF52DE'
    };
    return colors[fuelType] || '#8E8E93';
}
