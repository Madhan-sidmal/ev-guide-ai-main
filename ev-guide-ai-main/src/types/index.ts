export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface EVModel {
  id: string;
  name: string;
  manufacturer: string;
  batteryCapacity: number; // kWh
  range: number; // km
  efficiency: number; // kWh/km
}

export interface RouteData {
  id: string;
  source: Location;
  destination: Location;
  distance: number; // km
  duration: number; // minutes
  geometry: [number, number][];
  batteryConsumption: number; // percentage
  remainingBattery: number; // percentage
  efficiency: number; // percentage
  weatherImpact: number; // percentage
  isReachable: boolean;
}

export interface AlternateRoute extends RouteData {
  label: string;
}

export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  icon: string;
  description: string;
  batteryImpact: number;
}

export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'fog' | 'cloudy' | 'thunderstorm';

export interface ChargingStation {
  id: string;
  name: string;
  location: Location;
  distance: number; // km from route
  available: boolean;
  connectorType: string;
  power: number; // kW
  provider: string;
  rating: number;
}

export interface TripHistory {
  id: string;
  date: string;
  source: Location;
  destination: Location;
  distance: number;
  batteryUsed: number;
  evModel: string;
  weather: WeatherCondition;
  carbonSaved: number;
}

export interface BatteryAnalytics {
  drainOverDistance: { distance: number; battery: number }[];
  weatherImpact: { condition: string; impact: number }[];
  historicalUsage: { date: string; usage: number }[];
  healthScore: number;
}

export interface PredictionRequest {
  source: Location;
  destination: Location;
  batteryPercentage: number;
  evModelId: string;
}

export interface PredictionResponse {
  route: RouteData;
  alternateRoutes: AlternateRoute[];
  weather: WeatherData;
  chargingStations: ChargingStation[];
  analytics: BatteryAnalytics;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  savedVehicles: EVModel[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    chargingAlerts: boolean;
  };
}
