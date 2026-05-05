import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/store/appStore';

const ProfilePage = () => {
  const { user, tripHistory, isAuthenticated } = useAppStore();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* User Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">👤</span>
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
                  <p className="text-lg font-display font-bold">{user?.savedVehicles?.length || 0}</p>
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

          {/* Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card-elevated p-6"
          >
            <h3 className="font-display font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-3">
              {[
                { label: 'Email notifications', key: 'email' },
                { label: 'Push notifications', key: 'push' },
                { label: 'Charging alerts', key: 'chargingAlerts' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <span className="text-sm">{item.label}</span>
                  <div className="w-10 h-6 rounded-full bg-primary/20 relative cursor-pointer">
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary transition-transform" />
                  </div>
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
