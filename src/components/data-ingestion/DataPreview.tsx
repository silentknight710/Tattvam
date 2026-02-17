import { FuelConsumption, ElectricityConsumption } from '../../lib/types/emissions';

interface DataPreviewProps {
    data: FuelConsumption[] | ElectricityConsumption[];
    dataType: 'fuel' | 'electricity';
}

export function DataPreview({ data, dataType }: DataPreviewProps) {
    if (data.length === 0) {
        return null;
    }

    const displayData = data.slice(0, 10); // Show first 10 rows

    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm rounded-xl border border-[#333] overflow-hidden">
            <div className="p-4 border-b border-[#333]">
                <h3 className="text-sm font-semibold text-white">
                    Data Preview ({data.length} row{data.length > 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                    Showing first {Math.min(10, data.length)} rows
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-[#121212] text-gray-400">
                        <tr>
                            {dataType === 'fuel' ? (
                                <>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Fuel Type</th>
                                    <th className="px-4 py-3 text-right font-semibold">Quantity</th>
                                    <th className="px-4 py-3 text-left font-semibold">Unit</th>
                                    <th className="px-4 py-3 text-right font-semibold">Calorific Value</th>
                                    <th className="px-4 py-3 text-left font-semibold">Source Doc</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Source</th>
                                    <th className="px-4 py-3 text-right font-semibold">Consumption (kWh)</th>
                                    <th className="px-4 py-3 text-left font-semibold">Meter Reading</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {displayData.map((row, index) => (
                            <tr key={index} className="border-t border-[#333] hover:bg-[#1E1E1E]">
                                {dataType === 'fuel' ? (
                                    <>
                                        <td className="px-4 py-3 font-mono text-xs">{(row as FuelConsumption).date}</td>
                                        <td className="px-4 py-3 capitalize">{(row as FuelConsumption).fuel_type}</td>
                                        <td className="px-4 py-3 text-right font-mono">{(row as FuelConsumption).quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3">{(row as FuelConsumption).unit}</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {(row as FuelConsumption).calorific_value?.toFixed(2) || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{(row as FuelConsumption).source_document || '-'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 font-mono text-xs">{(row as ElectricityConsumption).date}</td>
                                        <td className="px-4 py-3 capitalize">{(row as ElectricityConsumption).source}</td>
                                        <td className="px-4 py-3 text-right font-mono">{(row as ElectricityConsumption).consumption.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{(row as ElectricityConsumption).meter_reading || '-'}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length > 10 && (
                <div className="p-3 bg-[#121212] border-t border-[#333] text-center text-xs text-gray-500">
                    + {data.length - 10} more rows
                </div>
            )}
        </div>
    );
}
