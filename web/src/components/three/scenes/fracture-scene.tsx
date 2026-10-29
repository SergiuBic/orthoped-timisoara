"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import type { FracturePhase, SceneBaseProps } from "../types";
import {
  PLATE_RADIUS,
  PLATE_THICK,
  SCREW_XS,
  createCallus,
  createPlate,
  createScrew,
  createShaftPiece,
} from "./anatomy";
import { clamp01, damp, patch, smoothstep } from "./damp";
import { boneMaterial, glowMaterial, metalMaterial } from "./materials";
import { Stage } from "./stage";

/** Phase -> position on a single continuous progress axis (0..4). */
const PHASE_P: Record<FracturePhase, number> = { intact: 0, fracture: 1, reduction: 2, fixation: 3, healed: 4 };

const SCREW_TOP = PLATE_RADIUS + PLATE_THICK + 0.012;

function Fracture({ phase }: { phase: FracturePhase }) {
  const geo = useMemo(
    () => ({
      a: createShaftPiece(-1),
      b: createShaftPiece(1),
      callus: createCallus(),
      plate: createPlate(),
      screw: createScrew(),
    }),
    [],
  );
  const mats = useMemo(() => {
    const plate = metalMaterial();
    plate.transparent = true;
    const ring = {
      color: "#FFBE98",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    };
    return { bone: boneMaterial(), plate, callus: glowMaterial(), ring, screws: metalMaterial() };
  }, []);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      (["bone", "plate", "callus", "screws"] as const).forEach((k) => mats[k].dispose());
    },
    [geo, mats],
  );

  const root = useRef<Group>(null);
  const pieceA = useRef<Group>(null);
  const pieceB = useRef<Group>(null);
  const plateGroup = useRef<Group>(null);
  const callus = useRef<Mesh>(null);
  const ringMesh = useRef<Mesh>(null);
  const screws = useRef<(Group | null)[]>([]);
  const progress = useRef(PHASE_P[phase]);
  const shock = useRef(10); // seconds since the fracture pulse started (>= 1.2 = idle)
  const prevPhase = useRef(phase);

  useEffect(() => {
    if (phase === "fracture" && prevPhase.current !== "fracture") shock.current = 0;
    prevPhase.current = phase;
  }, [phase]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = (progress.current = damp(progress.current, PHASE_P[phase], 2.2, dt));

    // Separation: 0 -> 1 on the way to "fracture", back to 0 by "reduction".
    const f = smoothstep(p, 0, 1) - smoothstep(p, 1, 2);
    if (pieceA.current) {
      pieceA.current.position.set(-0.32 * f, -0.2 * f, 0.05 * f);
      pieceA.current.rotation.set(0.1 * f, 0.12 * f, 0.15 * f);
    }
    if (pieceB.current) {
      pieceB.current.position.set(0.32 * f, 0.18 * f, -0.05 * f);
      pieceB.current.rotation.set(-0.12 * f, -0.14 * f, -0.12 * f);
    }

    // Plate slides in, screws spin in staggered, then the plate goes subtle.
    const pl = smoothstep(p, 2.0, 2.4);
    const subtle = smoothstep(p, 3.2, 4);
    if (plateGroup.current) {
      plateGroup.current.visible = pl > 0.001;
      plateGroup.current.position.z = (1 - pl) * 1.1;
    }
    patch(mats.plate, { opacity: pl * (1 - 0.42 * subtle) });
    screws.current.forEach((g, i) => {
      if (!g) return;
      const sp = smoothstep(p, 2.35 + i * 0.07, 2.65 + i * 0.07);
      g.visible = sp > 0.001;
      g.position.z = SCREW_TOP + (1 - sp) * 0.7;
      g.rotation.z = (1 - sp) * Math.PI * 7;
    });

    // Callus: glows up and fades away while healing.
    const cal = smoothstep(p, 3.05, 3.45) * (1 - smoothstep(p, 3.5, 4));
    patch(mats.callus, { opacity: cal * 0.55, emissiveIntensity: 0.6 + 0.4 * Math.sin(s.clock.elapsedTime * 3) });
    if (callus.current) callus.current.visible = cal > 0.01;

    // Shock ring pulse when the bone breaks.
    shock.current += dt;
    const rt = clamp01(shock.current / 1.1);
    if (ringMesh.current) {
      ringMesh.current.visible = rt < 1;
      ringMesh.current.scale.setScalar(0.6 + rt * 2.4);
      patch(ringMesh.current.material as MeshBasicMaterial, { opacity: (1 - rt) * (1 - rt) * 0.85 });
    }

    if (root.current) {
      root.current.rotation.y = -0.25 + s.pointer.x * 0.08;
      root.current.rotation.x = 0.14 - s.pointer.y * 0.05;
    }
  });

  return (
    <group ref={root} rotation={[0.14, -0.25, 0.06]}>
      <group ref={pieceA}>
        <mesh geometry={geo.a} material={mats.bone as MeshPhysicalMaterial} />
      </group>
      <group ref={pieceB}>
        <mesh geometry={geo.b} material={mats.bone as MeshPhysicalMaterial} />
      </group>
      <mesh ref={callus} geometry={geo.callus} material={mats.callus as MeshStandardMaterial} visible={false} />
      <mesh ref={ringMesh} rotation={[0, Math.PI / 2, 0]} visible={false}>
        <ringGeometry args={[0.5, 0.56, 64]} />
        <meshBasicMaterial {...mats.ring} />
      </mesh>
      <group ref={plateGroup} visible={false}>
        <mesh geometry={geo.plate} material={mats.plate} />
      </group>
      {SCREW_XS.map((x, i) => (
        <group
          key={x}
          position={[x, 0, SCREW_TOP + 0.7]}
          ref={(el) => {
            screws.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={geo.screw} material={mats.screws} />
        </group>
      ))}
    </group>
  );
}

export default function FractureScene({ active, onReady, phase = "intact" }: SceneBaseProps & { phase?: FracturePhase }) {
  return (
    <Stage active={active} onReady={onReady} cameraPosition={[0.6, 0.9, 8.4]} shadowY={-1.7}>
      <Fracture phase={phase} />
    </Stage>
  );
}
