import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text } from '@react-three/drei';
import { useAppStore } from '@/store/appStore';
import * as THREE from 'three';

/* ── EV Car ─────────────────────────────────────────────────── */
const EVCar = ({ position, rotation, battery }: { position: [number, number, number]; rotation: number; battery: number }) => {
  const bodyColor = battery > 60 ? '#10B981' : battery > 30 ? '#eab308' : '#ef4444';

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.4, 0.5, 1.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {[[-0.8, 0.1, 0.65], [0.8, 0.1, 0.65], [-0.8, 0.1, -0.65], [0.8, 0.1, -0.65]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      <mesh position={[1.21, 0.4, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.21, 0.4, -0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
      {/* Battery bar on roof */}
      <mesh position={[-0.6 + (battery / 100) * 0.6, 0.72, 0]}>
        <boxGeometry args={[(battery / 100) * 1.2, 0.05, 0.3]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

/* ── Charging Station ───────────────────────────────────────── */
const StationMarker = ({ position, available, passed }: { position: [number, number, number]; available: boolean; passed: boolean }) => (
  <Float speed={2} floatIntensity={0.2}>
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.2]} />
        <meshStandardMaterial color={passed ? '#94a3b8' : available ? '#2563EB' : '#64748b'} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={passed ? '#94a3b8' : available ? '#10B981' : '#ef4444'}
          emissive={passed ? '#94a3b8' : available ? '#10B981' : '#ef4444'}
          emissiveIntensity={passed ? 0.5 : 2}
        />
      </mesh>
    </group>
  </Float>
);

/* ── Route Path ─────────────────────────────────────────────── */
const RoutePath3D = ({ points, progress }: { points: THREE.Vector3[]; progress: number }) => {
  const splitIdx = Math.floor(points.length * progress);

  const traveledGeo = useMemo(() => {
    const pts = points.slice(0, Math.max(splitIdx, 2));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [points, splitIdx]);

  const remainingGeo = useMemo(() => {
    const pts = points.slice(Math.max(splitIdx - 1, 0));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [points, splitIdx]);

  return (
    <>
      <line>
        <primitive object={traveledGeo} attach="geometry" />
        <lineBasicMaterial color="#10B981" linewidth={2} />
      </line>
      <line>
        <primitive object={remainingGeo} attach="geometry" />
        <lineBasicMaterial color="#94a3b8" linewidth={1} transparent opacity={0.4} />
      </line>
    </>
  );
};

/* ── Ground ─────────────────────────────────────────────────── */
const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
  </mesh>
);

/* ── Scene ──────────────────────────────────────────────────── */
const Scene = ({ progress, isPlaying }: { progress: number; isPlaying: boolean }) => {
  const battery = useAppStore((s) => s.batteryPercentage);
  const route = useAppStore((s) => s.currentRoute);
  const stations = useAppStore((s) => s.chargingStations);
  const evModel = useAppStore((s) => s.selectedEVModel);

  const hasRoute = !!route;

  // Build circular path for the 3D view
  const routePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 100;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      pts.push(new THREE.Vector3(
        Math.sin(t * Math.PI * 2) * 3,
        -0.45,
        Math.cos(t * Math.PI * 2) * 3
      ));
    }
    return pts;
  }, []);

  // Car position and rotation based on progress
  const carPos = useMemo((): [number, number, number] => {
    if (!hasRoute) return [0, -0.5, 0];
    const idx = Math.min(Math.floor(progress * routePoints.length), routePoints.length - 1);
    const pt = routePoints[idx];
    return [pt.x, pt.y - 0.05, pt.z];
  }, [hasRoute, progress, routePoints]);

  const carRotation = useMemo(() => {
    if (!hasRoute) return 0;
    const idx = Math.min(Math.floor(progress * routePoints.length), routePoints.length - 1);
    const nextIdx = Math.min(idx + 1, routePoints.length - 1);
    const curr = routePoints[idx];
    const next = routePoints[nextIdx];
    return Math.atan2(next.x - curr.x, next.z - curr.z);
  }, [hasRoute, progress, routePoints]);

  // Battery drains with progress
  const currentBattery = hasRoute
    ? Math.max(battery - (route.batteryConsumption * progress), 0)
    : battery;

  // Charging station positions around the route
  const stationData = useMemo(() => {
    if (!hasRoute || !stations.length) return [];
    return stations.map((s, i) => {
      const t = (i + 1) / (stations.length + 1);
      const pt = routePoints[Math.floor(t * routePoints.length)];
      return {
        pos: [pt.x + (Math.random() - 0.5) * 0.5, -0.5, pt.z + (Math.random() - 0.5) * 0.5] as [number, number, number],
        available: s.available,
        progressMark: t,
      };
    });
  }, [hasRoute, stations, routePoints]);

  // Distance and time at current progress
  const distCovered = hasRoute ? Math.round(route.distance * progress) : 0;
  const timeElapsed = hasRoute ? Math.round(route.duration * progress) : 0;

  // Auto-rotate camera ref
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current && hasRoute && isPlaying) {
      controlsRef.current.autoRotateSpeed = 0;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.5} color="#10B981" />

      {hasRoute ? (
        <>
          <EVCar position={carPos} rotation={carRotation} battery={currentBattery} />
          <RoutePath3D points={routePoints} progress={progress} />

          {/* Charging Stations */}
          {stationData.map((sd, i) => (
            <StationMarker key={i} position={sd.pos} available={sd.available} passed={progress > sd.progressMark} />
          ))}

          {/* Start marker */}
          <mesh position={[routePoints[0].x, 0, routePoints[0].z]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
          </mesh>
          {/* End marker */}
          <mesh position={[routePoints[routePoints.length - 1].x, 0, routePoints[routePoints.length - 1].z]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
          </mesh>

          {/* HUD */}
          <Float speed={1.5} floatIntensity={0.2}>
            <Text position={[0, 2.8, 0]} fontSize={0.22} color="#10B981" anchorX="center" anchorY="middle" font={undefined}>
              {`🔋 ${Math.round(currentBattery)}% · ${distCovered} km / ${route.distance} km`}
            </Text>
          </Float>
          <Float speed={1} floatIntensity={0.1}>
            <Text position={[0, 2.4, 0]} fontSize={0.15} color="#64748b" anchorX="center" anchorY="middle" font={undefined}>
              {`${Math.floor(timeElapsed / 60)}h ${timeElapsed % 60}m elapsed · ${evModel?.name || ''}`}
            </Text>
          </Float>

          {currentBattery < 20 && (
            <Float speed={3} floatIntensity={0.4}>
              <Text position={[0, 2.0, 0]} fontSize={0.18} color="#ef4444" anchorX="center" anchorY="middle" font={undefined}>
                ⚠ LOW BATTERY — find a charging station
              </Text>
            </Float>
          )}
        </>
      ) : (
        <>
          <EVCar position={[0, -0.5, 0]} rotation={Date.now() * 0.0003} battery={battery} />
          <Float speed={1.5} floatIntensity={0.2}>
            <Text position={[0, 2.5, 0]} fontSize={0.25} color="#10B981" anchorX="center" anchorY="middle" font={undefined}>
              {`Battery: ${battery}%`}
            </Text>
          </Float>
          <Float speed={1} floatIntensity={0.1}>
            <Text position={[0, 2.1, 0]} fontSize={0.14} color="#94a3b8" anchorX="center" anchorY="middle" font={undefined}>
              Plan a route to start simulation
            </Text>
          </Float>
        </>
      )}

      <Ground />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={10}
        autoRotate={!hasRoute}
        autoRotateSpeed={0.5}
      />
      <Environment preset="city" />
    </>
  );
};

/* ── Idle Car (no route) — auto-rotate ──────────────────────── */
const IdleCarScene = () => {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });
  return null;
};

