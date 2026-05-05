import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { ChargingCard } from '@/components/ChargingCard';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';

const ChargingStationsPage = () => {
  const { chargingStations } = useAppStore();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Charging Stations</h1>
          <p className="text-muted-foreground text-sm mt-1">Find nearby charging stations along your route</p>
        </motion.div>

        {chargingStations.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <span className="text-5xl block mb-4">🔌</span>
              <h2 className="font-display text-xl font-bold mb-2">No Stations Found</h2>
              <p className="text-muted-foreground text-sm mb-4">Predict a route to discover charging stations nearby.</p>
              <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard</Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chargingStations.map((station, i) => (
              <motion.div key={station.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ChargingCard station={station} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargingStationsPage;
