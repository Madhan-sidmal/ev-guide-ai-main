import { motion } from 'framer-motion';
import type { ChargingStation } from '@/types';

interface ChargingCardProps {
  station: ChargingStation;
  onSelect?: (station: ChargingStation) => void;
}

export const ChargingCard = ({ station, onSelect }: ChargingCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    onClick={() => onSelect?.(station)}
    className="card-elevated p-4 cursor-pointer hover:border-primary/30 transition-colors"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{station.name}</h4>
        <p className="text-xs text-muted-foreground">{station.provider}</p>
      </div>
      <span className={`w-2.5 h-2.5 rounded-full mt-1 ${station.available ? 'bg-primary' : 'bg-destructive'}`} />
    </div>
    <div className="grid grid-cols-3 gap-2 mt-3">
      <div>
        <p className="text-xs text-muted-foreground">Distance</p>
        <p className="text-sm font-semibold">{station.distance} km</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Power</p>
        <p className="text-sm font-semibold">{station.power} kW</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Type</p>
        <p className="text-sm font-semibold">{station.connectorType}</p>
      </div>
    </div>
    <div className="flex items-center gap-1 mt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < station.rating ? 'text-yellow-400' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  </motion.div>
);
