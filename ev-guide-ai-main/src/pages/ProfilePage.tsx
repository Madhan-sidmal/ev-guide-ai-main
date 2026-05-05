import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/services';

interface Preferences {
  preferredMode: string;
  minBatteryBuffer: number;
  prefersChargingStops: boolean;
  notificationEmail: boolean;
  notificationPush: boolean;
  chargingAlerts: boolean;
}

interface EVCatalogModel {
  id: string;
  name: string;
  manufacturer: string;
  batteryCapacity: number;
  range: number;
  efficiency: number;
}

interface UserVehicle {
  id: string;
  modelName: string;
  manufacturer: string;
  batteryCapacity: number;
  baseEfficiency: number;
  learnedEfficiency: number;
  totalTrips: number;
  totalDistance: number;
}

const ProfilePage = () => {
  const { user, tripHistory, isAuthenticated } = useAppStore();
  const { toast } = useToast();

  // Preferences state
  const [prefs, setPrefs] = useState<Preferences>({
    preferredMode: 'balanced',
    minBatteryBuffer: 20,
    prefersChargingStops: true,
    notificationEmail: true,
    notificationPush: true,
    chargingAlerts: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(false);

  // Vehicle state
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [catalog, setCatalog] = useState<EVCatalogModel[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [addingVehicle, setAddingVehicle] = useState(false);

  // Load preferences and vehicles on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    api.get('/preferences').then(res => setPrefs(res.data)).catch(() => {});
    api.get('/vehicles').then(res => setVehicles(res.data)).catch(() => {});
    api.get('/ev-models').then(res => setCatalog(res.data)).catch(() => {});
  }, [isAuthenticated]);

  // Toggle a preference
  const togglePref = async (key: keyof Preferences) => {
    const newValue = !prefs[key];
    const updated = { ...prefs, [key]: newValue };
    setPrefs(updated);

    try {
      await api.put('/preferences', updated);
      toast({ title: '✅ Preference updated' });
    } catch {
      setPrefs(prefs); // revert
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  // Change driving mode
  const changeMode = async (mode: string) => {
    const updated = { ...prefs, preferredMode: mode };
    setPrefs(updated);

    try {
      await api.put('/preferences', updated);
      toast({ title: '✅ Driving mode set to ' + mode });
    } catch {
      setPrefs(prefs);
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  // Change battery buffer
  const changeBuffer = async (val: number) => {
    const updated = { ...prefs, minBatteryBuffer: val };
    setPrefs(updated);
    // Debounced save — save on mouse up
  };

  const saveBuffer = async () => {
    try {
      await api.put('/preferences', prefs);
    } catch {
      toast({ title: 'Failed to save buffer', variant: 'destructive' });
    }
  };

  // Add vehicle from catalog
  const addVehicle = async () => {
    if (!selectedCatalogId) return;
    setAddingVehicle(true);
    try {
      const res = await api.post('/vehicles', { evModelId: selectedCatalogId });
      setVehicles(prev => [...prev, res.data]);
      setShowAddVehicle(false);
      setSelectedCatalogId('');
      toast({ title: '🚗 Vehicle added!' });
    } catch {
      toast({ title: 'Failed to add vehicle', variant: 'destructive' });
    } finally {
      setAddingVehicle(false);
    }
  };

  // Delete vehicle
  const deleteVehicle = async (id: string) => {
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Vehicle removed' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const modeOptions = [
    { value: 'eco', label: '🌿 Eco', desc: 'Max range, slower' },
    { value: 'balanced', label: '⚖️ Balanced', desc: 'Default mode' },
    { value: 'fast', label: '⚡ Fast', desc: 'Speed priority' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account, vehicles and preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* ── User Info ──────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">{user?.name || 'Guest User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email || 'Sign in to access your profile'}</p>
              </div>
            </div>
            {isAuthenticated && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-lg font-display font-bold">{tripHistory.length}</p>
                  <p className="text-xs text-muted-foreground">Trips</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-lg font-display font-bold">{vehicles.length}</p>
                  <p className="text-xs text-muted-foreground">Vehicles</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-lg font-display font-bold text-primary">
                    {tripHistory.reduce((acc, t) => acc + t.carbonSaved, 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── My Vehicles ────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">My Vehicles</h3>
              <button onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                {showAddVehicle ? '✕ Cancel' : '+ Add Vehicle'}
              </button>
            </div>

            {/* Add vehicle form */}
            <AnimatePresence>
              {showAddVehicle && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-muted rounded-xl p-4 space-y-3">
                    <label className="block text-sm font-medium">Select from catalog</label>
                    <select value={selectedCatalogId} onChange={(e) => setSelectedCatalogId(e.target.value)}
                      className="input-field text-sm">
                      <option value="">Choose an EV model...</option>
                      {catalog.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.manufacturer} {m.name} — {m.batteryCapacity} kWh, {m.range} km range
                        </option>
                      ))}
                    </select>
                    <button onClick={addVehicle} disabled={!selectedCatalogId || addingVehicle}
                      className="btn-primary text-sm w-full disabled:opacity-50">
                      {addingVehicle ? 'Adding...' : 'Add Vehicle'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vehicle list */}
            {vehicles.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🚗</p>
                <p className="text-sm text-muted-foreground">No vehicles yet. Add one from the catalog above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between bg-muted rounded-xl p-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-lg">⚡</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{v.manufacturer} {v.modelName}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.batteryCapacity} kWh · {v.totalTrips} trips · {Math.round(v.totalDistance)} km driven
                        </p>
                        {v.totalTrips > 0 && (
                          <p className="text-xs text-primary mt-0.5">
                            Learned efficiency: {(v.learnedEfficiency).toFixed(0)} Wh/km
                            {v.learnedEfficiency !== v.baseEfficiency && ' (adapted)'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteVehicle(v.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                      Remove
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Driving Mode ───────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card-elevated p-6"
          >
            <h3 className="font-display font-semibold mb-4">Driving Mode</h3>
            <div className="grid grid-cols-3 gap-3">
              {modeOptions.map(m => (
                <button key={m.value} onClick={() => changeMode(m.value)}
                  className={`rounded-xl p-3 text-center transition-all border-2 ${
                    prefs.preferredMode === m.value
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted hover:border-border'
                  }`}
                >
                  <p className="text-lg mb-1">{m.label.split(' ')[0]}</p>
                  <p className="text-xs font-semibold">{m.label.split(' ')[1]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Battery buffer slider */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Min. Battery Buffer</label>
                <span className="text-sm font-bold text-primary">{prefs.minBatteryBuffer}%</span>
              </div>
              <input type="range" min={5} max={50} value={prefs.minBatteryBuffer}
                onChange={(e) => changeBuffer(Number(e.target.value))}
                onMouseUp={saveBuffer} onTouchEnd={saveBuffer}
                className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5%</span><span>50%</span>
              </div>
            </div>
          </motion.div>

          {/* ── Notification Settings ──────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card-elevated p-6"
          >
            <h3 className="font-display font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-3">
              {[
                { label: 'Email notifications', key: 'notificationEmail' as keyof Preferences, desc: 'Trip summaries and updates' },
                { label: 'Push notifications', key: 'notificationPush' as keyof Preferences, desc: 'Real-time alerts' },
                { label: 'Charging alerts', key: 'chargingAlerts' as keyof Preferences, desc: 'When battery is low' },
                { label: 'Prefer charging stops', key: 'prefersChargingStops' as keyof Preferences, desc: 'Include stops in route planning' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button onClick={() => togglePref(item.key)}
                    className={`w-12 h-7 rounded-full relative transition-colors ${
                      prefs[item.key] ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      prefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
