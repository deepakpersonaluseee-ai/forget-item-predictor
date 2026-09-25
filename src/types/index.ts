export type ItemCategory = 'work' | 'tech' | 'personal' | 'health' | 'weather' | 'fitness';

export interface ChecklistItem {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string;
  baseWeight: number; // 1 to 10 scale (Wi)
  weatherConditionMatch?: 'rain' | 'snow' | 'cold';
  calendarKeywordMatch?: string[];
  recurringDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  packed: boolean;
  isFlagged: boolean;
  score: number;
  flagReason: string;
  notes?: string;
  associatedBleTagId?: string;
}

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy';

export interface WeatherForecastDay {
  day: string;
  date: string;
  temp: number;
  condition: WeatherCondition;
  rainChance: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  category: 'work' | 'personal' | 'fitness';
}

export interface BleTag {
  id: string;
  name: string;
  type: 'AirTag' | 'Tile' | 'SmartTag';
  battery: number;
  connected: boolean;
  inProximity: boolean;
  associatedItemId?: string;
  lastRssi: number;
}

export interface GeofenceState {
  distanceFromHome: number; // meters
  perimeterThreshold: number; // meters (default: 3m)
  homeAddress: string;
  isLeavingHome: boolean;
}

export interface DayHistoryRecord {
  date: string;
  dayName: string;
  caughtCount: number;
  missedCount: number;
  flaggedItems: string[];
}

export type UserPlan = 'freemium' | 'pro' | 'enterprise';

export interface NotificationSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  browserPermissionGranted: boolean;
}
