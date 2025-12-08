
import React from 'react';
import { ExtractedData, ProcessingStatus, ExtractionConfig } from '../types';
import { CheckCircle, AlertCircle, AlertTriangle, Download, Copy, Activity, MapPin, User, Calendar, Stethoscope, FileSpreadsheet, Box } from 'lucide-react';

interface ResultsAreaProps {
  data: ExtractedData | null;
  status: ProcessingStatus;
  config: ExtractionConfig;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ data, status, config }) => {
  if (status === ProcessingStatus.IDLE) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
        <Activity className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-black">Ready to Abstract</h3>
        <p className="text-sm max-w-xs mt-2 text-black">
          {config.isCustom 
            ? "Configure your schema and paste a clinical note to abstract custom fields." 
            : "Paste a clinical note on the left and click 'Analyze' to abstract structured research data."}
        </p>
      </div>
    );
  }

  if (status === ProcessingStatus.ERROR) {
     return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-semibold text-black">Abstraction Failed</h3>
        <p className="text-sm mt-2 text-black">There was an error processing the clinical note. Please try again.</p>
      </div>
    );
  }

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abstraction-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!data) return;

    const headers = Object.keys(data);
    const row = headers.map(key => {
      const val = data[key];
      if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join('; ');
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return val;
    });

    const csvData = [headers, row];
    const csvContent = csvData.map(r => 
      r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clinical_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFieldMissing = (key: string) => {
    const missing = data.missingInformation;
    if (Array.isArray(missing)) {
      return missing.some((m: string) => m.toLowerCase() === key.toLowerCase());
    }
    return false;
  };

  // --- Specialized Renderers ---

  const renderDefaultInjuryLayout = () => (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
         {isFieldMissing('briefSummary') && (
           <div className="absolute top-0 right-0 p-2">
             <AlertCircle className="w-4 h-4 text-amber-500" />
           </div>
         )}
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brief Summary</h4>
        <p className="text-sm text-black leading-relaxed">{data.briefSummary}</p>
      </div>

      {/* Patient & Incident Header */}
      <div className="grid grid-cols-2 gap-4">
        <SectionBlock icon={<Calendar className="w-4 h-4" />} title="Visit Info">
           <Field label="Date" value={data.visitDate} isMissing={isFieldMissing('visitDate')} />
           <Field label="Time" value={data.visitTime} isMissing={isFieldMissing('visitTime')} />
           <Field label="Disposition" value={data.disposition} isMissing={isFieldMissing('disposition')} />
        </SectionBlock>

        <SectionBlock icon={<User className="w-4 h-4" />} title="Patient">
          <Field label="Age" value={data.patientAge} isMissing={isFieldMissing('patientAge')} />
          <Field label="Gender" value={data.patientGender} isMissing={isFieldMissing('patientGender')} />
        </SectionBlock>
      </div>

      {/* Injury Details */}
      <SectionBlock icon={<MapPin className="w-4 h-4" />} title="Incident Characteristics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Location" value={data.incidentLocation} isMissing={isFieldMissing('incidentLocation')} />
          <Field label="Mechanism" value={data.injuryMechanism} isMissing={isFieldMissing('injuryMechanism')} />
          <Field label="Intent" value={data.intent} highlight isMissing={isFieldMissing('intent')} />
        </div>
      </SectionBlock>

      {/* Diagnoses */}
      <div className="border border-gray-200 rounded-lg overflow-hidden relative">
        <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-black">Diagnoses</h3>
          </div>
          {isFieldMissing('diagnoses') && (
            <span title="Diagnoses info missing or incomplete">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-100 bg-white">
          {Array.isArray(data.diagnoses) && data.diagnoses.map((diag: string, idx: number) => (
            <div key={idx} className="p-3 hover:bg-gray-50 transition-colors flex items-start gap-3">
               <span className="text-sm text-black font-medium">{diag}</span>
            </div>
          ))}
          {(!data.diagnoses || data.diagnoses.length === 0) && (
            <div className="p-4 text-sm text-gray-400 italic">No specific diagnoses extracted.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGenericLayout = () => {
    // Separate fields into simple scalars and complex types (arrays/objects)
    const simpleFields: string[] = [];
    const complexFields: string[] = [];

    Object.keys(data).forEach(key => {
      if (key === 'missingInformation') return;
      const value = data[key];
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        complexFields.push(key);
      } else {
        simpleFields.push(key);
      }
    });

    return (
      <div className="space-y-6">
        {/* Render simple fields in a compact grid */}
        {simpleFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {simpleFields.map(key => {
               const value = data[key];
               const isMissing = isFieldMissing(key);
               return (
                 <div key={key} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide capitalize truncate pr-2">
                        {key.replace(/_/g, ' ')}
                      </span>
                      {isMissing && <span title="Missing Info"><AlertCircle className="w-3 h-3 text-amber-500 shrink-0" /></span>}
                   </div>
                   <div className="text-sm font-medium text-black break-words">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'N/A')}
                   </div>
                 </div>
               );
            })}
          </div>
        )}

        {/* Render complex fields (lists) as full-width blocks */}
        {complexFields.length > 0 && (
          <div className="space-y-4">
             {complexFields.map(key => {
               const value = data[key];
               const isMissing = isFieldMissing(key);
               return (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                       <h3 className="text-sm font-semibold text-black capitalize">{key.replace(/_/g, ' ')}</h3>
                       {isMissing && <span title="Missing Info"><AlertCircle className="w-4 h-4 text-amber-500" /></span>}
                    </div>
                    <div className="p-0">
                      {Array.isArray(value) && value.length === 0 ? (
                        <div className="p-4 text-sm text-gray-400 italic">None</div>
                      ) : Array.isArray(value) ? (
                        <ul className="divide-y divide-gray-100">
                          {value.map((item: any, idx: number) => (
                             <li key={idx} className="p-3 hover:bg-gray-50 transition-colors text-sm text-black break-words">
                                {typeof item === 'object' ? JSON.stringify(item) : item}
                             </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-sm text-black break-words">
                          {JSON.stringify(value, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
               );
             })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
        <h2 className="font-semibold text-black flex items-center gap-2">
          {config.isCustom ? <Box className="w-4 h-4 text-purple-600" /> : <Stethoscope className="w-4 h-4 text-emerald-600" />}
          {config.isCustom ? 'Custom Abstraction' : 'Structured Output'}
        </h2>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors" title="Export CSV">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button onClick={handleCopy} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors" title="Copy JSON">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors" title="Download JSON">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white min-h-0">
        
        {/* Missing Info Warning Block - Generic */}
        {data.missingInformation && data.missingInformation.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-lg p-3 flex gap-3 items-start shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-black">Missing Information Detected</h4>
              <p className="text-xs text-gray-600 mt-1">
                The following fields could not be confidently extracted: {data.missingInformation.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Rendering Switch */}
        {!config.isCustom 
           ? renderDefaultInjuryLayout()
           : renderGenericLayout()
        }

      </div>
    </div>
  );
};

const SectionBlock: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
    <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center gap-2">
      <div className="text-gray-500">{icon}</div>
      <h3 className="text-sm font-semibold text-black">{title}</h3>
    </div>
    <div className="p-4 space-y-3 bg-white">
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string, value: string, highlight?: boolean, isMissing?: boolean }> = ({ label, value, highlight, isMissing }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1.5 truncate">
      {label}
      {isMissing && (
        <span title={`The field '${label}' was marked as missing in the source text.`}>
          <AlertCircle className="w-3 h-3 text-amber-500" />
        </span>
      )}
    </dt>
    <dd className={`text-sm font-medium break-words ${highlight ? 'text-black font-bold' : 'text-black'}`}>{value}</dd>
  </div>
);

export default ResultsArea;
