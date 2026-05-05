import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text } from '@react-three/drei';
import { useAppStore } from '@/store/appStore';
import * as THREE from 'three';

/* ── EV Car ─────────────────────────────────────────────────── */
const EVCar = ({ battery, isMoving }: { battery: number; isMoving: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isMoving) {
      meshRef.current.position.x = Math.sin(Date.now() * 0.0008) * 2.5;
      meshRef.current.position.z = Math.cos(Date.now() * 0.0008) * 2.5;
      meshRef.current.rotation.y = Math.atan2(
        Math.cos(Date.now() * 0.0008) * 2.5,
        -Math.sin(Date.now() * 0.0008) * 2.5
      );
      wheelRefs.current.forEach(w => { if (w) w.rotation.x += delta * 12; });
    } else {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const bodyColor = battery > 60 ? '#10B981' : battery > 30 ? '#eab308' : '#ef4444';

  return (
    <group ref={meshRef} position={[0, -0.5, 0]}>
      {/* Car body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.4, 0.5, 1.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, 0.1, 0.65], [0.8, 0.1, 0.65], [-0.8, 0.1, -0.65], [0.8, 0.1, -0.65]].map((pos, i) => (
        <mesh key={i} ref={(el) => { if (el) wheelRefs.current[i] = el; }} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[1.21, 0.4, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={isMoving ? 3 : 1} />
      </mesh>
      <mesh position={[1.21, 0.4, -0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={isMoving ? 3 : 1} />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-1.21, 0.4, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isMoving ? 2 : 0.5} />
      </mesh>
      <mesh position={[-1.21, 0.4, -0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isMoving ? 2 : 0.5} />
      </mesh>
      {/* Battery indicator bar on roof */}
      <mesh position={[-0.6 + (battery / 100) * 0.6, 0.72, 0]}>
        <boxGeometry args={[(battery / 100) * 1.2, 0.05, 0.3]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

/* ── Weather Effects ────────────────────────────────────────── */
const RainEffect = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      const posArray = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArray[i * 3 + 1] -= delta * 8;
        if (posArray[i * 3 + 1] < -1) posArray[i * 3 + 1] = 8;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#60a5fa" transparent opacity={0.6} />
    </points>
  );
};

/* ── Route Path ─────────────────────────────────────────────── */
const RoutePath = ({ hasRoute }: { hasRoute: boolean }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      pts.push(new THREE.Vector3(
        Math.sin(t * Math.PI * 2) * 3,
        -0.45,
        Math.cos(t * Math.PI * 2) * 3
      ));
    }
    return pts;
  }, []);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line>
      <primitive object={lineGeometry} attach="geometry" />
      <lineBasicMaterial color={hasRoute ? '#10B981' : '#94a3b8'} linewidth={2} transparent opacity={hasRoute ? 1 : 0.3} />
    </line>
  );
};

/* ── Charging Station ───────────────────────────────────────── */
const ChargingStation = ({ position, available }: { position: [number, number, number]; available: boolean }) => (
  <Float speed={2} floatIntensity={0.3}>
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.2]} />
        <meshStandardMaterial color={available ? '#2563EB' : '#64748b'} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={available ? '#10B981' : '#ef4444'} emissive={available ? '#10B981' : '#ef4444'} emissiveIntensity={2} />
      </mesh>
    </group>
  </Float>
);

/* ── Ground ─────────────────────────────────────────────────── */
const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
  </mesh>
);

/* ── Scene ──────────────────────────────────────────────────── */
const Scene = () => {
  const battery = useAppStore((s) => s.batteryPercentage);
  const weather = useAppStore((s) => s.weather);
  const route = useAppStore((s) => s.currentRoute);
  const evModel = useAppStore((s) => s.selectedEVModel);
  const stations = useAppStore((s) => s.chargingStations);

  const hasRoute = !!route;
  const weatherCondition = weather?.condition || 'clear';

  // Show up to 4 stations around the route circle
  const stationPositions: [number, number, number][] = [
    [3, 0, 0], [-2, 0, 2.5], [0, 0, -3], [-3, 0, -1],
  ];

  return (
    <>
      <ambientLight intensity={weatherCondition === 'rain' ? 0.3 : 0.5} />
      <directionalLight position={[5, 5, 5]} intensity={weatherCondition === 'rain' ? 0.6 : 1} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.5} color="#10B981" />

      <EVCar battery={hasRoute ? route.remainingBattery : battery} isMoving={hasRoute} />
      <Ground />
      <RoutePath hasRoute={hasRoute} />

      {/* Charging stations — show based on actual data */}
      {stationPositions.slice(0, hasRoute ? Math.min(stations.length, 4) : 2).map((pos, i) => (
        <ChargingStation key={i} position={pos} available={stations[i]?.available ?? true} />
      ))}

      {weatherCondition === 'rain' && <RainEffect />}

      {/* HUD Text — shows practical info */}
      <Float speed={1.5} floatIntensity={0.2}>
        <Text position={[0, 2.6, 0]} fontSize={0.25} color="#10B981" anchorX="center" anchorY="middle" font={undefined}>
          {hasRoute
            ? `${route.distance} km · ${route.remainingBattery}% remaining`
            : `Battery: ${battery}%`}
        </Text>
      </Float>

      {evModel && (
        <Float speed={1} floatIntensity={0.1}>
          <Text position={[0, 2.2, 0]} fontSize={0.15} color="#64748b" anchorX="center" anchorY="middle" font={undefined}>
            {evModel.name}
          </Text>
        </Float>
      )}

      {hasRoute && !route.isReachable && (
        <Float speed={3} floatIntensity={0.4}>
          <Text position={[0, 1.8, 0]} fontSize={0.18} color="#ef4444" anchorX="center" anchorY="middle" font={undefined}>
            ⚠ Charging stop needed
          </Text>
        </Float>
      )}

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={hasRoute ? 1.5 : 0.5}
      />
      <Environment preset="city" />
    </>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
const EVSimulation = () => {
  const route = useAppStore((s) => s.currentRoute);
  const weather = useAppStore((s) => s.weather);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [4, 3, 4], fov: 50 }} shadows>
        <Scene />
      </Canvas>

      {/* Overlay HUD */}
      <div className="absolute bottom-3 left-3 flex gap-2">
        <div className="glass rounded-lg px-3 py-1.5">
          <p className="text-xs font-medium text-foreground">
            {route ? '🚗 Route Active' : '3D EV Simulation'}
          </p>
        </div>
        {weather && (
          <div className="glass rounded-lg px-3 py-1.5">
            <p className="text-xs font-medium text-foreground">
              {weather.icon} {weather.temperature}°C
            </p>
          </div>
        )}
      </div>

      {route && (
        <div className="absolute top-3 right-3 glass rounded-lg px-3 py-1.5">
          <p className="text-xs font-medium text-foreground">
            {route.isReachable ? '✅ Reachable' : '⚠️ Needs charging'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EVSimulation;
