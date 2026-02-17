import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { ValidationError } from '../../lib/types/emissions';

interface ValidationErrorsProps {
    errors: ValidationError[];
    warnings: ValidationError[];
}

export function ValidationErrors({ errors, warnings }: ValidationErrorsProps) {
    if (errors.length === 0 && warnings.length === 0) {
        return (
            <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle size={20} />
                    <span className="font-semibold">All data validated successfully!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-400 mb-3">
                        <XCircle size={20} />
                        <span className="font-semibold">{errors.length} Error{errors.length > 1 ? 's' : ''} Found</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {errors.slice(0, 10).map((error, index) => (
                            <div key={index} className="text-sm text-gray-300 bg-[#1E1E1E] p-2 rounded">
                                <span className="text-red-400 font-mono">Row {error.row}</span>
                                <span className="text-gray-500 mx-2">•</span>
                                <span className="text-gray-400">{error.field}:</span>
                                <span className="ml-1">{error.message}</span>
                            </div>
                        ))}
                        {errors.length > 10 && (
                            <p className="text-xs text-gray-500 italic">
                                ...and {errors.length - 10} more errors
                            </p>
                        )}
                    </div>
                </div>
            )}

            {warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-400 mb-3">
                        <AlertTriangle size={20} />
                        <span className="font-semibold">{warnings.length} Warning{warnings.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {warnings.slice(0, 5).map((warning, index) => (
                            <div key={index} className="text-sm text-gray-300 bg-[#1E1E1E] p-2 rounded">
                                <span className="text-yellow-400 font-mono">Row {warning.row}</span>
                                <span className="text-gray-500 mx-2">•</span>
                                <span className="text-gray-400">{warning.field}:</span>
                                <span className="ml-1">{warning.message}</span>
                            </div>
                        ))}
                        {warnings.length > 5 && (
                            <p className="text-xs text-gray-500 italic">
                                ...and {warnings.length - 5} more warnings
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
