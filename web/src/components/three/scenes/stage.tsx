"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping, CanvasTexture, SRGBColorSpace } from "three";

interface StageProps {
  active: boolean;
  onReady?: () => void;
  cameraPosition: [number, number, number];
  fov?: number;
  /** Floor level for the contact shadow + plinth glow. Omit for floating scenes. */
  shadowY?: number;
  /** Shadow / plinth scale. */
  floorSize?: number;
  /** Touch: allow vertical page scroll over the canvas (horizontal drags orbit). */
  interactive?: boolean;
  children: ReactNode;
}

const DPR_MAX = 1.75;

/** Fires once the suspended content (GLB) has mounted and a frame is on its way. */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const advance = useThree((s) => s.advance);
  const frameloop = useThree((s) => s.frameloop);
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      if (frameloop === "never") advance(performance.now() / 1000);
      id = requestAnimationFrame(() => onReady?.());
    });
    return () => cancelAnimationFrame(id);
  }, [onReady, advance, frameloop]);
  return null;
}

/** Soft peach pool of light under the model (a "plinth" without any hard edge). */
function Plinth({ y, size }: { y: number; size: number }) {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={[0, y - 0.02, 0]} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={map} color="#FFBE98" transparent opacity={0.42} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Warm key / cool fill / peach rim + warm points, over a PMREM environment baked from a tiny light scene (no HDR download). */
export function Rig() {
  return (
    <>
      <Environment resolution={256} frames={1} environmentIntensity={0.85}>
        <color attach="background" args={["#1a2540"]} />
        <Lightformer form="rect" intensity={5} color="#FFF1E2" position={[3.5, 4, 4]} scale={[7, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} color="#BCD2FF" position={[-6, 1, 3]} scale={[4, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={3.5} color="#FFBE98" position={[0, 2.5, -7]} scale={6} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#F0EEE9" position={[0, -5, 1]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
      <directionalLight position={[3.5, 5, 4.5]} intensity={2.1} color="#FFF3E6" />
      <directionalLight position={[-5, 1.5, 3]} intensity={0.75} color="#C4D8FF" />
      <directionalLight position={[-1.5, 3, -5.5]} intensity={2.6} color="#FFBE98" />
      <pointLight position={[2.5, -1.5, 3.5]} intensity={9} distance={9} decay={2} color="#FFC9A8" />
      <pointLight position={[-2.8, 1.8, 2.6]} intensity={6} distance={8} decay={2} color="#FFE4CF" />
    </>
  );
}

/** Shared canvas: ACES tone mapping, PMREM env, light rig, floor and adaptive quality. */
export function Stage({
  active,
  onReady,
  cameraPosition,
  fov = 32,
  shadowY,
  floorSize = 9,
  interactive = false,
  children,
}: StageProps) {
  const [dpr, setDpr] = useState(DPR_MAX);
  return (
    <Canvas
      dpr={[1, dpr]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ fov, position: cameraPosition, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = SRGBColorSpace;
      }}
      style={{ position: "absolute", inset: 0, touchAction: interactive ? "pan-y" : "auto" }}
    >
      <PerformanceMonitor
        flipflops={3}
        onChange={({ factor }) => setDpr(Math.round((1 + (DPR_MAX - 1) * factor) * 4) / 4)}
      />
      <AdaptiveDpr pixelated={false} />
      <Suspense fallback={null}>
        <Rig />
        {children}
        {shadowY !== undefined && (
          <>
            <Plinth y={shadowY} size={floorSize * 1.25} />
            <ContactShadows
              position={[0, shadowY, 0]}
              scale={floorSize}
              blur={2.8}
              far={4}
              resolution={256}
              opacity={0.3}
              color="#0F1E3D"
            />
          </>
        )}
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
