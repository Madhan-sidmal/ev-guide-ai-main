import { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { RouteForm } from '@/components/RouteForm';
import { BatteryCard } from '@/components/BatteryCard';
import { WeatherCard } from '@/components/WeatherCard';
import { useAppStore } from '@/store/appStore';
import { calculateMultiRoute, generateChargingStations } from '@/services/routing';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { RouteData, AlternateRoute, ChargingStation } from '@/types';

const EVSimulation = lazy(() => import('@/components/threeD/EVSimulation'));

interface RouteWithStations {
  route: RouteData | AlternateRoute;
  stations: ChargingStation[];
  label: string;
}

const Dashboard = () => {
  const {
    source, destination, batteryPercentage, selectedEVModel,
    currentRoute, weather,
    setCurrentRoute, setAlternateRoutes, setWeather,
    setChargingStations, setAnalytics,
    setIsLoading, setError, isLoading,
    addTripToHistory,
  } = useAppStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [allRoutes, setAllRoutes] = useState<RouteWithStations[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handlePredict = async () => {
    if (!source || !destination || !selectedEVModel) {
      toast({ title: 'Missing Info', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { primary, alternates } = await calculateMultiRoute(source, destination, selectedEVModel, batteryPercentage);

      // Generate charging stations for each route
      const routes: RouteWithStations[] = [
        { route: primary, stations: generateChargingStations(primary.geometry, primary.distance), label: '🏎️ Fastest Route' },
        ...alternates.map((alt) => ({
          route: alt,
          stations: generateChargingStations(alt.geometry, alt.distance),
          label: alt.label,
        })),
      ];

      setAllRoutes(routes);
      setSelectedIdx(0);

      // Set primary as active
      setCurrentRoute(primary);
      setAlternateRoutes(alternates);
      setChargingStations(routes[0].stations);

      // Simulated weather
      const conditions = ['clear', 'cloudy', 'rain'] as const;
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const weatherData = {
        temperature: Math.round(20 + Math.random() * 15),
        condition,
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 20),
        icon: condition === 'clear' ? '☀️' : condition === 'cloudy' ? '☁️' : '🌧️',
        description: condition === 'clear' ? 'Clear sky' : condition === 'cloudy' ? 'Partly cloudy' : 'Light rain',
        batteryImpact: primary.weatherImpact,
      };
      setWeather(weatherData);

      setAnalytics({
        drainOverDistance: Array.from({ length: 10 }, (_, i) => ({
          distance: Math.round((primary.distance / 10) * (i + 1)),
          battery: Math.round(batteryPercentage - (primary.batteryConsumption / 10) * (i + 1)),
        })),
        weatherImpact: [
          { condition: 'Clear', impact: 0 },
          { condition: 'Rain', impact: -5 },
          { condition: 'Snow', impact: -12 },
          { condition: 'Hot (>35°C)', impact: -8 },
        ],
        historicalUsage: [],
        healthScore: 92,
      });

      addTripToHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        source,
        destination,
        distance: primary.distance,
        batteryUsed: primary.batteryConsumption,
        evModel: selectedEVModel.name,
        weather: condition,
        carbonSaved: primary.distance * 0.12,
      });

      toast({
        title: `✅ ${routes.length} Route${routes.length > 1 ? 's' : ''} Found`,
        description: `Best: ${primary.distance} km · ${primary.isReachable ? 'Reachable' : 'Charging needed'} · ${Math.floor(primary.duration / 60)}h ${primary.duration % 60}m`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate route';
      setError(message);
      toast({ title: 'Route Calculation Failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectRoute = (idx: number) => {
    setSelectedIdx(idx);
    const selected = allRoutes[idx];
    setCurrentRoute(selected.route);
    setChargingStations(selected.stations);

    // Update analytics for the selected route
    setAnalytics({
      drainOverDistance: Array.from({ length: 10 }, (_, i) => ({
        distance: Math.round((selected.route.distance / 10) * (i + 1)),
        battery: Math.round(batteryPercentage - (selected.route.batteryConsumption / 10) * (i + 1)),
      })),
      weatherImpact: [
        { condition: 'Clear', impact: 0 },
        { condition: 'Rain', impact: -5 },
        { condition: 'Snow', impact: -12 },
        { condition: 'Hot (>35°C)', impact: -8 },
      ],
      historicalUsage: [],
      healthScore: 92,
    });
  };

  const activeRoute = allRoutes[selectedIdx]?.route || currentRoute;
  const activeStations = allRoutes[selectedIdx]?.stations || [];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan your EV trip with AI-powered predictions</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <RouteForm onPredict={handlePredict} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card-elevated overflow-hidden" style={{ height: '360px' }}
            >
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading 3D simulation...</p>
                  </div>
                </div>
              }>
                <EVSimulation />
              </Suspense>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              <BatteryCard
                percentage={activeRoute ? activeRoute.remainingBattery : batteryPercentage}
                consumption={activeRoute?.batteryConsumption}
                remaining={activeRoute?.remainingBattery}
                isReachable={activeRoute?.isReachable}
              />
              <WeatherCard weather={weather} />
            </div>

            {/* ── Multi-Route Comparison ────────────────── */}
            <AnimatePresence>
              {allRoutes.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="card-elevated p-6"
                >
                  <h3 className="font-display font-semibold mb-4">
                    Route Comparison
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      {allRoutes.length} routes found — click to compare
                    </span>
                  </h3>
                  <div className="grid gap-3">
                    {allRoutes.map((r, i) => (
                      <button key={r.route.id} onClick={() => selectRoute(i)}
                        className={`text-left rounded-xl p-4 transition-all border-2 ${
                          selectedIdx === i
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted hover:border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{r.label}</span>
                          <div className="flex items-center gap-2">
                            {selectedIdx === i && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                Selected
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              r.route.isReachable
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {r.route.isReachable ? '✅ Reachable' : '⚠️ Needs charging'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="text-sm font-bold">{r.route.distance} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-bold">{Math.floor(r.route.duration / 60)}h {r.route.duration % 60}m</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Battery Used</p>
                            <p className="text-sm font-bold">{r.route.batteryConsumption}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">⚡ Stations</p>
                            <p className="text-sm font-bold">{r.stations.length} ({r.stations.filter(s => s.available).length} free)</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Route Summary ─────────────────────────── */}
            {activeRoute && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="card-elevated p-6"
              >
                <h3 className="font-display font-semibold mb-4">
                  Route Summary
                  {allRoutes.length > 1 && (
                    <span className="text-xs font-normal text-primary ml-2">
                      {allRoutes[selectedIdx]?.label}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Distance', value: `${activeRoute.distance} km` },
                    { label: 'Duration', value: `${Math.floor(activeRoute.duration / 60)}h ${activeRoute.duration % 60}m` },
                    { label: 'Battery Used', value: `${activeRoute.batteryConsumption}%` },
                    { label: 'Remaining', value: `${activeRoute.remainingBattery}%` },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-display font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => navigate('/map')} className="btn-primary text-sm flex-1">
                    View on Map
                  </button>
                  <button onClick={() => navigate('/results')} className="btn-secondary text-sm flex-1">
                    Detailed Results
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Charging Stations Along Route ────────── */}
            <AnimatePresence>
              {activeStations.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="card-elevated p-6"
                >
                  <h3 className="font-display font-semibold mb-1">
                    ⚡ Charging Stations Along Route
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {activeStations.filter(s => s.available).length} of {activeStations.length} stations available
                  </p>
                  <div className="space-y-3">
                    {activeStations.map((station, i) => (
                      <motion.div key={station.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 bg-muted rounded-xl p-3"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          station.available ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className="text-lg">{station.available ? '⚡' : '🔴'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{station.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {station.connectorType} · {station.power} kW · {station.distance} km from start
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            station.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {station.available ? 'Available' : 'Occupied'}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">⭐ {station.rating}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
