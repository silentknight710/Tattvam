import { Bell, User, DollarSign, Zap } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const [viewMode, setViewMode] = useState<'financial' | 'engineering'>('financial');

    return (
        <header className="h-16 border-b border-[#1E1E1E] flex items-center justify-between px-6 bg-[#121212]">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-[#1E1E1E] px-3 py-1.5 rounded-lg border border-[#333]">
                    <span className="text-sm font-medium text-gray-300">Visakhapatnam Steel Plant - Unit 2</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {/* God Mode Toggle */}
                <div className="flex items-center space-x-2 bg-[#1E1E1E] border border-[#333] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('financial')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${viewMode === 'financial'
                                ? 'bg-tattvik-green text-white shadow-lg shadow-green-900/20'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <DollarSign size={14} />
                        <span>Financial View</span>
                    </button>
                    <button
                        onClick={() => setViewMode('engineering')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${viewMode === 'engineering'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Zap size={14} />
                        <span>Engineering View</span>
                    </button>
                </div>

                <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full border border-green-900/50">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Live Utility Sync Status: Connected (APEPDCL Smart Meter)</span>
                </div>

                <div className="h-6 w-px bg-[#333]"></div>

                <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white transition relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-tattvik-red rounded-full"></span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-400 hover:text-white cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-[#1E1E1E] flex items-center justify-center border border-[#333]">
                            <User size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
