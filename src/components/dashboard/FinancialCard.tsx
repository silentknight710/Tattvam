import { ArrowUp, ArrowDown, CheckCircle, Shield, ExternalLink } from 'lucide-react';

interface FinancialCardProps {
    title: string;
    value: string;
    subtext: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    isLiability?: boolean;
    isVerified?: boolean;
    trendIndicator?: string;
    isClickable?: boolean;
    onLinkClick?: () => void;
    shieldIcon?: boolean;
    shieldTooltip?: string;
}

export function FinancialCard({
    title,
    value,
    subtext,
    trend,
    isLiability,
    isVerified,
    trendIndicator,
    isClickable,
    onLinkClick,
    shieldIcon,
    shieldTooltip
}: FinancialCardProps) {
    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm p-5 rounded-xl border border-[#333] hover:border-[#444] transition group relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{title}</h3>
                <div className="flex items-center space-x-2">
                    {isVerified && (
                        <div className="bg-green-900/30 text-green-400 p-1 rounded-full" title="Verified Source">
                            <CheckCircle size={14} />
                        </div>
                    )}
                    {shieldIcon && (
                        <div
                            className="bg-green-900/30 text-green-400 p-1 rounded-full cursor-help"
                            title={shieldTooltip || "Validated"}
                        >
                            <Shield size={14} />
                        </div>
                    )}
                </div>
            </div>

            <div className={`text-3xl font-mono font-bold mb-1 ${isLiability ? 'text-tattvik-red' : 'text-white'}`}>
                {value}
            </div>

            {trendIndicator && (
                <div className="text-xs text-tattvik-red font-medium mb-1 font-mono">
                    {trendIndicator}
                </div>
            )}

            <div className="flex items-center space-x-2 text-xs text-gray-400">
                {trend && (
                    <span className={`flex items-center ${trend === 'up' ? 'text-tattvik-red' : 'text-tattvik-green'}`}>
                        {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </span>
                )}
                <span className={isClickable ? 'flex items-center' : ''}>
                    {subtext}
                    {isClickable && (
                        <button
                            onClick={onLinkClick}
                            className="ml-1.5 text-tattvik-green hover:text-green-400 transition inline-flex items-center"
                            title="View Source Document"
                        >
                            <ExternalLink size={12} />
                        </button>
                    )}
                </span>
            </div>

            {/* Decorative gradient blob */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition"></div>
        </div>
    );
}
