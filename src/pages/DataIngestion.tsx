import { useState } from 'react';
import { FileUpload } from '../components/data-ingestion/FileUpload';
import { DataPreview } from '../components/data-ingestion/DataPreview';
import { ValidationErrors } from '../components/data-ingestion/ValidationErrors';
import { parseFuelCSV, parseElectricityCSV } from '../lib/parsers/csvParser';
import { FuelConsumption, ElectricityConsumption, ParsedData } from '../lib/types/emissions';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, Database } from 'lucide-react';

export function DataIngestion() {
    const [dataType, setDataType] = useState<'fuel' | 'electricity'>('fuel');
    const [parsedData, setParsedData] = useState<ParsedData<FuelConsumption | ElectricityConsumption> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleFileSelect = async (file: File, type: 'fuel' | 'electricity') => {
        setIsProcessing(true);
        setSaveSuccess(false);

        try {
            let result: ParsedData<FuelConsumption | ElectricityConsumption>;

            if (type === 'fuel') {
                result = await parseFuelCSV(file);
            } else {
                result = await parseElectricityCSV(file);
            }

            setParsedData(result);
        } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error parsing file. Please check the format and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveData = async () => {
        if (!parsedData || parsedData.errors.length > 0) {
            alert('Please fix all errors before saving');
            return;
        }

        setIsSaving(true);

        try {
            // Get the first plant ID (in production, user would select this)
            const { data: plants } = await supabase.from('plants').select('id').limit(1);

            if (!plants || plants.length === 0) {
                alert('No plant found. Please configure a plant first.');
                setIsSaving(false);
                return;
            }

            const plantId = plants[0].id;

            // Add plant_id to each row
            const dataWithPlantId = parsedData.data.map(row => ({
                ...row,
                plant_id: plantId
            }));

            // Save to appropriate table
            const tableName = dataType === 'fuel' ? 'fuel_consumption' : 'electricity_consumption';
            const { error } = await supabase.from(tableName).insert(dataWithPlantId);

            if (error) {
                console.error('Error saving data:', error);
                alert(`Error saving data: ${error.message}`);
                setIsSaving(false);
                return;
            }

            // Trigger emissions calculation for the uploaded dates
            try {
                const dates = parsedData.data.map(d => (d as any).date);
                const minDate = dates.reduce((min, d) => d < min ? d : min, dates[0]);
                const maxDate = dates.reduce((max, d) => d > max ? d : max, dates[0]);

                console.log('🔄 Starting emissions calculation...');
                console.log('📅 Date range:', minDate, 'to', maxDate);
                console.log('🏭 Plant ID:', plantId);

                // Import calculation service dynamically
                const { calculateAndSaveEmissions } = await import('../lib/services/emissionsService');
                const results = await calculateAndSaveEmissions(plantId, minDate, maxDate);

                console.log('✅ Emissions calculated successfully!');
                console.log('📊 Results:', results.length, 'days calculated');
                console.log('💾 Data saved to emissions_calculated table');
            } catch (calcError) {
                console.error('❌ Error calculating emissions:', calcError);
                console.error('Stack trace:', (calcError as Error).stack);
                // Don't fail the whole operation if calculation fails
            }

            setSaveSuccess(true);
            setTimeout(() => {
                setParsedData(null);
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setParsedData(null);
        setSaveSuccess(false);
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Data Ingestion</h1>
                    <p className="text-gray-400">Upload fuel consumption and electricity data for emissions calculation</p>
                </div>

                {/* Data Type Selector */}
                <div className="flex items-center space-x-4 bg-[#1E1E1E] p-1 rounded-lg w-fit">
                    <button
                        onClick={() => {
                            setDataType('fuel');
                            handleReset();
                        }}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition ${dataType === 'fuel'
                            ? 'bg-tattvik-green text-white shadow-lg shadow-green-900/20'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Database size={16} className="inline mr-2" />
                        Fuel Data
                    </button>
                    <button
                        onClick={() => {
                            setDataType('electricity');
                            handleReset();
                        }}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition ${dataType === 'electricity'
                            ? 'bg-tattvik-green text-white shadow-lg shadow-green-900/20'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Database size={16} className="inline mr-2" />
                        Electricity Data
                    </button>
                </div>

                {/* File Upload */}
                {!parsedData && !isProcessing && (
                    <FileUpload onFileSelect={handleFileSelect} dataType={dataType} />
                )}

                {/* Processing State */}
                {isProcessing && (
                    <div className="bg-[#1E1E1E]/50 backdrop-blur-sm rounded-xl border border-[#333] p-12 text-center">
                        <Loader2 size={48} className="animate-spin text-tattvik-green mx-auto mb-4" />
                        <p className="text-gray-400">Processing file...</p>
                    </div>
                )}

                {/* Parsed Data */}
                {parsedData && !isProcessing && (
                    <div className="space-y-6">
                        {/* Validation Results */}
                        <ValidationErrors errors={parsedData.errors} warnings={parsedData.warnings} />

                        {/* Data Preview */}
                        <DataPreview
                            data={dataType === 'fuel' ? parsedData.data as FuelConsumption[] : parsedData.data as ElectricityConsumption[]}
                            dataType={dataType}
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-4">
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-gray-300 rounded-lg transition"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveData}
                                disabled={parsedData.errors.length > 0 || isSaving}
                                className={`px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${parsedData.errors.length > 0 || isSaving
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-tattvik-green hover:bg-green-700 text-white'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Database size={16} />
                                        <span>Save to Database</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {saveSuccess && (
                    <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-6 text-center">
                        <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Data Saved Successfully!</h3>
                        <p className="text-gray-400">
                            {parsedData?.data.length} rows of {dataType} data have been saved to the database.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
