export interface MedicalCondition {
  id: string;
  name: string;
  category: 'chronic' | 'acute' | 'mental_health' | 'physical_disability' | 'sensory';
  requiredSupplies: string[];
}

export const medicalConditions: MedicalCondition[] = [
  {
    id: 'diabetes_type1',
    name: 'Diabetes (Type 1)',
    category: 'chronic',
    requiredSupplies: [
      'Blood glucose meter & test strips',
      'Lancets and lancing device',
      'Insulin (pens, vials, or pump supplies)',
      'Syringes or insulin pen needles',
      'Glucagon emergency kit',
      'Glucose tablets or gel',
      'Cooler or insulated bag for insulin storage',
      'Alcohol swabs'
    ]
  },
  {
    id: 'diabetes_type2',
    name: 'Diabetes (Type 2)',
    category: 'chronic',
    requiredSupplies: [
      'Blood glucose meter & test strips',
      'Lancets and lancing device',
      'Insulin (pens, vials, or pump supplies)',
      'Syringes or insulin pen needles',
      'Glucagon emergency kit',
      'Glucose tablets or gel',
      'Cooler or insulated bag for insulin storage',
      'Alcohol swabs'
    ]
  },
  {
    id: 'asthma',
    name: 'Asthma',
    category: 'chronic',
    requiredSupplies: [
      'Rescue inhaler (e.g., albuterol)',
      'Maintenance inhalers (e.g., corticosteroids)',
      'Nebulizer & extra tubing/masks',
      'Portable battery-powered nebulizer',
      'Peak flow meter',
      'Masks (for dust/smoke exposure)',
      'Oxygen (portable tanks or concentrator if prescribed)'
    ]
  },
  {
    id: 'copd',
    name: 'COPD',
    category: 'chronic',
    requiredSupplies: [
      'Rescue inhaler (e.g., albuterol)',
      'Maintenance inhalers (e.g., corticosteroids)',
      'Nebulizer & extra tubing/masks',
      'Portable battery-powered nebulizer',
      'Peak flow meter',
      'Masks (for dust/smoke exposure)',
      'Oxygen (portable tanks or concentrator if prescribed)'
    ]
  },
  {
    id: 'heart_disease',
    name: 'Heart Disease',
    category: 'chronic',
    requiredSupplies: [
      'Blood pressure monitor',
      'Daily medications (beta-blockers, ACE inhibitors, etc.)',
      'Aspirin (if prescribed)',
      'Nitroglycerin tablets'
    ]
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    category: 'chronic',
    requiredSupplies: [
      'Blood pressure monitor',
      'Daily medications (beta-blockers, ACE inhibitors, etc.)',
      'Aspirin (if prescribed)',
      'Nitroglycerin tablets'
    ]
  },
  {
    id: 'allergies',
    name: 'Allergies',
    category: 'acute',
    requiredSupplies: [
      'Epinephrine auto-injectors (EpiPen, Auvi-Q)',
      'Antihistamines (Benadryl, cetirizine, etc.)',
      'Allergy-safe food (for food allergies)'
    ]
  },
  {
    id: 'anaphylaxis',
    name: 'Anaphylaxis',
    category: 'acute',
    requiredSupplies: [
      'Epinephrine auto-injectors (EpiPen, Auvi-Q)',
      'Antihistamines (Benadryl, cetirizine, etc.)',
      'Allergy-safe food (for food allergies)'
    ]
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    category: 'mental_health',
    requiredSupplies: [
      'Prescription medications (antidepressants, antipsychotics, etc.)',
      'Noise-cancelling headphones (to reduce sensory overload)'
    ]
  },
  {
    id: 'depression',
    name: 'Depression',
    category: 'mental_health',
    requiredSupplies: [
      'Prescription medications (antidepressants, antipsychotics, etc.)',
      'Noise-cancelling headphones (to reduce sensory overload)'
    ]
  },
  {
    id: 'ptsd',
    name: 'PTSD',
    category: 'mental_health',
    requiredSupplies: [
      'Prescription medications (antidepressants, antipsychotics, etc.)',
      'Noise-cancelling headphones (to reduce sensory overload)'
    ]
  },
  {
    id: 'schizophrenia',
    name: 'Schizophrenia',
    category: 'mental_health',
    requiredSupplies: [
      'Prescription medications (antidepressants, antipsychotics, etc.)',
      'Noise-cancelling headphones (to reduce sensory overload)'
    ]
  },
  {
    id: 'epilepsy',
    name: 'Epilepsy',
    category: 'chronic',
    requiredSupplies: [
      'Anti-seizure medications',
      'Rescue medications (e.g., rectal diazepam, intranasal midazolam)'
    ]
  },
  {
    id: 'seizure_disorders',
    name: 'Seizure Disorders',
    category: 'chronic',
    requiredSupplies: [
      'Anti-seizure medications',
      'Rescue medications (e.g., rectal diazepam, intranasal midazolam)'
    ]
  },
  {
    id: 'mobility_issues',
    name: 'Mobility Issues',
    category: 'physical_disability',
    requiredSupplies: [
      'Catheters, incontinence supplies'
    ]
  },
  {
    id: 'physical_disabilities',
    name: 'Physical Disabilities',
    category: 'physical_disability',
    requiredSupplies: [
      'Catheters, incontinence supplies'
    ]
  },
  {
    id: 'kidney_disease',
    name: 'Kidney Disease',
    category: 'chronic',
    requiredSupplies: [
      'Daily medications',
      'Low-potassium emergency food',
      'Water and electrolyte-balancing drinks',
      'Surgical mask and antiseptic for catheter care'
    ]
  },
  {
    id: 'dialysis',
    name: 'Dialysis',
    category: 'chronic',
    requiredSupplies: [
      'Daily medications',
      'Low-potassium emergency food',
      'Water and electrolyte-balancing drinks',
      'Surgical mask and antiseptic for catheter care'
    ]
  },
  {
    id: 'hearing_impairment',
    name: 'Hearing Impairment',
    category: 'sensory',
    requiredSupplies: [
      'Hearing aid batteries or charger'
    ]
  },
  {
    id: 'deafness',
    name: 'Deafness',
    category: 'sensory',
    requiredSupplies: [
      'Hearing aid batteries or charger'
    ]
  },
  {
    id: 'cancer',
    name: 'Cancer',
    category: 'chronic',
    requiredSupplies: [
      'Masks, gloves, and hand sanitizer',
      'Disinfecting wipes',
      'Medications (e.g., immunosuppressants, chemotherapy)',
      'Sterile dressings',
      'Fever-reducing medications'
    ]
  },
  {
    id: 'autoimmune_diseases',
    name: 'Autoimmune Diseases',
    category: 'chronic',
    requiredSupplies: [
      'Masks, gloves, and hand sanitizer',
      'Disinfecting wipes',
      'Medications (e.g., immunosuppressants, chemotherapy)',
      'Sterile dressings',
      'Fever-reducing medications'
    ]
  },
  {
    id: 'immunocompromised',
    name: 'Immunocompromised',
    category: 'chronic',
    requiredSupplies: [
      'Masks, gloves, and hand sanitizer',
      'Disinfecting wipes',
      'Medications (e.g., immunosuppressants, chemotherapy)',
      'Sterile dressings',
      'Fever-reducing medications'
    ]
  }
];

export const getCategoryColor = (category: MedicalCondition['category']): string => {
  switch (category) {
    case 'chronic': return 'bg-red-100 text-red-800 border-red-200';
    case 'acute': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'mental_health': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'physical_disability': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'sensory': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getCategoryIcon = (category: MedicalCondition['category']): string => {
  switch (category) {
    case 'chronic': return '🩺';
    case 'acute': return '⚡';
    case 'mental_health': return '🧠';
    case 'physical_disability': return '♿';
    case 'sensory': return '👁️';
    default: return '🏥';
  }
};