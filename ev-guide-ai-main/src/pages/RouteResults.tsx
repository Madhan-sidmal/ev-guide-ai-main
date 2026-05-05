import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { BatteryCard } from '@/components/BatteryCard';
import { WeatherCard } from '@/components/WeatherCard';
import { ChargingCard } from '@/components/ChargingCard';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';

const RouteResults = () => {
  const { currentRoute, alternateRoutes, weather, chargingStations, batteryPercentage } = useAppStore();

  if (!currentRoute) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="text-5xl block mb-4">🗺️</span>
            <h2 className="font-display text-xl font-bold mb-2">No Route Predicted</h2>
            <p className="text-muted-foreground text-sm mb-4">Go to the dashboard to plan a trip first.</p>
            <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Route Results</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {currentRoute.source.address} → {currentRoute.destination.address}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Route Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
              <h3 className="font-display font-semibold mb-4">Route Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Distance', value: `${currentRoute.distance} km`, icon: '📏' },
                  { label: 'Travel Time', value: `${Math.floor(currentRoute.duration / 60)}h ${currentRoute.duration % 60}m`, icon: '⏱️' },
                  { label: 'Battery Used', value: `${currentRoute.batteryConsumption}%`, icon: '🔋' },
                  { label: 'Remaining', value: `${currentRoute.remainingBattery}%`, icon: '⚡' },
                  { label: 'Efficiency', value: `${currentRoute.efficiency}%`, icon: '📊' },
                  { label: 'Weather Impact', value: `-${currentRoute.weatherImpact}%`, icon: '🌦️' },
                ].map((item) => (
                  <div key={item.label} className="bg-muted rounded-xl p-4">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-muted-foreground mt-2">{item.label}</p>
                    <p className="text-lg font-display font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Alternate Routes */}
            {alternateRoutes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="card-elevated p-6"
              >
                <h3 className="font-display font-semibold mb-4">Alternative Routes</h3>
                <div className="space-y-3">
                  {alternateRoutes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                      <div>
                        <p className="font-semibold text-sm">{route.label}</p>
                        <p className="text-xs text-muted-foreground">{route.distance} km · {Math.floor(route.duration / 60)}h {route.duration % 60}m</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${route.isReachable ? 'text-primary' : 'text-destructive'}`}>
                          {route.batteryConsumption}% used
                        </p>
                        <p className="text-xs text-muted-foreground">{route.isReachable ? 'Reachable' : 'Needs charging'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Charging Stations */}
            {chargingStations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="card-elevated p-6"
              >
                <h3 className="font-display font-semibold mb-4">Charging Stations Along Route</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {chargingStations.slice(0, 4).map((station) => (
                    <ChargingCard key={station.id} station={station} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <BatteryCard
              percentage={currentRoute.remainingBattery}
              consumption={currentRoute.batteryConsumption}
              remaining={currentRoute.remainingBattery}
              isReachable={currentRoute.isReachable}
            />
            <WeatherCard weather={weather} />
            <div className="flex flex-col gap-3">
              <Link to="/map" className="btn-primary text-center text-sm">View on Map</Link>
              <Link to="/analytics" className="btn-secondary text-center text-sm">View Analytics</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteResults;
