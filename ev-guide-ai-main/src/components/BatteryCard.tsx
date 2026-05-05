import { motion } from 'framer-motion';

interface BatteryCardProps {
  percentage: number;
  consumption?: number;
  remaining?: number;
  isReachable?: boolean;
}

export const BatteryCard = ({ percentage, consumption, remaining, isReachable }: BatteryCardProps) => {
  const getBatteryColor = (pct: number) => {
    if (pct > 60) return 'bg-primary';
    if (pct > 30) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm">Battery Status</h3>
        {isReachable !== undefined && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isReachable ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
          }`}>
            {isReachable ? '✓ Reachable' : '✗ Not Reachable'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-20 h-36">
          <div className="absolute inset-0 rounded-xl border-2 border-border overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`absolute bottom-0 left-0 right-0 ${getBatteryColor(percentage)} rounded-b-lg`}
            />
          </div>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 rounded-t-md bg-border" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-3xl font-display font-bold">{percentage}%</p>
            <p className="text-xs text-muted-foreground">Current Charge</p>
          </div>
          {consumption !== undefined && (
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-semibold text-destructive">-{consumption}%</p>
                <p className="text-xs text-muted-foreground">Consumption</p>
              </div>
              {remaining !== undefined && (
                <div>
                  <p className="text-sm font-semibold text-primary">{remaining}%</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
