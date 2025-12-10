# AutoAbstract

An AI-powered tool that automatically extracts structured data from clinical notes.

## 🔗 Live App: https://auto-abstract.pages.dev/

No setup required, just visit the link and start using!

## Overview

AutoAbstract uses advanced AI to transform unstructured clinical narratives into structured, machine-readable data. Simply paste a clinical note, and the tool automatically identifies and extracts key information like patient demographics, diagnoses, incident details, and disposition.

## Why AutoAbstract?

Clinical documentation is often lengthy and unstructured, making it time-consuming to extract key information for:
- **Data entry**: Eliminate repetitive manual data entry into registries, databases, or surveillance systems
- **Quick review**: Get a structured overview of essential details without reading through entire notes
- **Research & analysis**: Convert narrative notes into structured data for analysis and reporting
- **Quality improvement**: Standardize data collection across clinical encounters

AutoAbstract automates this tedious work, saving time and reducing human error in data abstraction.

## How to Use

### Basic Extraction

1. **Enter your clinical note** in the text input area
2. **Click "Extract Data"** to process the note
3. **View the structured output** 
4. Check the `missingInformation` field to see what couldn't be extracted
5. **Optional export of output** to JSON or CSV

### Default Schema

The tool extracts standard injury surveillance data:
- Visit date and time
- Patient age and gender
- Incident location and injury mechanism
- Intent (unintentional, self-harm, assault, etc.)
- Clinical diagnoses (current encounter only)
- Disposition/discharge status
- Brief clinical summary

### Custom Schema (Optional)

To extract different fields:

1. **Click "Custom Schema"**
2. **Add your custom fields** with:
   - Field name (e.g., "medications")
   - Field type (string, array, boolean)
   - Description (what to extract)
3. **Click "Extract Data"** to use your custom schema
---

**Note**: For research and educational purposes. Always validate extracted data.
