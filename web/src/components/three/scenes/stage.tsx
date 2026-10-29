"use client";

import { useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, PerformanceMonitor } from "@react-three/drei";

interface StageProps {
  active: boolean;
  onReady?: () => void;
  cameraPosition: [number, number, number];
  /** Soft floor shadow (low-res). Off for floating scenes. */
  shadowY?: number;
  children: ReactNode;
}

/** Shared canvas, lights (no HDR download) and adaptive quality. */
export function Stage({ active, onReady, cameraPosition, shadowY, children }: StageProps) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      dpr={[1, dpr]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ fov: 35, position: cameraPosition, near: 0.1, far: 60 }}
      onCreated={() => onReady?.()}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} />
      <AdaptiveDpr />
      <hemisphereLight args={["#F0EEE9", "#FFBE98", 1.15]} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.4} color="#FFF8F0" />
      <directionalLight position={[-4, 2, -3]} intensity={2.2} color="#FFBE98" />
      {children}
      {shadowY !== undefined && (
        <ContactShadows
          position={[0, shadowY, 0]}
          scale={11}
          blur={2.6}
          far={4}
          resolution={256}
          opacity={0.28}
          color="#0F1E3D"
        />
      )}
    </Canvas>
  );
}
