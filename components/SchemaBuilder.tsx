
import React, { useState } from 'react';
import { SchemaField, FieldType, ExtractionConfig } from '../types';
import { Plus, Trash2, Settings, RefreshCw, Save } from 'lucide-react';

interface SchemaBuilderProps {
  config: ExtractionConfig;
  onUpdateConfig: (newConfig: ExtractionConfig) => void;
  onReset: () => void;
}

const PRESETS: Record<string, SchemaField[]> = {
  'er_injury_surveillance': [
    { id: '1', key: 'visit_date', type: 'string', description: 'Date of the hospital visit (YYYY-MM-DD)' },
    { id: '2', key: 'visit_time', type: 'string', description: 'Time of arrival/visit' },
    { id: '3', key: 'patient_age', type: 'string', description: 'Age of the patient' },
    { id: '4', key: 'patient_gender', type: 'string', description: 'Gender of the patient' },
    { id: '5', key: 'incident_location', type: 'string', description: 'Where the injury/incident occurred' },
    { id: '6', key: 'injury_mechanism', type: 'string', description: 'How the injury happened (e.g. Fall, MVA)' },
    { id: '7', key: 'intent', type: 'string', description: 'Intent of injury (Unintentional, Self-harm, Assault)' },
    { id: '8', key: 'diagnoses', type: 'array', description: 'List of clinical diagnoses found in the text' },
    { id: '9', key: 'disposition', type: 'string', description: 'Discharge status' },
    { id: '10', key: 'brief_summary', type: 'string', description: 'Concise 2-sentence summary of the clinical narrative' }
  ],
  'medication_reconciliation': [
    { id: '1', key: 'medications_list', type: 'array', description: 'List of all current medications including dosage' },
    { id: '2', key: 'allergies', type: 'array', description: 'List of patient allergies' },
    { id: '3', key: 'pharmacy_info', type: 'string', description: 'Patient preferred pharmacy details' },
    { id: '4', key: 'compliance_issues', type: 'string', description: 'Any notes regarding medication non-compliance' },
    { id: '5', key: 'changes_made', type: 'array', description: 'List of medications changed or added during this visit' }
  ],
  'billing_coding': [
    { id: '1', key: 'primary_diagnosis', type: 'string', description: 'Primary diagnosis for billing' },
    { id: '2', key: 'cpt_codes', type: 'array', description: 'Potential CPT codes supported by the documentation' },
    { id: '3', key: 'mdm_level', type: 'string', description: 'Medical Decision Making level (Straightforward, Low, Moderate, High)' },
    { id: '4', key: 'procedures_performed', type: 'array', description: 'List of procedures performed during visit' },
    { id: '5', key: 'critical_care_time', type: 'string', description: 'Total critical care time documented, if any' }
  ],
  'discharge_summary': [
    { id: '1', key: 'admission_diagnosis', type: 'string', description: 'Diagnosis at time of admission' },
    { id: '2', key: 'discharge_diagnosis', type: 'string', description: 'Final diagnosis at time of discharge' },
    { id: '3', key: 'hospital_course', type: 'string', description: 'Brief narrative of the hospital stay' },
    { id: '4', key: 'discharge_medications', type: 'array', description: 'List of medications prescribed at discharge' },
    { id: '5', key: 'follow_up_instructions', type: 'string', description: 'Instructions for follow-up appointments and care' }
  ]
};

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ config, onUpdateConfig, onReset }) => {
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldDesc, setNewFieldDesc] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('string');

  const handleAddField = () => {
    if (!newFieldKey.trim() || !newFieldDesc.trim()) return;

    // Convert label to snake_case key if user typed normal text
    const key = newFieldKey.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const newField: SchemaField = {
      id: Date.now().toString(),
      key: key,
      description: newFieldDesc,
      type: newFieldType
    };

    onUpdateConfig({
      ...config,
      isCustom: true,
      fields: [...config.fields, newField]
    });

    setNewFieldKey('');
    setNewFieldDesc('');
    setNewFieldType('string');
  };

  const handleRemoveField = (id: string) => {
    onUpdateConfig({
      ...config,
      isCustom: true,
      fields: config.fields.filter(f => f.id !== id)
    });
  };

  const loadPreset = (presetKey: string, name: string) => {
    onUpdateConfig({
      id: presetKey,
      name: name,
      isCustom: true,
      fields: PRESETS[presetKey]
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <h2 className="font-semibold text-black flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-600" />
          Output Configuration
        </h2>
        <button 
          onClick={onReset}
          className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Reset to Default
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Presets */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick Presets</h3>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => loadPreset('er_injury_surveillance', 'ER Injury Surveillance')}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-black rounded-full hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              ER Injury Surveillance
            </button>
            <button 
              onClick={() => loadPreset('medication_reconciliation', 'Meds Recon')}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-black rounded-full hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              Medication List
            </button>
            <button 
              onClick={() => loadPreset('billing_coding', 'Billing Support')}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-black rounded-full hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              Billing / Coding
            </button>
            <button 
              onClick={() => loadPreset('discharge_summary', 'Discharge Summary')}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-black rounded-full hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              Discharge Summary
            </button>
          </div>
        </div>

        {/* Current Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Active Fields ({config.fields.length})
            </h3>
            {config.isCustom && <span className="text-xs text-purple-600 font-medium">Custom Mode Active</span>}
          </div>
          
          <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
            {config.fields.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No fields defined. Add some below.
              </div>
            ) : (
              config.fields.map((field) => (
                <div key={field.id} className="p-3 flex items-start justify-between group bg-white first:rounded-t-xl last:rounded-b-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-black bg-gray-100 px-1.5 py-0.5 rounded">
                        {field.key}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 border border-gray-100 px-1 rounded">
                        {field.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{field.description}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveField(field.id)}
                    className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add New Field Form */}
        <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Plus className="w-3 h-3" /> Add Custom Field
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Field Name (Key)</label>
              <input 
                type="text"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                placeholder="e.g. Blood Pressure, Smoking Status"
                className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description (AI Instruction)</label>
              <input 
                type="text"
                value={newFieldDesc}
                onChange={(e) => setNewFieldDesc(e.target.value)}
                placeholder="e.g. Extract the initial BP reading"
                className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-black"
              />
            </div>
            <div className="flex justify-between items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Data Type</label>
                <select 
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                  className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 text-black"
                >
                  <option value="string">Text (String)</option>
                  <option value="array">List (Array)</option>
                  <option value="boolean">Yes/No (Boolean)</option>
                </select>
              </div>
              <button 
                onClick={handleAddField}
                disabled={!newFieldKey.trim() || !newFieldDesc.trim()}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SchemaBuilder;
