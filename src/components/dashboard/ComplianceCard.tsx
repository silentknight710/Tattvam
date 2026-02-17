import { FileText, CheckCircle, Clock, Upload } from 'lucide-react';

export function ComplianceCard() {
    return (
        <div className="bg-[#1E1E1E]/50 backdrop-blur-sm p-6 rounded-xl border border-[#333] h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">CCTS Compliance Hub</h3>
                <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-medium">Pending Action</div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                    <div className="text-lg font-medium text-white mb-2">Form A Ready for Filing</div>
                    <p className="text-sm text-gray-400">Submission deadline: 14th Feb</p>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-300"><FileText size={14} className="mr-2 text-gray-500" /> Form E2</span>
                        <span className="flex items-center text-tattvik-green"><CheckCircle size={14} className="mr-1" /> Done</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-300"><FileText size={14} className="mr-2 text-gray-500" /> CBAM Article 6</span>
                        <span className="flex items-center text-yellow-500"><Clock size={14} className="mr-1" /> Pending</span>
                    </div>
                </div>

                <button className="w-full bg-tattvik-green hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center">
                    <Upload size={16} className="mr-2" />
                    Auto-File with BEE
                </button>
            </div>
        </div>
    );
}
