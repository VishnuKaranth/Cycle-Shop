"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  Stage,
  Text,
  Environment,
  PresentationControls
} from "@react-three/drei";
import * as THREE from "three";

function AbstractBikeFrame() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Use frame to add subtle rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      {/* Main "Frame" Tube - Curved Torus */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <torusGeometry args={[3, 0.05, 16, 100]} />
          <MeshDistortMaterial 
            color="#ffffff" 
            speed={2} 
            distort={0.2} 
            radius={1}
            emissive="#ffffff"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* Inner "Core" - Glowing Sphere */}
      <mesh scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshWobbleMaterial 
          color="#ff0000" 
          factor={0.4} 
          speed={1} 
          emissive="#ff0000"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Supporting "Architecture" - Points and Lines */}
      <points>
        <sphereGeometry args={[6, 32, 32]} />
        <pointsMaterial size={0.02} color="#444" transparent opacity={0.3} />
      </points>
      
      {/* Dynamic Text Background */}
      <Text
        position={[0, 0, -5]}
        fontSize={10}
        color="#111"
        font="/fonts/Inter-Bold.woff" // Assuming Inter is available or fallback
        anchorX="center"
        anchorY="middle"
        maxWidth={20}
        textAlign="center"
        fillOpacity={0.1}
      >
        CANYON PERFORMANCE
      </Text>
    </group>
  );
}

export function ThreeBikeViewer() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full h-full relative bg-[#0a0a0a] overflow-hidden group">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#444]">Initializing 3D Studio</p>
          </div>
        </div>
      )}

      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={() => setLoading(false)}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0000" />
        
        <PresentationControls
          global
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        >
          <group>
            <AbstractBikeFrame />
          </group>
        </PresentationControls>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <Environment preset="night" />
      </Canvas>

      {/* Interface Overlay */}
      <div className="absolute bottom-8 left-8 z-20">
         <div className="flex items-center gap-4">
            <div className="w-1 h-32 bg-gradient-to-b from-accent to-transparent" />
            <div className="space-y-2">
               <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Dynamic 3D Environment</h4>
               <p className="text-[9px] text-[#666] uppercase tracking-widest max-w-[200px] leading-relaxed">
                  Interactive real-time preview of the performance architecture. Drag to explore.
               </p>
            </div>
         </div>
      </div>

      <div className="absolute top-8 right-8 z-20 flex gap-2">
         {['GRID', 'MODEL', 'X-RAY'].map(mode => (
            <button key={mode} className="px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-bold text-[#888] hover:text-white uppercase tracking-widest transition-all">
               {mode}
            </button>
         ))}
      </div>
    </div>
  );
}
