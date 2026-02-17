import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useState, useMemo } from 'react';
import { calculateProjections } from '../../lib/services/scenarioService';

interface LiabilityChartProps {
    emissionsData?: any[];
}

export function LiabilityChart({ emissionsData }: LiabilityChartProps) {
    const [viewMode, setViewMode] = useState<'normal' | 'scenario'>('normal');

    const chartData = useMemo(() => {
        if (!emissionsData || emissionsData.length === 0) return [];

        const { bau, scenario } = calculateProjections(emissionsData);
        return viewMode === 'normal' ? bau : scenario;
    }, [emissionsData, viewMode]);

    const CustomizedDot = (props: any) => {
        const { cx, cy, payload } = props;

        if (payload.annotation) {
            return (
                <g>
                    <circle cx={cx} cy={cy} r={6} fill="#FF3B30" stroke="#fff" strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={8} fill="none" stroke="#FF3B30" strokeWidth={1} opacity={0.5} />
                    <text x={cx} y={cy - 15} textAnchor="middle" fill="#FF3B30" fontSize={10} fontWeight="bold">
                        {payload.annotation}
                    </text>
                </g>
            );
        }

        if (payload.isProjected) {
            return <circle cx={cx} cy={cy} r={3} fill="#999" stroke="none" />;
        }

        return <circle cx={cx} cy={cy} r={4} fill="#FF3B30" />;
    };

    if (!emissionsData || emissionsData.length === 0) {
        return (
            <div className="bg-[#1E1E1E]/50 backdrop-blur-sm p-6 rounded-xl border border-[#333] h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm">Waiting for emission data to generate projections...</p>
            </div>
        )
    }

    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm p-6 rounded-xl border border-[#333] h-full flex flex-col relative">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Liability Forecast & Burn Rate</h3>
                    <p className="text-xs text-tattvik-red mt-1">
                        {viewMode === 'normal' ? 'Projected: Stable (BAU)' : 'Projected Breach: High Risk Scenario'}
                    </p>
                </div>

                {/* Toggle Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode('normal')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'normal'
                            ? 'bg-tattvik-green text-black font-semibold'
                            : 'bg-[#2A2A2A] text-gray-400 hover:bg-[#333]'
                            }`}
                    >
                        BAU Projection
                    </button>
                    <button
                        onClick={() => setViewMode('scenario')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'scenario'
                            ? 'bg-tattvik-red text-white font-semibold'
                            : 'bg-[#2A2A2A] text-gray-400 hover:bg-[#333]'
                            }`}
                    >
                        Simulate Risk
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="month"
                        stroke="#666"
                        tick={{ fill: '#999', fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fill: '#999', fontSize: 12 }}
                        domain={[1.5, 2.5]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1E1E1E',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === 'actual') return [value ? value.toFixed(2) : 'N/A', 'Actual GEI'];
                            if (name === 'projected') return [value ? value.toFixed(2) : 'N/A', 'Projected GEI'];
                            if (name === 'cap') return [value.toFixed(2), 'Target'];
                            return [value, name];
                        }}
                        labelStyle={{ color: '#ccc' }}
                    />

                    {/* Reference line for cap */}
                    <ReferenceLine
                        y={1.98}
                        stroke="#FFD700"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                    >
                        <Label value="Govt Cap: 1.98" position="insideTopRight" fill="#FFD700" fontSize={11} offset={10} />
                    </ReferenceLine>

                    {/* Actual line */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#FF3B30"
                        strokeWidth={3}
                        dot={<CustomizedDot />}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                    />

                    {/* Projected line */}
                    <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#666"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={<CustomizedDot />}
                        activeDot={{ r: 5 }}
                        connectNulls={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
