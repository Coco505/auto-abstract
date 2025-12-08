
import React, { useState } from 'react';
import InputArea from './components/InputArea';
import ResultsArea from './components/ResultsArea';
import { ExtractedData, ProcessingStatus, ExtractionConfig } from './types';
import { extractClinicalData } from './services/API';
import { ClipboardList, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  
  // State for Extraction Schema
  const [extractionConfig, setExtractionConfig] = useState<ExtractionConfig>({
    id: 'default',
    name: 'Injury Surveillance',
    isCustom: false,
    fields: []
  });

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setStatus(ProcessingStatus.PROCESSING);
    setExtractedData(null);

    try {
      // Pass the custom fields if isCustom is true, otherwise pass undefined to use default
      const customFields = extractionConfig.isCustom ? extractionConfig.fields : undefined;
      const result = await extractClinicalData(inputText, customFields);
      setExtractedData(result);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleClear = () => {
    setInputText("");
    setExtractedData(null);
    setStatus(ProcessingStatus.IDLE);
  }

  return (
    <div className="h-screen flex flex-col bg-white text-black font-sans selection:bg-gray-100 selection:text-black overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
               <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black tracking-tight leading-none">AutoAbstract</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Automatic Clinical Data Abstractor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* Left Column: Input */}
            <div className="h-full min-h-0">
              <InputArea 
                value={inputText}
                onChange={setInputText}
                onAnalyze={handleAnalyze}
                status={status}
                onClear={handleClear}
                extractionConfig={extractionConfig}
                onUpdateConfig={setExtractionConfig}
              />
            </div>

            {/* Right Column: Results */}
            <div className="h-full min-h-0">
              <ResultsArea 
                data={extractedData}
                status={status}
                config={extractionConfig}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs">
           <div className="text-gray-500">
             Created by <span className="font-semibold text-gray-700">Zhang Ke (Coco) Jiang</span>
           </div>
           <a 
             href="mailto:cocojiang505@gmail.com"
             className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors font-medium"
           >
             <Mail className="w-3.5 h-3.5" />
             Contact / Feedback
           </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
