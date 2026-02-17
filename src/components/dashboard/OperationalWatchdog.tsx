import { AlertTriangle, Info } from 'lucide-react';

export function OperationalWatchdog() {
    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm p-6 rounded-xl border border-[#333] h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Operational Watchdog</h3>
                <div className="bg-red-500/10 text-tattvik-red px-2 py-1 rounded text-xs font-medium animate-pulse">Critical Alert</div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="text-tattvik-red shrink-0 mt-0.5" size={18} />
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-tattvik-red">Shift B Intensity Spike detected</h4>
                            <p className="text-xs text-gray-400 mt-1">10:45 AM - Blast Furnace 2 exceeded norm by 12%.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2A2A2A] p-4 rounded-lg border border-[#333]">
                    <div className="flex items-start">
                        <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-200">Insight</h4>
                            <p className="text-xs text-gray-400 mt-1">Vendor 'Global Coal Corp' batch has high Ash Content (45% vs 38%). Correlates with spike.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
