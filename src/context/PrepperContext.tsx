import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { InventoryItem, HouseholdMember, HouseholdGroup, PrepperSettings, RationingScenario, UserPreferences, NotificationSettings, SecuritySettings, BatterySaverSettings, AllSettings } from '../types';
import { sampleInventory, sampleHousehold, sampleGroups, defaultSettings, defaultRationingScenarios, defaultUserPreferences, defaultNotificationSettings, defaultSecuritySettings, defaultBatterySaverSettings } from '../data/sampleData';

interface PrepperState {
  inventory: InventoryItem[];
  household: HouseholdMember[];
  householdGroups: HouseholdGroup[];
  settings: PrepperSettings;
  rationingScenarios: RationingScenario[];
  selectedRationingScenario: string;
  userPreferences: UserPreferences;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  batterySaverSettings: BatterySaverSettings;
}

type PrepperAction =
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'CLEAR_ALL_INVENTORY' }
  | { type: 'ADD_HOUSEHOLD_MEMBER'; payload: HouseholdMember }
  | { type: 'UPDATE_HOUSEHOLD_MEMBER'; payload: HouseholdMember }
  | { type: 'DELETE_HOUSEHOLD_MEMBER'; payload: string }
  | { type: 'CLEAR_ALL_HOUSEHOLD' }
  | { type: 'ADD_HOUSEHOLD_GROUP'; payload: HouseholdGroup }
  | { type: 'UPDATE_HOUSEHOLD_GROUP'; payload: HouseholdGroup }
  | { type: 'DELETE_HOUSEHOLD_GROUP'; payload: string }
  | { type: 'CLEAR_ALL_HOUSEHOLD_GROUPS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PrepperSettings> }
  | { type: 'SET_RATIONING_SCENARIO'; payload: string }
  | { type: 'ADD_RATIONING_SCENARIO'; payload: RationingScenario }
  | { type: 'UPDATE_RATIONING_SCENARIO'; payload: RationingScenario }
  | { type: 'DELETE_RATIONING_SCENARIO'; payload: string }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_NOTIFICATION_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_SECURITY_SETTINGS'; payload: Partial<SecuritySettings> }
  | { type: 'UPDATE_BATTERY_SAVER_SETTINGS'; payload: Partial<BatterySaverSettings> }
  | { type: 'ACTIVATE_EMERGENCY'; payload: EmergencyScenario }
  | { type: 'DEACTIVATE_EMERGENCY' }
  | { type: 'IMPORT_ALL_SETTINGS'; payload: AllSettings }
  | { type: 'ADD_REQUIRED_MEDICAL_ITEMS'; payload: { memberId: string; requiredSupplies: string[] } };

const initialState: PrepperState = {
  inventory: sampleInventory,
  household: sampleHousehold,
  householdGroups: sampleGroups,
  settings: defaultSettings,
  rationingScenarios: defaultRationingScenarios,
  selectedRationingScenario: 'normal',
  userPreferences: defaultUserPreferences,
  notificationSettings: defaultNotificationSettings,
  securitySettings: defaultSecuritySettings,
  batterySaverSettings: defaultBatterySaverSettings,
};

function prepperReducer(state: PrepperState, action: PrepperAction): PrepperState {
  switch (action.type) {
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
      };

    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => {
          // Prevent deletion of required medical items
          if (item.isMedicalRequired && item.requiredByMembers && item.requiredByMembers.length > 0) {
            return true; // Keep the item
          }
          return item.id !== action.payload;
        }),
      };

    case 'CLEAR_ALL_INVENTORY':
      return {
        ...state,
        inventory: [],
      };

    case 'ADD_HOUSEHOLD_MEMBER':
      return {
        ...state,
        household: [...state.household, action.payload],
      };

    case 'UPDATE_HOUSEHOLD_MEMBER':
      return {
        ...state,
        household: state.household.map(member =>
          member.id === action.payload.id ? action.payload : member
        ),
      };

    case 'DELETE_HOUSEHOLD_MEMBER':
      const memberToDelete = action.payload;
      // Update medical items when member is deleted
      const updatedInventoryAfterMemberDelete = state.inventory.map(item => {
        if (item.isMedicalRequired && item.requiredByMembers?.includes(memberToDelete)) {
          const updatedRequiredBy = item.requiredByMembers.filter(id => id !== memberToDelete);
          return {
            ...item,
            requiredByMembers: updatedRequiredBy,
            isMedicalRequired: updatedRequiredBy.length > 0,
          };
        }
        return item;
      });
      
      return {
        ...state,
        inventory: updatedInventoryAfterMemberDelete,
        household: state.household.filter(member => member.id !== action.payload),
        householdGroups: state.householdGroups.map(group => ({
          ...group,
          memberIds: group.memberIds.filter(id => id !== action.payload),
          leader: group.leader === action.payload ? undefined : group.leader,
        })),
      };

    case 'CLEAR_ALL_HOUSEHOLD':
      return {
        ...state,
        household: [],
        householdGroups: state.householdGroups.map(group => ({
          ...group,
          memberIds: [],
          leader: undefined,
        })),
      };

    case 'ADD_HOUSEHOLD_GROUP':
      return {
        ...state,
        householdGroups: [...state.householdGroups, action.payload],
      };

    case 'UPDATE_HOUSEHOLD_GROUP':
      return {
        ...state,
        householdGroups: state.householdGroups.map(group =>
          group.id === action.payload.id ? action.payload : group
        ),
      };

    case 'DELETE_HOUSEHOLD_GROUP':
      return {
        ...state,
        householdGroups: state.householdGroups.filter(group => group.id !== action.payload),
        household: state.household.map(member => ({
          ...member,
          groupId: member.groupId === action.payload ? undefined : member.groupId,
        })),
      };

    case 'CLEAR_ALL_HOUSEHOLD_GROUPS':
      return {
        ...state,
        householdGroups: [],
        household: state.household.map(member => ({
          ...member,
          groupId: undefined,
        })),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_RATIONING_SCENARIO':
      return {
        ...state,
        selectedRationingScenario: action.payload,
      };

    case 'ADD_RATIONING_SCENARIO':
      return {
        ...state,
        rationingScenarios: [...state.rationingScenarios, action.payload],
      };

    case 'UPDATE_RATIONING_SCENARIO':
      return {
        ...state,
        rationingScenarios: state.rationingScenarios.map(scenario =>
          scenario.id === action.payload.id ? action.payload : scenario
        ),
      };

    case 'DELETE_RATIONING_SCENARIO':
      return {
        ...state,
        rationingScenarios: state.rationingScenarios.filter(scenario => scenario.id !== action.payload),
        selectedRationingScenario: state.selectedRationingScenario === action.payload 
          ? 'normal' 
          : state.selectedRationingScenario,
      };

    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload },
      };

    case 'UPDATE_NOTIFICATION_SETTINGS':
      return {
        ...state,
        notificationSettings: { ...state.notificationSettings, ...action.payload },
      };

    case 'UPDATE_SECURITY_SETTINGS':
      return {
        ...state,
        securitySettings: { ...state.securitySettings, ...action.payload },
      };

    case 'UPDATE_BATTERY_SAVER_SETTINGS':
      return {
        ...state,
        batterySaverSettings: { ...state.batterySaverSettings, ...action.payload },
      };

    case 'ACTIVATE_EMERGENCY':
      return {
        ...state,
        emergencyScenario: action.payload,
      };

    case 'DEACTIVATE_EMERGENCY':
      return {
        ...state,
        emergencyScenario: null,
      };

    case 'IMPORT_ALL_SETTINGS':
      return {
        ...state,
        settings: action.payload.prepperSettings,
        userPreferences: action.payload.userPreferences,
        notificationSettings: action.payload.notificationSettings,
        securitySettings: action.payload.securitySettings,
        batterySaverSettings: action.payload.batterySaverSettings,
      };
    case 'ADD_REQUIRED_MEDICAL_ITEMS':
      const { memberId, requiredSupplies } = action.payload;
      const newMedicalItems: InventoryItem[] = [];
      const updatedInventoryForMedical = [...state.inventory];
      
      requiredSupplies.forEach((supply: string) => {
        // Check if item already exists
        const existingItemIndex = updatedInventoryForMedical.findIndex(item => 
          item.name.toLowerCase() === supply.toLowerCase() && item.category === 'Medical'
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const existingItem = updatedInventoryForMedical[existingItemIndex];
          updatedInventoryForMedical[existingItemIndex] = {
            ...existingItem,
            isMedicalRequired: true,
            requiredByMembers: [...(existingItem.requiredByMembers || []), memberId].filter((id, index, arr) => arr.indexOf(id) === index),
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        } else {
          // Create new item with 0 quantity (needs to be acquired)
          const newItem: InventoryItem = {
            id: `medical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: supply,
            category: 'Medical',
            quantity: 0,
            unit: 'unit',
            storageLocation: 'Medical Cabinet',
            usageRatePerPersonPerDay: 0.01,
            dateAdded: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0],
            notes: `Required for medical condition`,
            isMedicalRequired: true,
            requiredByMembers: [memberId],
          };
          newMedicalItems.push(newItem);
        }
      });
      
      return {
        ...state,
        inventory: [...updatedInventoryForMedical, ...newMedicalItems],
      };

    default:
      return state;
  }
}

const PrepperContext = createContext<{
  state: PrepperState;
  dispatch: React.Dispatch<PrepperAction>;
} | null>(null);

export function PrepperProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(prepperReducer, initialState);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = state.userPreferences;
      const root = document.documentElement;
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (state.userPreferences.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.userPreferences.theme]);

  // Apply display density to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    root.classList.add(`density-${state.userPreferences.density}`);
  }, [state.userPreferences.density]);

  // Apply animations preference
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('no-animations', !state.userPreferences.animations);
  }, [state.userPreferences.animations]);

  return (
    <PrepperContext.Provider value={{ state, dispatch }}>
      {children}
    </PrepperContext.Provider>
  );
}

export function usePrepper() {
  const context = useContext(PrepperContext);
  if (!context) {
    throw new Error('usePrepper must be used within a PrepperProvider');
  }
  return context;
}