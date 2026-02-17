import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File, type: 'fuel' | 'electricity') => void;
    dataType: 'fuel' | 'electricity';
}

export function FileUpload({ onFileSelect, dataType }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            alert('Please upload a CSV or Excel file');
            return;
        }

        onFileSelect(file, dataType);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${isDragging
                    ? 'border-tattvik-green bg-green-900/10'
                    : 'border-[#333] hover:border-[#444] bg-[#1E1E1E]/30'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
            />

            <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-tattvik-green/10 flex items-center justify-center">
                    <Upload size={32} className="text-tattvik-green" />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                        Upload {dataType === 'fuel' ? 'Fuel' : 'Electricity'} Data
                    </h3>
                    <p className="text-sm text-gray-400">
                        Drag and drop your CSV or Excel file here, or click to browse
                    </p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FileText size={14} />
                    <span>Supported formats: CSV, XLSX, XLS</span>
                </div>

                <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg text-left">
                    <div className="flex items-start space-x-2">
                        <AlertCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-300">
                            <p className="font-semibold mb-1">Required columns:</p>
                            {dataType === 'fuel' ? (
                                <p className="text-gray-400">
                                    date, fuel_type, quantity, unit, calorific_value (optional), source_document (optional)
                                </p>
                            ) : (
                                <p className="text-gray-400">
                                    date, source, consumption, meter_reading (optional)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