/* ── Main Component ─────────────────────────────────────────── */
const EVSimulation = () => {
  const route = useAppStore((s) => s.currentRoute);
  const stations = useAppStore((s) => s.chargingStations);
  const battery = useAppStore((s) => s.batteryPercentage);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);

  const hasRoute = !!route;

  // Reset on new route
  useEffect(() => {
    setProgress(0);
    setIsPlaying(false);
  }, [route?.id]);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();
    const speed = 0.05; // complete trip in ~20 seconds

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setProgress(p => {
        const next = p + delta * speed;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  const currentBattery = hasRoute
    ? Math.max(battery - (route.batteryConsumption * progress), 0)
    : battery;

  const distCovered = hasRoute ? Math.round(route.distance * progress) : 0;

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [5, 4, 5], fov: 50 }} shadows>
        <Scene progress={progress} isPlaying={isPlaying} />
      </Canvas>

      {/* ── Controls Overlay ───────────────────────── */}
      {hasRoute && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
          {/* Progress bar */}
          <div className="relative mb-2">
            <input
              type="range" min={0} max={100} value={Math.round(progress * 100)}
              onChange={(e) => { setProgress(Number(e.target.value) / 100); setIsPlaying(false); }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 accent-primary"
            />
            {/* Station markers on the progress bar */}
            {stations.map((s, i) => {
              const pos = ((i + 1) / (stations.length + 1)) * 100;
              return (
                <div key={i} className="absolute top-0 -translate-y-1" style={{ left: `${pos}%` }}
                  title={`${s.name} (${s.available ? 'Available' : 'Occupied'})`}
                >
                  <div className={`w-2 h-2 rounded-full ${s.available ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button onClick={() => { setProgress(0); setIsPlaying(false); }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-colors"
              >
                ↺
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
              <span className={`px-2 py-0.5 rounded-full ${currentBattery > 30 ? 'bg-green-500/30' : currentBattery > 15 ? 'bg-yellow-500/30' : 'bg-red-500/30'}`}>
                🔋 {Math.round(currentBattery)}%
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full">
                📍 {distCovered} / {route.distance} km
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Top badges ─────────────────────────────── */}
      <div className="absolute top-3 left-3">
        <div className="glass rounded-lg px-3 py-1.5">
          <p className="text-xs font-medium text-foreground">
            {hasRoute ? '🚗 Trip Simulator' : '3D EV Preview'}
          </p>
        </div>
      </div>

      {!hasRoute && (
        <div className="absolute bottom-3 left-3 right-3 text-center">
          <p className="text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-1.5">
            Plan a route to start the trip simulation
          </p>
        </div>
      )}
    </div>
  );
};

export default EVSimulation;
