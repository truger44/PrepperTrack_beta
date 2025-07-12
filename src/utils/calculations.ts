import { InventoryItem, HouseholdMember, RationingScenario, SustainabilityMetrics, WarningFlag, PrepperSettings } from '../types';
import { EmergencyScenario } from '../types';

export function calculateCaloriesByAge(age: number, activityLevel: string): number {
  // Base metabolic rate calculations based on age and activity level
  let baseCalories: number;
  
  if (age < 2) baseCalories = 1200;
  else if (age < 13) baseCalories = 1600;
  else if (age < 18) baseCalories = 2000;
  else if (age < 65) baseCalories = 1800;
  else baseCalories = 1600;

  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.2,
    moderate: 1.4,
    active: 1.6,
    very_active: 1.8,
  };

  return Math.round(baseCalories * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2));
}

export function calculateWaterByClimate(baseWater: number, climate: string): number {
  const climateMultipliers = {
    temperate: 1.0,
    hot_dry: 1.5,
    hot_humid: 1.3,
    cold: 0.8,
  };

  return baseWater * (climateMultipliers[climate as keyof typeof climateMultipliers] || 1.0);
}

export function calculateWaterNeedsWithSafetyMargin(
  household: HouseholdMember[],
  settings: PrepperSettings
): number {
  const baseDailyWater = household.reduce((sum, member) => sum + member.dailyWaterLiters, 0);
  return baseDailyWater * settings.waterSafetyMargin;
}

export function calculatePreparednessStatus(
  actualDays: number,
  goalDays: number
): { status: 'excellent' | 'good' | 'adequate' | 'poor' | 'critical'; percentage: number } {
  const percentage = (actualDays / goalDays) * 100;
  
  if (percentage >= 100) return { status: 'excellent', percentage };
  if (percentage >= 75) return { status: 'good', percentage };
  if (percentage >= 50) return { status: 'adequate', percentage };
  if (percentage >= 25) return { status: 'poor', percentage };
  return { status: 'critical', percentage };
}

export function calculateSustainabilityMetrics(
  inventory: InventoryItem[],
  household: HouseholdMember[],
  rationingScenarios: RationingScenario[],
  settings: PrepperSettings
): SustainabilityMetrics {
  const warnings: WarningFlag[] = [];
  const totalHouseholdSize = household.length;
  
  if (totalHouseholdSize === 0) {
    return {
      normalUsageDays: 0,
      rationedUsageDays: {},
      dailyCaloriesPerPerson: {},
      warningFlags: [{ type: 'critical', category: 'Household', message: 'No household members defined' }],
    };
  }

  // Calculate total daily calorie needs
  const totalDailyCalories = household.reduce((sum, member) => sum + member.dailyCalories, 0);
  
  // Calculate water needs with safety margin
  const totalDailyWaterWithMargin = calculateWaterNeedsWithSafetyMargin(household, settings);

  // Calculate food sustainability
  const foodItems = inventory.filter(item => item.category.startsWith('Food'));
  const totalCaloriesInStock = foodItems.reduce((sum, item) => 
    sum + (item.quantity * (item.caloriesPerUnit || 0)), 0);

  const normalFoodDays = totalDailyCalories > 0 ? Math.floor(totalCaloriesInStock / totalDailyCalories) : 0;

  // Calculate water sustainability with safety margin
  const waterItems = inventory.filter(item => item.category === 'Water');
  const totalWaterInStock = waterItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Convert gallons to liters (1 gallon = 3.78541 liters)
  const totalWaterInLiters = totalWaterInStock * 3.78541;
  const waterDays = totalDailyWaterWithMargin > 0 ? Math.floor(totalWaterInLiters / totalDailyWaterWithMargin) : 0;

  // Overall sustainability is limited by the shortest supply
  const normalUsageDays = Math.min(normalFoodDays, waterDays);

  // Calculate preparedness status against goal
  const preparednessStatus = calculatePreparednessStatus(normalUsageDays, settings.preparednessGoalDays);

  // Calculate rationed scenarios
  const rationedUsageDays: Record<string, number> = {};
  const dailyCaloriesPerPerson: Record<string, number> = {};

  rationingScenarios.forEach(scenario => {
    const rationMultiplier = 1 - (scenario.reductionPercentage / 100);
    const rationedDailyCalories = totalDailyCalories * rationMultiplier;
    const rationedFoodDays = rationedDailyCalories > 0 ? Math.floor(totalCaloriesInStock / rationedDailyCalories) : 0;
    
    // Water consumption doesn't change with food rationing
    rationedUsageDays[scenario.id] = Math.min(rationedFoodDays, waterDays);
    dailyCaloriesPerPerson[scenario.id] = rationedDailyCalories / totalHouseholdSize;

    // Warning for dangerous calorie levels
    const caloriesPerPerson = dailyCaloriesPerPerson[scenario.id];
    if (caloriesPerPerson < settings.minimumCaloriesPerDay) {
      warnings.push({
        type: 'critical',
        category: 'Nutrition',
        message: `${scenario.name} rationing provides only ${Math.round(caloriesPerPerson)} calories per person per day - below safe minimum`,
      });
    }
  });

  // Check for expiring items
  const today = new Date();
  
  inventory.forEach(item => {
    if (item.expirationDate) {
      const expDate = new Date(item.expirationDate);
      const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysUntilExpiry < 0) {
        warnings.push({
          type: 'critical',
          category: 'Expiration',
          message: `${item.name} expired ${Math.abs(daysUntilExpiry)} days ago`,
          daysRemaining: daysUntilExpiry,
        });
      } else if (daysUntilExpiry <= 30) {
        warnings.push({
          type: 'warning',
          category: 'Expiration',
          message: `${item.name} expires in ${daysUntilExpiry} days`,
          daysRemaining: daysUntilExpiry,
        });
      }
    }
  });

  // Check overall preparedness against goal
  if (preparednessStatus.status === 'critical') {
    warnings.push({
      type: 'critical',
      category: 'Preparedness Goal',
      message: `Current supplies last only ${normalUsageDays} days, critically below your ${settings.preparednessGoalDays}-day goal (${preparednessStatus.percentage.toFixed(1)}% of target)`,
    });
  } else if (preparednessStatus.status === 'poor') {
    warnings.push({
      type: 'warning',
      category: 'Preparedness Goal',
      message: `Current supplies last ${normalUsageDays} days, below your ${settings.preparednessGoalDays}-day goal (${preparednessStatus.percentage.toFixed(1)}% of target)`,
    });
  } else if (preparednessStatus.status === 'adequate') {
    warnings.push({
      type: 'info',
      category: 'Preparedness Goal',
      message: `Current supplies last ${normalUsageDays} days, approaching your ${settings.preparednessGoalDays}-day goal (${preparednessStatus.percentage.toFixed(1)}% of target)`,
    });
  }

  // Water safety margin warnings
  const baseDailyWater = household.reduce((sum, member) => sum + member.dailyWaterLiters, 0);
  const waterDaysWithoutMargin = baseDailyWater > 0 ? Math.floor(totalWaterInLiters / baseDailyWater) : 0;
  const marginDifference = waterDaysWithoutMargin - waterDays;
  
  if (marginDifference > 0) {
    warnings.push({
      type: 'info',
      category: 'Water Safety',
      message: `Water safety margin (${settings.waterSafetyMargin}x) reduces supply duration by ${marginDifference} days for emergency reserves`,
    });
  }

  return {
    normalUsageDays,
    rationedUsageDays,
    dailyCaloriesPerPerson,
    warningFlags: warnings,
  };
}

