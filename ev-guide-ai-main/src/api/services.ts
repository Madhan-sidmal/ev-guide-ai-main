import axios from 'axios';
import type {
  Location, PredictionRequest, PredictionResponse,
  RouteData, WeatherData, ChargingStation, EVModel,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Route Service (OpenRouteService)
export const routeService = {
  getRoute: async (source: Location, destination: Location): Promise<RouteData> => {
    const res = await api.post('/routes/calculate', { source, destination });
    return res.data;
  },
  getAlternateRoutes: async (source: Location, destination: Location) => {
    const res = await api.post('/routes/alternatives', { source, destination });
    return res.data;
  },
  optimizeRoute: async (routeId: string) => {
    const res = await api.post(`/routes/${routeId}/optimize`);
    return res.data;
  },
};

// Weather Service (OpenWeather)
export const weatherService = {
  getWeather: async (lat: number, lng: number): Promise<WeatherData> => {
    const res = await api.get('/weather', { params: { lat, lng } });
    return res.data;
  },
  getRouteWeather: async (routeId: string) => {
    const res = await api.get(`/weather/route/${routeId}`);
    return res.data;
  },
};

// Charging Station Service (Open Charge Map)
export const chargingService = {
  getNearbyStations: async (lat: number, lng: number, radius: number = 50): Promise<ChargingStation[]> => {
    const res = await api.get('/charging-stations', { params: { lat, lng, radius } });
    return res.data;
  },
  getStationsAlongRoute: async (routeId: string): Promise<ChargingStation[]> => {
    const res = await api.get(`/charging-stations/route/${routeId}`);
    return res.data;
  },
};

// ML Prediction Service
export const predictionService = {
  predictRange: async (req: PredictionRequest): Promise<PredictionResponse> => {
    const res = await api.post('/predict-range', req);
    return res.data;
  },
};

// EV Models
export const evModelService = {
  getModels: async (): Promise<EVModel[]> => {
    const res = await api.get('/ev-models');
    return res.data;
  },
};

// Auth
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  signup: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/signup', { name, email, password });
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

// Trip History
export const tripService = {
  getHistory: async () => {
    const res = await api.get('/trips/history');
    return res.data;
  },
  saveTrip: async (trip: unknown) => {
    const res = await api.post('/trips', trip);
    return res.data;
  },
};

export default api;
