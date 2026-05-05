import type { Location, RouteData, EVModel, ChargingStation } from '@/types';

const OSRM_BASE = 'https://router.project-osrm.org';

interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: { coordinates: [number, number][] };
}

export const calculateRoute = async (
  source: Location,
  destination: Location,
  evModel: EVModel,
  batteryPercentage: number
): Promise<RouteData> => {
  const res = await fetch(
    `${OSRM_BASE}/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
  );

  if (!res.ok) throw new Error('Failed to calculate route');
  const data = await res.json();

  if (!data.routes?.length) throw new Error('No route found');

  const osrmRoute: OSRMRoute = data.routes[0];
  const distanceKm = osrmRoute.distance / 1000;
  const durationMin = Math.round(osrmRoute.duration / 60);

  // Convert GeoJSON [lng,lat] to [lat,lng] for Leaflet
  const geometry: [number, number][] = osrmRoute.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );

  // Battery prediction based on EV model efficiency
  const energyNeeded = distanceKm * evModel.efficiency; // kWh
  const batteryUsedPercent = (energyNeeded / evModel.batteryCapacity) * 100;

  // Weather impact simulation (random 2-8% for realism)
  const weatherImpact = Math.round(2 + Math.random() * 6);
  const totalConsumption = Math.min(batteryUsedPercent * (1 + weatherImpact / 100), 100);
  const remainingBattery = Math.max(batteryPercentage - totalConsumption, 0);
  const isReachable = remainingBattery > 5;
  const efficiency = Math.round(Math.max(100 - totalConsumption / batteryPercentage * 30, 40));

  return {
    id: Date.now().toString(),
    source,
    destination,
    distance: Math.round(distanceKm * 10) / 10,
    duration: durationMin,
    geometry,
    batteryConsumption: Math.round(totalConsumption * 10) / 10,
    remainingBattery: Math.round(remainingBattery * 10) / 10,
    efficiency,
    weatherImpact,
    isReachable,
  };
};

// Generate simulated charging stations along the route
export const generateChargingStations = (geometry: [number, number][], distance: number): ChargingStation[] => {
  const stations: ChargingStation[] = [];
  const numStations = Math.max(2, Math.floor(distance / 80));
  const providers = ['Tata Power', 'Ather Grid', 'ChargeZone', 'Statiq', 'Fortum'];
  const connectors = ['CCS2', 'CHAdeMO', 'Type 2', 'GB/T'];

  for (let i = 0; i < numStations; i++) {
    const idx = Math.floor((geometry.length / (numStations + 1)) * (i + 1));
    const point = geometry[Math.min(idx, geometry.length - 1)];
    // Offset slightly for realism
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
