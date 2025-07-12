export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  expirationDate?: string;
  storageLocation: string;
  caloriesPerUnit?: number;
  usageRatePerPersonPerDay: number;
  cost?: number;
  notes?: string;
  dateAdded: string;
  lastUpdated: string;
  isMedicalRequired?: boolean; // Indicates if this item is required for a household member's medical condition
  requiredByMembers?: string[]; // Array of member IDs who require this medical item
  requiresRefrigeration?: boolean; // Indicates if this item requires refrigeration
}

export interface HouseholdMember {
  id: string;
  name: string;
  age: number;
  activityLevel: ActivityLevel;
  specialNeeds?: string[];
  dailyCalories: number;
  dailyWaterLiters: number;
  groupId?: string;
  medicalConditions?: string[];
  dietaryRestrictions?: string[];
  emergencyContact?: string;
  skills?: string[];
  responsibilities?: string[];
}

export interface HouseholdGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  memberIds: string[];
  groupType: 'family' | 'team' | 'skill' | 'location' | 'custom';
  leader?: string; // member ID
  createdDate: string;
}

export interface RationingScenario {
  id: string;
  name: string;
  reductionPercentage: number;
  description: string;
}

export interface EmergencyScenario {
  type: 'power_outage' | 'flood' | 'pandemic';
  active: boolean;
  startDate: string;
  duration?: number; // in hours for power outage
  basementFlooded?: boolean; // for flood scenario
  tips: string[];
}

export interface SustainabilityMetrics {
  normalUsageDays: number;
  rationedUsageDays: Record<string, number>;
  dailyCaloriesPerPerson: Record<string, number>;
  warningFlags: WarningFlag[];
}

export interface WarningFlag {
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  daysRemaining?: number;
}

export interface ConsumptionPattern {
  itemId: string;
  date: string;
  quantityUsed: number;
  actualVsPredicted: number;
}

export type ItemCategory = 
  | 'Food - Grains'
  | 'Food - Proteins'
  | 'Food - Vegetables'
  | 'Food - Fruits'
  | 'Food - Dairy'
  | 'Food - Canned'
  | 'Water'
  | 'Medical'
  | 'Tools'
  | 'Shelter'
  | 'Energy'
  | 'Communication'
  | 'Clothing'
  | 'Hygiene'
  | 'Security';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type ClimateZone = 'temperate' | 'hot_dry' | 'hot_humid' | 'cold';

export interface PrepperSettings {
  climateZone: ClimateZone;
  preparednessGoalDays: number;
  minimumCaloriesPerDay: number;
  waterSafetyMargin: number;
}

// User Preferences Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type DisplayDensity = 'compact' | 'comfortable' | 'spacious';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY';
export type TimeFormat = '12h' | '24h';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';
export type Units = 'imperial' | 'metric';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export interface UserPreferences {
  theme: ThemeMode;
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  currency: Currency;
  units: Units;
  density: DisplayDensity;
  animations: boolean;
  sounds: boolean;
  autoSave: boolean;
}

export interface NotificationSettings {
  enableNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailProvider?: 'none' | 'sendgrid' | 'mailgun' | 'twilio' | 'pushbullet' | 'smtp';
  emailConfig?: {
    service?: string;
    apiKey?: string;
    domain?: string;
    fromEmail?: string;
    fromName?: string;
    toEmail?: string;
    accountSid?: string;
    authToken?: string;
    fromPhone?: string;
    toPhone?: string;
    accessToken?: string;
    host?: string;
    port?: string;
    username?: string;
    password?: string;
  };
  soundAlerts: boolean;
  expirationAlerts: boolean;
  expirationDays: number[];
  emailExpirationAlerts?: boolean;
  weeklyExpirationDigest?: boolean;
  lowStockAlerts: boolean;
  lowStockThreshold: number;
  householdChanges: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
  enableQuietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface SecuritySettings {
  requirePinCode: boolean;
  pinCode?: string;
  autoLock: boolean;
  autoLockTime: number;
  sessionTimeout: number;
  bruteForceProtection: boolean;
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  lastFailedAttempt?: number;
  failedAttempts: number;
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  isLocked: boolean;
  lockoutUntil?: number;
  failedAttempts: number;
  lastAttempt?: number;
}

export interface BatterySaverSettings {
  enabled: boolean;
  autoEnable: boolean;
  autoEnableThreshold: number;
  reducedAnimations: boolean;
  reducedPolling: boolean;
  reducedRendering: boolean;
  simplifiedUI: boolean;
  darkMode: boolean;
}

export interface AllSettings {
  prepperSettings: PrepperSettings;
  emergencyScenario: EmergencyScenario | null;
  userPreferences: UserPreferences;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  batterySaverSettings: BatterySaverSettings;
}