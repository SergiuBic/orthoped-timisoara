"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import type { Group } from "three";
import type { SceneBaseProps } from "../types";
import { damp } from "./damp";
import { KneeModel } from "./knee-model";
import { Stage } from "./stage";

const MAX_TILT = (8 * Math.PI) / 180;

function HeroKnee() {
  const group = useRef<Group>(null);
  const tilt = useRef({ x: 0, y: 0, gx: 0, gy: 0, hasGyro: false });

  // Device orientation (Android / permission-granted iOS) acts as parallax on touch devices.
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const t = tilt.current;
      t.hasGyro = true;
      t.gx = Math.max(-1, Math.min(1, e.gamma / 30));
      t.gy = Math.max(-1, Math.min(1, (e.beta - 50) / 30));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = tilt.current;
    const tx = t.hasGyro ? t.gx : s.pointer.x;
    const ty = t.hasGyro ? t.gy : -s.pointer.y;
    t.y = damp(t.y, tx * MAX_TILT, 3, dt);
    t.x = damp(t.x, ty * MAX_TILT, 3, dt);
    const g = group.current;
    if (g) {
      g.rotation.y = s.clock.elapsedTime * 0.1 + t.y;
      g.rotation.x = t.x;
    }
  });

  return (
    <group ref={group} scale={0.82}>
      <KneeModel focus="overview" />
    </group>
  );
}

export default function HeroScene({ active, onReady }: SceneBaseProps) {
  return (
    <Stage active={active} onReady={onReady} cameraPosition={[0, 0.4, 9.2]}>
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
        <HeroKnee />
      </Float>
      <Sparkles count={40} scale={[6, 6.5, 4]} size={3.2} speed={0.25} opacity={0.8} color="#FFBE98" />
    </Stage>
  );
}
