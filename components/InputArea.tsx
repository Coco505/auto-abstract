import React, { useState } from 'react';
import { FileText, Sparkles, Trash2, Settings, ArrowLeft, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { ClinicalNotePreset, ProcessingStatus, ExtractionConfig } from '../types';
import SchemaBuilder from './SchemaBuilder';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  status: ProcessingStatus;
  onClear: () => void;
  extractionConfig: ExtractionConfig;
  onUpdateConfig: (config: ExtractionConfig) => void;
}

const PRESETS: ClinicalNotePreset[] = [
  {
    name: "ER Report",
    content: `HISTORY OF PRESENT ILLNESS: This is a 12-year-old male, who was admitted to the Emergency Department, who fell off his bicycle, not wearing a helmet, a few hours ago. There was loss of consciousness. The patient complains of neck pain.

CHRONIC/INACTIVE CONDITIONS: None.

PERSONAL/FAMILY/SOCIAL HISTORY/ILLNESSES: None.

PREVIOUS INJURIES: Minor.

MEDICATIONS: None.

PREVIOUS OPERATIONS: None.

ALLERGIES: NONE KNOWN.

FAMILY HISTORY: Negative for heart disease, hypertension, obesity, diabetes, cancer or stroke.

SOCIAL HISTORY: The patient is single. He is a student. He does not smoke, drink alcohol or consume drugs.

REVIEW OF SYSTEMS
CONSTITUTIONAL: The patient denies weight loss/gain, fever, chills.
ENMT: The patient denies headaches, nosebleeds, voice changes, blurry vision, changes in/loss of vision.
CV: The patient denies chest pain, SOB supine, palpitations, edema, varicose veins, leg pains.
RESPIRATORY: The patient denies SOB, wheezing, sputum production, bloody sputum, cough.
GI: The patient denies heartburn, blood in stools, loss of appetite, abdominal pain, constipation.
GU: The patient denies painful/burning urination, cloudy/dark urine, flank pain, groin pain.
MS: The patient denies joint pain/stiffness, backaches, tendon/ligaments/muscle pains/strains, bone aches/pains, muscle weakness.
NEURO: The patient had a loss of consciousness during the accident. He does not recall the details of the accident. Otherwise, negative for blackouts, seizures, loss of memory, hallucinations, weakness, numbness, tremors, paralysis.
PSYCH: Negative for anxiety, irritability, apathy, depression, sleep disturbances, appetite disturbances, suicidal thoughts.
INTEGUMENTARY: Negative for unusual hair loss/breakage, skin lesions/discoloration, unusual nail breakage/discoloration.

PHYSICAL EXAMINATION
CONSTITUTIONAL: Blood pressure 150/75, pulse rate 80, respirations 18, temperature 37.4, saturation 97% on room air. The patient shows moderate obesity.
NECK: The neck is symmetric, the trachea is in the midline, and there are no masses. No crepitus is palpated. The thyroid is palpable, not enlarged, smooth, moves with swallowing, and has no palpable masses.
RESPIRATIONS: Normal respiratory effort. There is no intercostal retraction or action by the accessory muscles. Normal breath sounds bilaterally with no rhonchi, wheezing or rubs.
CARDIOVASCULAR: The PMI is palpable at the 5ICS in the MCL. No thrills on palpation. S1 and S2 are easily audible. No audible S3, S4, murmur, click or rub. Abdominal aorta is not palpable. No audible abdominal bruits. Femoral pulses are 3+ bilaterally, without audible bruits. Extremities show no edema or varicosities.
GASTROINTESTINAL: No palpable tenderness or masses. Liver and spleen are percussed but not palpable under the costal margins. No evidence for umbilical or groin herniae.
LYMPHATIC: No nodes over 3 mm in the neck, axillae or groins.
MUSCULOSKELETAL: Normal gait and station. The patient is on a stretcher. Symmetric muscle strength and normal tone, without signs of atrophy or abnormal movements.
SKIN: There is a hematoma in the forehead and one in the occipital scalp, and there are abrasions in the upper extremities and abrasions on the knees. No induration or subcutaneous nodules to palpation.
NEUROLOGIC: Normal sensation by touch. The patient moves all four extremities.
PSYCHIATRIC: Oriented to time, place, and person. Appropriate mood and affect.

LABORATORY DATA: Reviewed chest x-ray, which is normal, right hand x-ray, which is normal, and an MRI of the head, which is normal.

DIAGNOSES
1. Concussion.
2. Facial abrasion.
3. Scalp laceration.
4. Knee abrasions.`
  },
  {
    name: "Discharge Summary",
    content: `ADMITTING DIAGNOSIS: Abscess with cellulitis, left foot.

DISCHARGE DIAGNOSIS: Status post I&D, left foot.

PROCEDURES: Incision and drainage, first metatarsal head, left foot with culture and sensitivity.

HISTORY OF PRESENT ILLNESS: The patient presented to Dr. X's office on 06/14/07 complaining of a painful left foot. The patient had been treated conservatively in office for approximately 5 days, but symptoms progressed with the need of incision and drainage being decided.

MEDICATIONS: Ancef IV.

ALLERGIES: ACCUTANE.

SOCIAL HISTORY: Denies smoking or drinking.

PHYSICAL EXAMINATION: Palpable pedal pulses noted bilaterally. Capillary refill time less than 3 seconds, digits 1 through 5 bilateral. Skin supple and intact with positive hair growth. Epicritic sensation intact bilateral. Muscle strength +5/5, dorsiflexors, plantar flexors, invertors, evertors. Left foot with erythema, edema, positive tenderness noted, left forefoot area.

LABORATORY: White blood cell count never was abnormal. The remaining within normal limits. X-ray is negative for osteomyelitis. On 06/14/07, the patient was taken to the OR for incision and drainage of left foot abscess. The patient tolerated the procedure well and was admitted and placed on vancomycin 1 g q.12h after surgery and later changed Ancef 2 g IV every 8 hours. Postop wound care consists of Aquacel Ag and dry dressing to the surgical site everyday and the patient remains nonweightbearing on the left foot. The patient progressively improved with IV antibiotics and local wound care and was discharged from the hospital on 06/19/07 in excellent condition.

DISCHARGE MEDICATIONS: Lorcet 10/650 mg, dispense 24 tablets, one tablet to be taken by mouth q.6h as needed for pain. The patient was continued on Ancef 2 g IV via PICC line and home health administration of IV antibiotics.

DISCHARGE INSTRUCTIONS: Included keeping the foot elevated with long periods of rest. The patient is to wear surgical shoe at all times for ambulation and to avoid excessive ambulation. The patient to keep dressing dry and intact, left foot. The patient to contact Dr. X for all followup care, if any problems arise. The patient was given written and oral instruction about wound care before discharge. Prior to discharge, the patient was noted to be afebrile. All vitals were stable. The patient's questions were answered and the patient was discharged in apparent satisfactory condition. Followup care was given via Dr. X' office.`
  }
];

