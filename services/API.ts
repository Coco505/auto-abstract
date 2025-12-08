import { ExtractedData, SchemaField } from "../types";

const API_KEY = process.env.API_KEY;

// --- Default Hardcoded Schema (Injury Surveillance) ---
const defaultInjurySchemaProperties = {
  visitDate: { type: "string", description: "Date of the hospital visit (YYYY-MM-DD) or 'Not Specified'" },
  visitTime: { type: "string", description: "Time of arrival/visit or 'Not Specified'" },
  patientAge: { type: "string", description: "Age of the patient or 'Not Specified'" },
  patientGender: { type: "string", description: "Gender of the patient or 'Not Specified'" },
  incidentLocation: { type: "string", description: "Where the injury/incident occurred (e.g. Home, Highway)" },
  injuryMechanism: { type: "string", description: "How the injury happened (e.g. Fall, MVA, Poisoning)" },
  intent: { 
    type: "string", 
    description: "Intent of injury (e.g. Unintentional, Self-harm, Assault, Undetermined)" 
  },
  diagnoses: { 
    type: "array", 
    items: { type: "string" },
    description: "List of confirmed clinical diagnoses for THIS ENCOUNTER only. Exclude past medical history."
  },
  disposition: { type: "string", description: "Discharge status (e.g. Discharged to home, Admitted, Transferred)" },
  briefSummary: { type: "string", description: "A concise 2-sentence summary of the clinical narrative for research coding purposes." },
  missingInformation: {
    type: "array",
    items: { type: "string" },
    description: "List of the exact JSON property keys (e.g. 'patientAge', 'visitTime', 'intent') that were missing or could not be confidently extracted from the text."
  }
};

const defaultInjurySchema = {
  type: "object",
  properties: defaultInjurySchemaProperties,
  required: [
    "visitDate", "visitTime", "patientAge", "patientGender", 
    "incidentLocation", "injuryMechanism", "intent", 
    "diagnoses", "disposition", "briefSummary", 
    "missingInformation"
  ],
  additionalProperties: false
};

// --- Dynamic Schema Generator ---
export const generateSchemaFromFields = (fields: SchemaField[]) => {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  fields.forEach(field => {
    let fieldSchema: any;
    
    switch (field.type) {
      case 'array':
        fieldSchema = {
          type: "array",
          items: { type: "string" },
          description: field.description
        };
        break;
      case 'boolean':
        fieldSchema = {
          type: "boolean",
          description: field.description
        };
        break;
      default: // string, date
        fieldSchema = {
          type: "string",
          description: field.description
        };
    }
    
    properties[field.key] = fieldSchema;
    required.push(field.key);
  });

  // Always add missingInformation field for consistent UI handling
  properties['missingInformation'] = {
    type: "array",
    items: { type: "string" },
    description: "List of the exact JSON property keys that were missing or could not be confidently extracted."
  };
  required.push('missingInformation');

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false
  };
};

export const extractClinicalData = async (
  clinicalNote: string, 
  customFields?: SchemaField[]
): Promise<ExtractedData> => {
  try {
    // Determine which schema to use
    let targetSchema = defaultInjurySchema;
    
    // Base instruction strictly enforcing text extraction without hallucination
    const baseInstruction = `
      You are an expert clinical data abstraction assistant.
      
      CRITICAL RULES:
      1. NO HALLUCINATIONS: If the input text does not explicitly state a fact or diagnosis, do NOT generate one. Return "Not Specified" or an empty list.
      2. SOURCE OF TRUTH: Only extract facts present in the text. Do not infer details that are not written.
      3. DIAGNOSES EXTRACTION RULES:
         - ONLY extract diagnoses established, addressed, or treated during THIS specific clinical encounter.
         - STRICTLY EXCLUDE Past Medical History (PMH).
         - STRICTLY EXCLUDE chronic conditions listed under "History", "PMH", or "Past History" unless they are the primary reason for the current visit.
         - STRICTLY EXCLUDE "History of..." items (e.g., "History of appendectomy", "History of hypertension").
         - Just extract the name of the diagnosis as a string (e.g., "Fracture of distal radius").
    `;

    let systemInstruction = baseInstruction;

    if (customFields && customFields.length > 0) {
      targetSchema = generateSchemaFromFields(customFields);
      systemInstruction += "\nExtract the specific fields defined in the schema. Return 'Not Specified' for missing string data.";
    } else {
      systemInstruction += "\nExtract standard injury surveillance data.";
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_APP_NAME || "Clinical Data Extraction"
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "user",
            content: `${systemInstruction}\n\nCLINICAL NOTE:\n${clinicalNote}\n\nYou must respond with ONLY valid JSON matching this exact schema (no additional text, no markdown, no explanations):\n${JSON.stringify(targetSchema, null, 2)}`
          }
        ],
        temperature: 0.0,
        seed: 42
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      (error as any).statusCode = response.status;
      (error as any).responseBody = errorText;
      throw error;
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      let content = data.choices[0].message.content;
      
      // Strip markdown code blocks if present
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      return JSON.parse(content.trim()) as ExtractedData;
    }
    
    throw new Error("Empty or invalid response from model");
  } catch (error) {
    console.error("OpenRouter Gemini Extraction Error:", error);
    throw error;
  }
};