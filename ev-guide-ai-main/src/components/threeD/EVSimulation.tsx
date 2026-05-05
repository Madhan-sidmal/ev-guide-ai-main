import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text } from '@react-three/drei';
import { useAppStore } from '@/store/appStore';
import * as THREE from 'three';

const EVCar = ({ progress }: { progress: number }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.5, 0]}>
      {/* Car body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        <meshStandardMaterial color="#10B981" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.4, 0.5, 1.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, 0.1, 0.65], [0.8, 0.1, 0.65], [-0.8, 0.1, -0.65], [0.8, 0.1, -0.65]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[1.21, 0.4, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.21, 0.4, -0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
      {/* Battery indicator bar */}
      <mesh position={[-0.6 + (progress / 100) * 0.6, 0.72, 0]}>
        <boxGeometry args={[(progress / 100) * 1.2, 0.05, 0.3]} />
        <meshStandardMaterial
          color={progress > 60 ? '#10B981' : progress > 30 ? '#eab308' : '#ef4444'}
          emissive={progress > 60 ? '#10B981' : progress > 30 ? '#eab308' : '#ef4444'}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

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

const SnowEffect = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 300;
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
        posArray[i * 3 + 1] -= delta * 2;
        posArray[i * 3] += Math.sin(Date.now() * 0.001 + i) * delta * 0.5;
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
      <pointsMaterial size={0.06} color="#e2e8f0" transparent opacity={0.8} />
    </points>
  );
};

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
  </mesh>
);

const RoutePathVisualization = () => {
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

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line>
      <primitive object={lineGeometry} attach="geometry" />
      <lineBasicMaterial color="#10B981" linewidth={2} />
    </line>
  );
};

const ChargingStationModel = ({ position }: { position: [number, number, number] }) => (
  <Float speed={2} floatIntensity={0.3}>
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.2]} />
        <meshStandardMaterial color="#2563EB" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
      </mesh>
    </group>
  </Float>
);

const Scene = () => {
  const batteryPercentage = useAppStore((s) => s.batteryPercentage);
  const weather = useAppStore((s) => s.weather);
  const weatherCondition = weather?.condition || 'clear';

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.5} color="#10B981" />

      <EVCar progress={batteryPercentage} />
      <Ground />
      <RoutePathVisualization />

      <ChargingStationModel position={[3, 0, 0]} />
      <ChargingStationModel position={[-2, 0, 2.5]} />

      {weatherCondition === 'rain' && <RainEffect />}
      {weatherCondition === 'snow' && <SnowEffect />}

      <Float speed={1.5} floatIntensity={0.2}>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="#10B981"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {`Battery: ${batteryPercentage}%`}
        </Text>
      </Float>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
      />
      <Environment preset="city" />
    </>
  );
};

const EVSimulation = () => (
  <div className="w-full h-full relative">
    <Canvas camera={{ position: [4, 3, 4], fov: 50 }} shadows>
      <Scene />
    </Canvas>
    <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-1.5">
      <p className="text-xs font-medium text-foreground">3D EV Simulation</p>
    </div>
  </div>
);

export default EVSimulation;
