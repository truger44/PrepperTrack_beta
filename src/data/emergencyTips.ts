/**
 * Emergency tips and guidance for different scenarios
 * Based on FEMA and other official emergency management recommendations
 */

/**
 * Get tips for power outage emergencies
 */
export function getPowerOutageTips(): string[] {
  return [
    "Keep refrigerator and freezer doors closed. Food will stay cold for about 4 hours in an unopened refrigerator and 48 hours in a full freezer.",
    "Use battery-powered flashlights or lanterns instead of candles to reduce fire risk.",
    "Turn off or disconnect appliances to avoid damage from electrical surges when power returns.",
    "If using a generator, keep it outside and away from windows to prevent carbon monoxide poisoning.",
    "Check on elderly neighbors and those with medical conditions that require electricity.",
    "Have a battery-powered or hand-crank radio to stay informed about the outage.",
    "Conserve phone battery by reducing screen brightness and using power-saving mode.",
    "If it's cold, conserve heat by closing off unused rooms and stuffing towels under doors.",
    "If it's hot, stay on the lowest floor of your home and wear lightweight, light-colored clothing.",
    "Keep a thermometer in your refrigerator and freezer to check food safety when power returns."
  ];
}

/**
 * Get tips for flood emergencies
 */
export function getFloodTips(): string[] {
  return [
    "Evacuate immediately if told to do so by authorities. Never ignore evacuation orders.",
    "Avoid walking or driving through flood waters. Just 6 inches of moving water can knock you down, and 1 foot can sweep your vehicle away.",
    "Move to higher ground or a higher floor. Stay where you are if that's safer than trying to evacuate.",
    "Disconnect utilities at the main switches if instructed to do so and if it's safe.",
    "Sanitize bathtubs and fill them with clean water in case water becomes contaminated.",
    "Keep important documents in a waterproof container and move valuables to higher levels.",
    "Wear rubber boots and gloves if you must walk through flood water to avoid contaminants.",
    "Be aware of areas where floodwaters have receded as roads may have weakened and could collapse.",
    "Avoid contact with flood water as it may be contaminated with sewage, chemicals, or other hazards.",
    "Listen to authorities for information on safe drinking water. Boil water if advised."
  ];
}

/**
 * Get tips for pandemic emergencies
 */
export function getPandemicTips(): string[] {
  return [
    "Practice good hygiene by washing hands frequently with soap and water for at least 20 seconds.",
    "Maintain physical distance (at least 6 feet) from others outside your household.",
    "Wear appropriate personal protective equipment (PPE) like masks when in public spaces.",
    "Clean and disinfect frequently touched surfaces daily, including tables, doorknobs, light switches, and phones.",
    "Monitor your health daily and be alert for symptoms such as fever, cough, or shortness of breath.",
    "Have a 30-day supply of prescription medications on hand.",
    "Stock up on over-the-counter medications, medical supplies, and non-perishable foods.",
    "Stay informed through reliable sources like the CDC, WHO, or local health departments.",
    "Create a household plan of action, including care for vulnerable family members and pets.",
    "Maintain social connections virtually to support mental health during isolation periods."
  ];
}

/**
 * Get general emergency preparedness tips
 */
export function getGeneralEmergencyTips(): string[] {
  return [
    "Create an emergency communication plan for your family, including an out-of-town contact.",
    "Have at least a three-day supply of non-perishable food and water (one gallon per person per day).",
    "Keep a battery-powered or hand-crank radio to receive emergency information.",
    "Have flashlights and extra batteries for everyone in your household.",
    "Keep a first aid kit and medications (prescription and non-prescription) on hand.",
    "Store important documents in a waterproof container.",
    "Have cash or traveler's checks available in case ATMs and credit card readers aren't working.",
    "Keep a fire extinguisher accessible and make sure everyone knows how to use it.",
    "Know how to turn off utilities (water, gas, electricity) at the main switches or valves.",
    "Have sleeping bags or warm blankets for each person in your household."
  ];
}

/**
 * Get specific medical tips for pandemic situations
 */
export function getPandemicMedicalTips(): string[] {
  return [
    "Maintain a 90-day supply of prescription medications if possible.",
    "Stock up on over-the-counter medications for fever, cough, and other symptoms.",
    "Have a supply of face masks, gloves, and hand sanitizer (at least 60% alcohol).",
    "Keep a thermometer and pulse oximeter to monitor health conditions.",
    "Create a contact list of healthcare providers, including telehealth options.",
    "Know the emergency warning signs that require immediate medical attention.",
    "Prepare a health information sheet for each family member with medical conditions, medications, and allergies.",
    "Have disinfecting supplies like bleach, disinfectant wipes, and spray.",
    "Consider vitamin supplements as recommended by healthcare providers.",
    "Maintain isolation supplies for sick family members (separate bedroom, bathroom if possible)."
  ];
}