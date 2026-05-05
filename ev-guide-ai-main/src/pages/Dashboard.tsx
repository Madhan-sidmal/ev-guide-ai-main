import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { RouteForm } from '@/components/RouteForm';
import { BatteryCard } from '@/components/BatteryCard';
import { WeatherCard } from '@/components/WeatherCard';
import { useAppStore } from '@/store/appStore';
import { calculateRoute, generateChargingStations } from '@/services/routing';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EVSimulation = lazy(() => import('@/components/threeD/EVSimulation'));

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

  const handlePredict = async () => {
    if (!source || !destination || !selectedEVModel) {
      toast({ title: 'Missing Info', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const route = await calculateRoute(source, destination, selectedEVModel, batteryPercentage);
      const stations = generateChargingStations(route.geometry, route.distance);

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
        batteryImpact: route.weatherImpact,
      };

      setCurrentRoute(route);
      setChargingStations(stations);
      setWeather(weatherData);
      setAnalytics({
        drainOverDistance: Array.from({ length: 10 }, (_, i) => ({
          distance: Math.round((route.distance / 10) * (i + 1)),
          battery: Math.round(batteryPercentage - (route.batteryConsumption / 10) * (i + 1)),
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
        distance: route.distance,
        batteryUsed: route.batteryConsumption,
        evModel: selectedEVModel.name,
        weather: condition,
        carbonSaved: route.distance * 0.12,
      });

      toast({
        title: '✅ Route Calculated',
        description: `${route.distance} km · ${route.isReachable ? 'Reachable' : 'Charging needed'} · ${Math.floor(route.duration / 60)}h ${route.duration % 60}m`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate route';
      setError(message);
      toast({ title: 'Route Calculation Failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

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
                percentage={currentRoute ? currentRoute.remainingBattery : batteryPercentage}
                consumption={currentRoute?.batteryConsumption}
                remaining={currentRoute?.remainingBattery}
                isReachable={currentRoute?.isReachable}
              />
              <WeatherCard weather={weather} />
            </div>

            {currentRoute && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="card-elevated p-6"
              >
                <h3 className="font-display font-semibold mb-4">Route Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Distance', value: `${currentRoute.distance} km` },
                    { label: 'Duration', value: `${Math.floor(currentRoute.duration / 60)}h ${currentRoute.duration % 60}m` },
                    { label: 'Battery Used', value: `${currentRoute.batteryConsumption}%` },
                    { label: 'Remaining', value: `${currentRoute.remainingBattery}%` },
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
