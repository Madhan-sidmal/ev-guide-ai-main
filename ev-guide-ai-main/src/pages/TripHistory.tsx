import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';

const TripHistory = () => {
  const { tripHistory } = useAppStore();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Trip History</h1>
          <p className="text-muted-foreground text-sm mt-1">Your previous trips and saved routes</p>
        </motion.div>

        {tripHistory.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <span className="text-5xl block mb-4">📋</span>
              <h2 className="font-display text-xl font-bold mb-2">No Trips Yet</h2>
              <p className="text-muted-foreground text-sm mb-4">Your trip history will appear here after planning routes.</p>
              <Link to="/dashboard" className="btn-primary text-sm">Plan Your First Trip</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tripHistory.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-elevated p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{trip.source.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <span className="text-sm font-medium">{trip.destination.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold">{trip.distance} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Battery Used</p>
                      <p className="font-semibold text-destructive">{trip.batteryUsed}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                      <p className="font-semibold text-primary">{trip.carbonSaved.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold">{new Date(trip.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
