"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3, type Group } from "three";
import type { KneeFocus, SceneBaseProps } from "../types";
import { dampVec3 } from "./damp";
import { KneeModel } from "./knee-model";
import { Stage } from "./stage";

type V3 = [number, number, number];
const POSES: Record<KneeFocus, { pos: V3; target: V3; label: V3 }> = {
  overview: { pos: [4.4, 1.4, 5.8], target: [0, 0, 0], label: [0.78, 0.35, 0.45] },
  acl: { pos: [-2.5, 0.5, 3.5], target: [0, -0.1, 0], label: [0.07, -0.15, 0.1] },
  meniscus: { pos: [0.6, 4.2, 2.7], target: [0, -0.45, 0], label: [-0.55, -0.43, 0.4] },
  cartilage: { pos: [3.5, 0.8, 4.3], target: [0, 0.1, 0], label: [0.5, -0.49, 0.35] },
  patella: { pos: [6.3, 0.5, 1.3], target: [0, 0, 0.35], label: [0, 0.05, 0.92] },
};

function CameraRig({ focus }: { focus: KneeFocus }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const look = useRef(new Vector3(...POSES[focus].target));
  const goalPos = useRef(new Vector3());
  const goalTarget = useRef(new Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const pose = POSES[focus];
    const aspect = size.width / Math.max(size.height, 1);
    const back = aspect < 1 ? 1 + (1 - aspect) * 0.9 : 1; // keep the joint in frame on portrait
    goalTarget.current.set(...pose.target);
    goalPos.current.set(...pose.pos).sub(goalTarget.current).multiplyScalar(back).add(goalTarget.current);
    dampVec3(camera.position, goalPos.current, 3, dt);
    dampVec3(look.current, goalTarget.current, 3, dt);
    camera.lookAt(look.current);
  });
  return null;
}

function Tag({ text, at }: { text: string; at: V3 }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <Html position={at} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div
        className="flex items-center gap-2 transition-all duration-500"
        style={{ opacity: on ? 1 : 0, transform: `translate(-6px, calc(-50% + ${on ? 0 : 6}px))` }}
      >
        <span className="size-3 shrink-0 rounded-full border-2 border-white bg-peach shadow-[0_0_0_4px_rgb(255_190_152/0.35)]" />
        <span
          className="glass whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium"
          style={{ color: "var(--fg)" }}
        >
          {text}
        </span>
      </div>
    </Html>
  );
}

function Sway({ children }: { children: React.ReactNode }) {
  const g = useRef<Group>(null);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.35) * 0.06;
  });
  return <group ref={g}>{children}</group>;
}

export interface KneeSceneProps extends SceneBaseProps {
  focus?: KneeFocus;
  labels?: Partial<Record<KneeFocus, string>>;
}

export default function KneeScene({ active, onReady, focus = "overview", labels }: KneeSceneProps) {
  const label = labels?.[focus];
  return (
    <Stage active={active} onReady={onReady} cameraPosition={POSES[focus].pos} shadowY={-3.0}>
      <CameraRig focus={focus} />
      <Sway>
        <KneeModel focus={focus} />
        {label && <Tag key={focus} text={label} at={POSES[focus].label} />}
      </Sway>
    </Stage>
  );
}
