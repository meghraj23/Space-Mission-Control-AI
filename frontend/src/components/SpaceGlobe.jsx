import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const EarthHologram = () => {
  const globeRef = useRef();
  const gridRef = useRef();

  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.05;
    if (gridRef.current) gridRef.current.rotation.y -= delta * 0.03;
  });

  return (
    <group>
      {/* Central Core Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial
          color="#0b1220"
          transparent
          opacity={0.8}
        />
        {/* Core Wireframe Overlay */}
        <mesh>
          <sphereGeometry args={[2.01, 32, 32]} />
          <meshBasicMaterial
            color="#00e5ff"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      </mesh>

      {/* Atmospheric/Orbit Grid Layer */}
      <mesh ref={gridRef}>
        <sphereGeometry args={[2.3, 16, 16]} />
        <meshBasicMaterial
          color="#7b61ff"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Equatorial Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.52, 64]} />
        <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const SatellitesInOrbit = () => {
  const satGroupRef = useRef();

  useFrame((state, delta) => {
    if (satGroupRef.current) {
      satGroupRef.current.rotation.y += delta * 0.15;
      satGroupRef.current.rotation.x += delta * 0.05;
    }
  });

  // Generate orbital satellites
  const satellites = [
    { distance: 2.8, angle: 0, color: '#00e5ff' },
    { distance: 3.1, angle: Math.PI / 3, color: '#7b61ff' },
    { distance: 3.4, angle: -Math.PI / 4, color: '#ff4d6d' },
  ];

  return (
    <group ref={satGroupRef}>
      {satellites.map((sat, i) => {
        const x = sat.distance * Math.cos(sat.angle);
        const z = sat.distance * Math.sin(sat.angle);
        return (
          <group key={i}>
            {/* Orbital Ring Trail */}
            <mesh rotation={[Math.PI / 2.5, sat.angle, 0]}>
              <ringGeometry args={[sat.distance - 0.01, sat.distance + 0.01, 64]} />
              <meshBasicMaterial color={sat.color} side={THREE.DoubleSide} transparent opacity={0.08} />
            </mesh>
            {/* Satellite Mesh */}
            <mesh position={[x, 0, z]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshBasicMaterial color={sat.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const SpaceGlobe = () => {
  return (
    <div className="w-full h-full min-h-[350px] md:min-h-[450px] relative">
      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-gray-500 bg-spaceCard/60 border border-white/5 p-2 rounded backdrop-blur-sm pointer-events-none">
        DRAG TO ROTATE DECK &bull; SCROLL TO ZOOM RANGE
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Animated stars in background */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />
        
        <EarthHologram />
        <SatellitesInOrbit />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.5}
          maxDistance={8}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default SpaceGlobe;
