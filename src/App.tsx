import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { DataIngestion } from './pages/DataIngestion';

function App() {
    return (
        <BrowserRouter>
            <div className="flex h-screen bg-[#121212] text-white font-sans overflow-hidden">
                <Sidebar />

                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header />

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/data-ingestion" element={<DataIngestion />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
