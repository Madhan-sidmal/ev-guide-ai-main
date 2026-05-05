import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#10B981', '#2563EB', '#eab308', '#ef4444'];

const AnalyticsDashboard = () => {
  const { analytics, currentRoute } = useAppStore();

  if (!analytics) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="text-5xl block mb-4">📊</span>
            <h2 className="font-display text-xl font-bold mb-2">No Analytics Data</h2>
            <p className="text-muted-foreground text-sm mb-4">Predict a route to view battery analytics.</p>
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
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Battery Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Detailed insights into battery performance</p>
        </motion.div>

        {/* Health Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6 mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={`${analytics.healthScore * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">
                {analytics.healthScore}%
              </span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Battery Health Score</h3>
              <p className="text-muted-foreground text-sm">Overall battery performance rating</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Drain Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card-elevated p-6"
          >
            <h3 className="font-display font-semibold mb-4">Battery Drain Over Distance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.drainOverDistance}>
                <defs>
                  <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="distance" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                />
                <Area type="monotone" dataKey="battery" stroke="#10B981" fill="url(#batteryGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weather Impact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card-elevated p-6"
          >
            <h3 className="font-display font-semibold mb-4">Weather Impact on Battery</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.weatherImpact}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="condition" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="impact" radius={[8, 8, 0, 0]}>
                  {analytics.weatherImpact.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Historical Usage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card-elevated p-6 lg:col-span-2"
          >
            <h3 className="font-display font-semibold mb-4">Historical Battery Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.historicalUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                />
                <Line type="monotone" dataKey="usage" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
