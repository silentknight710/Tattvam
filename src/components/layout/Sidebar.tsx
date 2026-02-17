import { Activity, FileText, Database, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { icon: Activity, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Invoices & Meters', path: '/data-ingestion' },
        { icon: Database, label: 'Emissions Lab', path: '/emissions-lab' },
        { icon: ShieldCheck, label: 'Compliance Filing', path: '/compliance' },
        { icon: TrendingUp, label: 'Liability Forecast', path: '/forecast' },
        { icon: Wallet, label: 'Monetization', path: '/monetization' },
    ];

    return (
        <aside className="w-64 border-r border-[#1E1E1E] flex flex-col bg-[#121212]">
            <div className="p-6 border-b border-[#1E1E1E]">
                <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Tattvik</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
                                ? 'bg-tattvik-green text-white shadow-lg shadow-green-900/20'
                                : 'text-gray-400 hover:bg-[#1E1E1E] hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