const InputArea: React.FC<InputAreaProps> = ({ 
  value, 
  onChange, 
  onAnalyze, 
  status, 
  onClear,
  extractionConfig,
  onUpdateConfig
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const isProcessing = status === ProcessingStatus.PROCESSING;

  const handleResetConfig = () => {
    onUpdateConfig({
      id: 'default',
      name: 'Injury Surveillance',
      isCustom: false,
      fields: []
    });
  };

  // If showing configuration
  if (showConfig) {
    return (
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="flex-1 min-h-0">
          <SchemaBuilder 
            config={extractionConfig}
            onUpdateConfig={onUpdateConfig}
            onReset={handleResetConfig}
          />
        </div>
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={() => setShowConfig(false)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-black bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Text Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Top Header: Title and Settings */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
        <h2 className="font-semibold text-black flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Text Input
        </h2>
        <button 
           onClick={() => setShowConfig(true)}
           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
             ${extractionConfig.isCustom 
               ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
               : 'bg-white text-gray-600 border-gray-200 hover:text-black hover:border-gray-300 hover:bg-gray-50'}`}
         >
           <Settings className="w-3.5 h-3.5" />
           {extractionConfig.isCustom ? 'Custom Schema' : 'Default Schema'}
           <ChevronRight className="w-3 h-3 opacity-50" />
         </button>
      </div>
      
      {/* Sub Header: Presets */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0 min-h-[44px]">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1 flex-shrink-0">
            <BookOpen className="w-3 h-3" />
            Load Example:
          </span>
          <div className="flex gap-2">
             {PRESETS.map((preset) => (
               <button
                 key={preset.name}
                 onClick={() => onChange(preset.content)}
                 disabled={isProcessing}
                 className="text-xs font-medium px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all disabled:opacity-50"
               >
                 {preset.name}
               </button>
             ))}
          </div>
        </div>
        <a 
          href="https://www.mtsamples.com/index.asp" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[10px] text-gray-400 hover:text-blue-500 hidden sm:flex items-center gap-1 ml-3 whitespace-nowrap flex-shrink-0"
          title="Sample data from mtsamples.com"
        >
          Source: mtsamples.com
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
      
      <div className="flex-1 relative bg-white min-h-0">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste anonymized clinical chart, triage note, or discharge summary here..."
          className="w-full h-full p-4 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-50 font-mono text-sm text-black placeholder:text-gray-400 leading-relaxed"
          disabled={isProcessing}
        />
        {value && (
          <button 
            onClick={onClear}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 bg-white border border-gray-100 shadow-sm"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <button
          onClick={onAnalyze}
          disabled={!value.trim() || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all
            ${!value.trim() || isProcessing 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:transform active:scale-[0.99]'
            }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Abstracting {extractionConfig.isCustom ? 'Custom' : ''} Data...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze & Abstract
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;