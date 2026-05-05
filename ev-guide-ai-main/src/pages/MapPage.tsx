import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { currentRoute, chargingStations, source, destination, batteryPercentage, selectedEVModel } = useAppStore();
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
      });

      // Google Maps-like tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Source marker - Google style green pin
      if (source && source.lat !== 0) {
        const sourceIcon = L.divIcon({
          html: `<div style="position:relative">
            <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#34A853;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3)">
              <div style="width:12px;height:12px;border-radius:50%;background:white;transform:rotate(45deg)"></div>
            </div>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          className: '',
        });
        L.marker([source.lat, source.lng], { icon: sourceIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:system-ui;padding:4px"><b style="color:#34A853">Start</b><br/><span style="font-size:12px;color:#5f6368">${source.address?.split(',').slice(0, 2).join(',')}</span></div>`);
      }

      // Destination marker - Google style red pin
      if (destination && destination.lat !== 0) {
        const destIcon = L.divIcon({
          html: `<div style="position:relative">
            <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#EA4335;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3)">
              <div style="width:12px;height:12px;border-radius:50%;background:white;transform:rotate(45deg)"></div>
            </div>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          className: '',
        });
        L.marker([destination.lat, destination.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:system-ui;padding:4px"><b style="color:#EA4335">Destination</b><br/><span style="font-size:12px;color:#5f6368">${destination.address?.split(',').slice(0, 2).join(',')}</span></div>`);
      }

      // Route polyline with gradient effect
      if (currentRoute?.geometry?.length) {
        // Shadow line
        L.polyline(currentRoute.geometry, {
          color: '#00000020',
          weight: 10,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Main route line - blue like Google Maps
        const routeLine = L.polyline(currentRoute.geometry, {
          color: '#4285F4',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });

        // Battery drain indicator along route
        if (currentRoute.batteryConsumption > 0) {
          const totalPoints = currentRoute.geometry.length;
          const drainPoint = Math.floor(totalPoints * (1 - currentRoute.remainingBattery / batteryPercentage));
          
          if (drainPoint > 0 && drainPoint < totalPoints && !currentRoute.isReachable) {
            const criticalSegment = currentRoute.geometry.slice(drainPoint);
            L.polyline(criticalSegment, {
              color: '#EA4335',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              dashArray: '10 8',
            }).addTo(map);

            // Battery empty marker
            const emptyPoint = currentRoute.geometry[drainPoint];
            const emptyIcon = L.divIcon({
              html: `<div style="background:#EA4335;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:600;font-family:system-ui;white-space:nowrap;box-shadow:0 2px 8px rgba(234,67,53,0.4)">⚠️ Battery Critical</div>`,
              className: '',
              iconAnchor: [60, 12],
            });
            L.marker(emptyPoint, { icon: emptyIcon }).addTo(map);
          }
        }

        // Midpoint ETA label
        const midIdx = Math.floor(currentRoute.geometry.length / 2);
        const midPoint = currentRoute.geometry[midIdx];
        const hours = Math.floor(currentRoute.duration / 60);
        const mins = currentRoute.duration % 60;
        const etaIcon = L.divIcon({
          html: `<div style="background:white;color:#202124;padding:6px 12px;border-radius:16px;font-size:12px;font-weight:500;font-family:system-ui;white-space:nowrap;box-shadow:0 2px 12px rgba(0,0,0,0.15);border:1px solid #e0e0e0">
            🕐 ${hours}h ${mins}m · ${currentRoute.distance} km
          </div>`,
          className: '',
          iconAnchor: [70, 12],
        });
        L.marker(midPoint, { icon: etaIcon }).addTo(map);
      }

      // Charging stations with Google Maps style
      chargingStations.forEach((station) => {
        const color = station.available ? '#34A853' : '#9AA0A6';
        const stationIcon = L.divIcon({
          html: `<div style="width:32px;height:32px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid ${color}">
            <span style="font-size:16px">⚡</span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: '',
        });
        L.marker([station.location.lat, station.location.lng], { icon: stationIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;padding:4px;min-width:180px">
              <b style="font-size:13px;color:#202124">${station.name}</b>
              <div style="margin-top:6px;display:grid;gap:4px;font-size:12px;color:#5f6368">
                <div>⚡ ${station.power} kW · ${station.connectorType}</div>
                <div>📍 ${station.distance} km from start</div>
                <div style="color:${station.available ? '#34A853' : '#EA4335'};font-weight:500">
                  ${station.available ? '✓ Available' : '✗ Busy'}
                </div>
                <div>⭐ ${station.rating}/5</div>
              </div>
            </div>
          `);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [currentRoute, chargingStations, source, destination, batteryPercentage]);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16 h-screen flex flex-col">
        <div ref={mapRef} className="flex-1 relative" />

        {/* Google Maps-style info panel */}
        {currentRoute && (
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-[1000] bg-card border-t border-border shadow-2xl rounded-t-2xl"
              >
                <div className="max-w-2xl mx-auto p-5">
                  {/* Drag handle */}
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                  </div>

                  {/* Route info header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-display font-bold">
                          {Math.floor(currentRoute.duration / 60)}h {currentRoute.duration % 60}m
                        </span>
                        <span className="text-sm text-muted-foreground">({currentRoute.distance} km)</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        via {selectedEVModel?.name || 'EV'} · {batteryPercentage}% battery
                      </p>
                    </div>
                    <button onClick={() => setShowPanel(false)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Prediction cards */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className={`rounded-xl p-3 text-center ${currentRoute.isReachable ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                      <p className={`text-sm font-bold ${currentRoute.isReachable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentRoute.isReachable ? '✓ Reachable' : '✗ Charge Needed'}
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Battery Used</p>
                      <p className="text-sm font-bold text-primary">{currentRoute.batteryConsumption}%</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Remaining</p>
                      <p className={`text-sm font-bold ${currentRoute.remainingBattery < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {currentRoute.remainingBattery}%
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Weather</p>
                      <p className="text-sm font-bold text-secondary">-{currentRoute.weatherImpact}%</p>
                    </div>
                  </div>

                  {/* Charging stations count */}
                  {chargingStations.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>⚡</span>
                      <span>{chargingStations.filter(s => s.available).length} of {chargingStations.length} charging stations available along route</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Show panel toggle if hidden */}
        {currentRoute && !showPanel && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={() => setShowPanel(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Show Route Info
          </motion.button>
        )}

        {/* No route state */}
        {!currentRoute && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-card border border-border rounded-2xl shadow-xl p-6 text-center max-w-sm"
          >
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-display font-bold text-lg mb-1">No Route Planned</h3>
            <p className="text-sm text-muted-foreground mb-4">Plan a route from the dashboard to see it on the map with predictions.</p>
            <Link to="/dashboard" className="btn-primary text-sm py-2.5 px-6 inline-block">
              Plan a Route
            </Link>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="fixed top-24 left-4 z-[1000] bg-card/95 backdrop-blur border border-border rounded-xl p-3 shadow-lg"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Legend</p>
          <div className="space-y-1.5">
            {[
              { color: '#34A853', label: 'Start', shape: 'pin' },
              { color: '#EA4335', label: 'Destination', shape: 'pin' },
              { color: '#4285F4', label: 'Route', shape: 'line' },
              { color: '#EA4335', label: 'Low battery zone', shape: 'dash' },
              { color: '#34A853', label: 'Charger (available)', shape: 'dot' },
              { color: '#9AA0A6', label: 'Charger (busy)', shape: 'dot' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.shape === 'line' ? (
                  <div className="w-4 h-0.5 rounded" style={{ background: item.color }} />
                ) : item.shape === 'dash' ? (
                  <div className="w-4 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: item.color }} />
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                )}
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
