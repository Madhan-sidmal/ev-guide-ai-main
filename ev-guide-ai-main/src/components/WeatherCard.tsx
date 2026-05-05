import { motion } from 'framer-motion';
import type { WeatherData } from '@/types';

const weatherIcons: Record<string, string> = {
  clear: '☀️',
  rain: '🌧️',
  snow: '❄️',
  fog: '🌫️',
  cloudy: '☁️',
  thunderstorm: '⛈️',
};

interface WeatherCardProps {
  weather: WeatherData | null;
}

export const WeatherCard = ({ weather }: WeatherCardProps) => {
  if (!weather) {
    return (
      <div className="card-elevated p-6">
        <h3 className="font-display font-semibold text-sm mb-3">Weather Impact</h3>
        <p className="text-muted-foreground text-sm">Enter a route to see weather conditions</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-elevated p-6"
    >
      <h3 className="font-display font-semibold text-sm mb-4">Weather Impact</h3>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{weatherIcons[weather.condition] || '🌤️'}</span>
        <div>
          <p className="text-2xl font-display font-bold">{weather.temperature}°C</p>
          <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Humidity</p>
          <p className="text-sm font-semibold">{weather.humidity}%</p>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Wind</p>
          <p className="text-sm font-semibold">{weather.windSpeed} km/h</p>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Battery Impact</span>
          <span className="text-sm font-bold text-destructive">-{weather.batteryImpact}%</span>
        </div>
      </div>
    </motion.div>
  );
};
