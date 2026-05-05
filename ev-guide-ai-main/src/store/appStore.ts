import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Location, EVModel, RouteData, AlternateRoute,
  WeatherData, ChargingStation, TripHistory,
  BatteryAnalytics, UserProfile,
} from '@/types';

interface AppState {
  // Trip planning
  source: Location | null;
  destination: Location | null;
  batteryPercentage: number;
  selectedEVModel: EVModel | null;
  evModels: EVModel[];

  // Results
  currentRoute: RouteData | null;
  alternateRoutes: AlternateRoute[];
  weather: WeatherData | null;
  chargingStations: ChargingStation[];
  analytics: BatteryAnalytics | null;

  // History
  tripHistory: TripHistory[];

  // User
  user: UserProfile | null;
  isAuthenticated: boolean;

  // UI
  isLoading: boolean;
  error: string | null;
  simulationProgress: number;

  // Actions
  setSource: (source: Location | null) => void;
  setDestination: (destination: Location | null) => void;
  setBatteryPercentage: (pct: number) => void;
  setSelectedEVModel: (model: EVModel | null) => void;
  setEVModels: (models: EVModel[]) => void;
  setCurrentRoute: (route: RouteData | null) => void;
  setAlternateRoutes: (routes: AlternateRoute[]) => void;
  setWeather: (weather: WeatherData | null) => void;
  setChargingStations: (stations: ChargingStation[]) => void;
  setAnalytics: (analytics: BatteryAnalytics | null) => void;
  addTripToHistory: (trip: TripHistory) => void;
  setUser: (user: UserProfile | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSimulationProgress: (progress: number) => void;
  resetTrip: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      source: null,
      destination: null,
      batteryPercentage: 80,
      selectedEVModel: null,
      evModels: [],
      currentRoute: null,
      alternateRoutes: [],
      weather: null,
      chargingStations: [],
      analytics: null,
      tripHistory: [],
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      simulationProgress: 0,

      setSource: (source) => set({ source }),
      setDestination: (destination) => set({ destination }),
      setBatteryPercentage: (batteryPercentage) => set({ batteryPercentage }),
      setSelectedEVModel: (selectedEVModel) => set({ selectedEVModel }),
      setEVModels: (evModels) => set({ evModels }),
      setCurrentRoute: (currentRoute) => set({ currentRoute }),
      setAlternateRoutes: (alternateRoutes) => set({ alternateRoutes }),
      setWeather: (weather) => set({ weather }),
      setChargingStations: (chargingStations) => set({ chargingStations }),
      setAnalytics: (analytics) => set({ analytics }),
      addTripToHistory: (trip) =>
        set((state) => ({ tripHistory: [trip, ...state.tripHistory] })),
      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSimulationProgress: (simulationProgress) => set({ simulationProgress }),
      resetTrip: () =>
        set({
          currentRoute: null,
          alternateRoutes: [],
          weather: null,
          chargingStations: [],
          analytics: null,
          simulationProgress: 0,
        }),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          isAuthenticated: false,
          tripHistory: [],
          currentRoute: null,
          alternateRoutes: [],
          weather: null,
          chargingStations: [],
          analytics: null,
          selectedEVModel: null,
          evModels: [],
          simulationProgress: 0,
        });
      },
    }),
    {
      name: 'ev-range-predictor',
      partialize: (state) => ({
        tripHistory: state.tripHistory,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        batteryPercentage: state.batteryPercentage,
      }),
    }
  )
);