export function suggestUsageRate(category: string, itemName: string): number {
  const suggestions: Record<string, Record<string, number>> = {
    'Food - Grains': {
      'Rice': 0.5,
      'Wheat': 0.3,
      'Oats': 0.2,
    },
    'Food - Proteins': {
      'Canned Chicken': 0.15,
      'Beans': 0.3,
      'Peanut Butter': 0.1,
    },
    'Water': {
      'default': 3.0, // liters per person per day
    },
    'Medical': {
      'Ibuprofen': 0.002, // 2 pills per day max
      'Bandages': 0.1,
    },
  };

  return suggestions[category]?.[itemName] || suggestions[category]?.['default'] || 0.1;
}

// Helper function to get status color for UI components
export function getPreparednessStatusColor(status: string): string {
  switch (status) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-green-500';
    case 'adequate': return 'text-yellow-500';
    case 'poor': return 'text-orange-500';
    case 'critical': return 'text-red-600';
    default: return 'text-slate-500';
  }
}

/**
 * Adjust inventory based on emergency scenario
 */
export function adjustInventoryForEmergency(
  inventory: InventoryItem[],
  emergency: EmergencyScenario
): InventoryItem[] {
  // Create a deep copy of the inventory to avoid modifying the original
  const adjustedInventory = JSON.parse(JSON.stringify(inventory)) as InventoryItem[];
  
  switch (emergency.type) {
    case 'power_outage':
      // Mark refrigerated items as expired if power outage duration exceeds 30 hours
      if ((emergency.duration || 0) >= 30) {
        return adjustedInventory.map(item => {
          if (item.requiresRefrigeration) {
            // Set quantity to 0 to simulate spoilage
            return { ...item, quantity: 0 };
          }
          return item;
        });
      }
      break;
      
    case 'flood':
      // If basement is flooded, items in basement are inaccessible except canned goods
      if (emergency.basementFlooded) {
        return adjustedInventory.map(item => {
          if (
            item.storageLocation.toLowerCase().includes('basement') && 
            !(item.category.includes('Canned') || item.name.toLowerCase().includes('can'))
          ) {
            // Set quantity to 0 to simulate inaccessibility
            return { ...item, quantity: 0 };
          }
          return item;
        });
      }
      break;
      
    case 'pandemic':
      // No direct inventory adjustments for pandemic
      // Could implement increased usage rates for medical supplies in a more complex model
      break;
  }
  
  return adjustedInventory;
}

export function getPreparednessStatusBgColor(status: string): string {
  switch (status) {
    case 'excellent': return 'bg-green-50 border-green-200';
    case 'good': return 'bg-green-50 border-green-200';
    case 'adequate': return 'bg-yellow-50 border-yellow-200';
    case 'poor': return 'bg-orange-50 border-orange-200';
    case 'critical': return 'bg-red-50 border-red-200';
    default: return 'bg-slate-50 border-slate-200';
  }
}