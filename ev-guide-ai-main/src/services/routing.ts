import type { Location, RouteData, AlternateRoute, EVModel, ChargingStation } from '@/types';

const OSRM_BASE = 'https://router.project-osrm.org';

interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: { coordinates: [number, number][] };
}

/* ── Battery Prediction ─────────────────────────────────────── */
const predictBattery = (
  distanceKm: number,
  evModel: EVModel,
  batteryPercentage: number,
  weatherImpact: number
) => {
  const energyNeeded = distanceKm * evModel.efficiency; // kWh
  const batteryUsedPercent = (energyNeeded / evModel.batteryCapacity) * 100;
  const totalConsumption = Math.min(batteryUsedPercent * (1 + weatherImpact / 100), 100);
  const remainingBattery = Math.max(batteryPercentage - totalConsumption, 0);
  const isReachable = remainingBattery > 5;
  const efficiency = Math.round(Math.max(100 - totalConsumption / batteryPercentage * 30, 40));

  return { totalConsumption, remainingBattery, isReachable, efficiency };
};

/* ── Parse OSRM route into RouteData ────────────────────────── */
const parseRoute = (
  osrm: OSRMRoute,
  source: Location,
  destination: Location,
  evModel: EVModel,
  batteryPercentage: number,
  id: string
): RouteData => {
  const distanceKm = Math.round((osrm.distance / 1000) * 10) / 10;
  const durationMin = Math.round(osrm.duration / 60);
  const geometry: [number, number][] = osrm.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );
  const weatherImpact = Math.round(2 + Math.random() * 6);
  const battery = predictBattery(distanceKm, evModel, batteryPercentage, weatherImpact);

  return {
    id,
    source,
    destination,
    distance: distanceKm,
    duration: durationMin,
    geometry,
    batteryConsumption: Math.round(battery.totalConsumption * 10) / 10,
    remainingBattery: Math.round(battery.remainingBattery * 10) / 10,
    efficiency: battery.efficiency,
    weatherImpact,
    isReachable: battery.isReachable,
  };
};

/* ── Multi-Route Calculation ────────────────────────────────── */
export const calculateMultiRoute = async (
  source: Location,
  destination: Location,
  evModel: EVModel,
  batteryPercentage: number
): Promise<{ primary: RouteData; alternates: AlternateRoute[] }> => {
  const res = await fetch(
    `${OSRM_BASE}/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true&alternatives=3`
  );

  if (!res.ok) throw new Error('Failed to calculate route');
  const data = await res.json();

  if (!data.routes?.length) throw new Error('No route found');

  const labels = ['Fastest Route', 'Eco Route', 'Scenic Route'];
  const tagEmojis = ['🏎️', '🌿', '🏞️'];

  const primary = parseRoute(data.routes[0], source, destination, evModel, batteryPercentage, `route-0`);

  const alternates: AlternateRoute[] = data.routes.slice(1, 4).map((r: OSRMRoute, i: number) => ({
    ...parseRoute(r, source, destination, evModel, batteryPercentage, `route-${i + 1}`),
    label: `${tagEmojis[i]} ${labels[i + 1] || `Alt Route ${i + 1}`}`,
  }));

  return { primary, alternates };
};

/* ── Single route (backwards-compatible) ────────────────────── */
export const calculateRoute = async (
  source: Location,
  destination: Location,
  evModel: EVModel,
  batteryPercentage: number
): Promise<RouteData> => {
  const { primary } = await calculateMultiRoute(source, destination, evModel, batteryPercentage);
  return primary;
};

/* ── Charging Stations along a route ────────────────────────── */
export const generateChargingStations = (geometry: [number, number][], distance: number): ChargingStation[] => {
  const stations: ChargingStation[] = [];
  const numStations = Math.max(2, Math.floor(distance / 80));
  const providers = ['Tata Power', 'Ather Grid', 'ChargeZone', 'Statiq', 'Fortum'];
  const connectors = ['CCS2', 'CHAdeMO', 'Type 2', 'GB/T'];

  for (let i = 0; i < numStations; i++) {
    const idx = Math.floor((geometry.length / (numStations + 1)) * (i + 1));
    const point = geometry[Math.min(idx, geometry.length - 1)];
    const lat = point[0] + (Math.random() - 0.5) * 0.02;
    const lng = point[1] + (Math.random() - 0.5) * 0.02;

    stations.push({
      id: `cs-${i}`,
      name: `${providers[i % providers.length]} - Station ${i + 1}`,
      location: { lat, lng, address: '' },
      distance: Math.round((distance / (numStations + 1)) * (i + 1)),
      available: Math.random() > 0.25,
      connectorType: connectors[i % connectors.length],
      power: [25, 50, 60, 120, 150][Math.floor(Math.random() * 5)],
      provider: providers[i % providers.length],
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    });
  }
  return stations;
};
