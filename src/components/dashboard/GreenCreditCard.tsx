import { Wallet, TrendingUp } from 'lucide-react';

export function GreenCreditCard() {
    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm p-6 rounded-xl border border-[#333] h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Green Credit Monetization</h3>
                <div className="text-tattvik-gold"><Wallet size={16} /></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="text-4xl font-mono font-bold text-white mb-1">1,200</div>
                <div className="text-sm text-gray-400 mb-6">Surplus Credits (CCCs)</div>

                <button className="w-full bg-tattvik-gold hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]">
                    <TrendingUp size={16} className="mr-2" />
                    Sell on ICM Exchange
                </button>

                <div className="mt-4 text-xs text-green-400">
                    Current Rate: ₹1,450/credit (+2.4%)
                </div>
            </div>
        </div>
    );
}
