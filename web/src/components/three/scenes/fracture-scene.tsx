"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, LatheGeometry, Vector2, Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";
import type { FracturePhase, SceneBaseProps } from "../types";
import { PLATE_THICK, createPlate, createScrew } from "./anatomy";
import { clamp01, damp, patch, smoothstep } from "./damp";
import { ShaftProfile } from "./fit";
import { boneMaterial, glowMaterial, patchMaterial, titaniumMaterial } from "./materials";
import { preloadModel, useBoneGeometries } from "./models";
import { Stage } from "./stage";

/** Phase -> position on a single continuous progress axis (0..4). */
const PHASE_P: Record<FracturePhase, number> = { intact: 0, fracture: 1, reduction: 2, fixation: 3, healed: 4 };

/** Height of the break along the tibia (object units, 0 = bone centre) and azimuth of the plate. */
const CUT_Y = -0.35;
const PLATE_PHI = Math.PI / 6; // antero-medial face
const PLATE_LEN = 3.1;
const SCREW_YS = [-1.2, -0.85, -0.5, 0.5, 0.85, 1.2];

const CUT_GLSL = /* glsl */ `
  uniform vec3 uCut; uniform float uSide;
  float jag(vec3 p) {
    vec2 q = p.xz - uCut.xz;
    float th = atan(q.y, q.x);
    float tri = abs(fract(th * 1.1141 + 0.13) * 2.0 - 1.0);
    return 0.14 * (tri * 2.0 - 1.0) + 0.34 * cos(th - 0.8) + 0.05 * sin(th * 11.0);
  }
  float cutD(vec3 p) { return p.y - (uCut.y + jag(p)); }`;

/** Bone that is only drawn on one side of a jagged break; the hollow inside is painted as marrow/cancellous bone. */
function cutBoneMaterial(side: 1 | -1, cut: Vector3) {
  const m = boneMaterial();
  m.side = DoubleSide;
  const uniforms = { uCut: { value: cut }, uSide: { value: side } };
  patchMaterial(m, {
    key: "tibia-cut",
    uniforms,
    decl: CUT_GLSL,
    early: "if (cutD(vOP) * uSide < 0.0) discard;",
    after: /* glsl */ `
      if (!gl_FrontFacing) {
        float sp = fract(sin(dot(floor(vOP.xz * 46.0 + vOP.y * 9.0), vec2(12.9898, 78.233))) * 43758.5453);
        vec3 marrow = mix(vec3(0.46, 0.17, 0.12), vec3(0.80, 0.46, 0.34), sp * 0.6 + 0.1);
        gl_FragColor = vec4(marrow, 1.0);
      }`,
  });
  return m;
}

function Fracture({ phase }: { phase: FracturePhase }) {
  const { tibia } = useBoneGeometries("tibia", ["tibia"] as const);

  const fit = useMemo(() => {
    const prof = new ShaftProfile(tibia);
    const c = prof.centre(CUT_Y);
    const cut = new Vector3(c.x, CUT_Y, c.z);
    const liftAt = (y: number) => prof.radius(CUT_Y + y, c.x, c.z, PLATE_PHI, 0.05, 0.3);
    // sample once; plate follows the real, tapering shaft
    const table = Array.from({ length: 33 }, (_, i) => liftAt(-PLATE_LEN / 2 + (i / 32) * PLATE_LEN));
    const smooth = table.map((_, i) => {
      let s = 0;
      let n = 0;
      for (let k = -3; k <= 3; k++) {
        const v = table[i + k];
        if (v > 0) {
          s += v;
          n++;
        }
      }
      return n ? s / n : c.r;
    });
    const lift = (y: number) => {
      const t = clamp01((y + PLATE_LEN / 2) / PLATE_LEN) * 32;
      const i = Math.min(31, Math.floor(t));
      return smooth[i] + (smooth[i + 1] - smooth[i]) * (t - i) + 0.012;
    };
    return { cut, r: c.r, lift };
  }, [tibia]);

  const geo = useMemo(() => {
    const prof = [] as Vector2[];
    for (let k = -18; k <= 18; k++) {
      const y = k * 0.075;
      prof.push(new Vector2(fit.r * 1.08 + 0.2 * Math.exp(-Math.pow(y / 0.55, 2)), y));
    }
    return {
      callus: new LatheGeometry(prof, 40),
      plate: createPlate(PLATE_LEN, 0.34, SCREW_YS, fit.lift),
      screw: createScrew(),
    };
  }, [fit]);

  const mats = useMemo(() => {
    const plate = titaniumMaterial();
    plate.transparent = true;
    return {
      a: cutBoneMaterial(1, fit.cut),
      b: cutBoneMaterial(-1, fit.cut),
      plate,
      screws: titaniumMaterial(),
      callus: glowMaterial(),
      ring: { color: "#FFBE98", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: DoubleSide },
    };
  }, [fit]);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      (["a", "b", "plate", "screws", "callus"] as const).forEach((k) => mats[k].dispose());
    },
    [geo, mats],
  );

  const pieceA = useRef<Group>(null);
  const pieceB = useRef<Group>(null);
  const plateGroup = useRef<Group>(null);
  const callus = useRef<Mesh>(null);
  const ringMesh = useRef<Mesh>(null);
  const screws = useRef<(Group | null)[]>([]);
  const spin = useRef<Group>(null);
  const progress = useRef(PHASE_P[phase]);
  const shock = useRef(10); // seconds since the fracture pulse started (>= 1.2 = idle)
  const prevPhase = useRef(phase);
  const ptr = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (phase === "fracture" && prevPhase.current !== "fracture") shock.current = 0;
    prevPhase.current = phase;
  }, [phase]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = (progress.current = damp(progress.current, PHASE_P[phase], 2.2, dt));

    // Separation: 0 -> 1 on the way to "fracture", back to 0 by "reduction".
    const f = smoothstep(p, 0, 1) - smoothstep(p, 1, 2);
    const c = fit.cut;
    if (pieceA.current) {
      pieceA.current.position.set(c.x + 0.12 * f, c.y + 0.5 * f, c.z + 0.08 * f);
      pieceA.current.rotation.set(0.1 * f, 0.1 * f, -0.2 * f);
    }
    if (pieceB.current) {
      pieceB.current.position.set(c.x - 0.1 * f, c.y - 0.45 * f, c.z - 0.06 * f);
      pieceB.current.rotation.set(-0.1 * f, -0.12 * f, 0.16 * f);
    }

    // Plate slides in, screws spin in staggered, then the plate goes subtle.
    const pl = smoothstep(p, 2.0, 2.4);
    const subtle = smoothstep(p, 3.2, 4);
    if (plateGroup.current) {
      plateGroup.current.visible = pl > 0.001;
      plateGroup.current.position.z = (1 - pl) * 1.1;
    }
    patch(mats.plate, { opacity: pl * (1 - 0.45 * subtle) });
    screws.current.forEach((g, i) => {
      if (!g) return;
      const sp = smoothstep(p, 2.35 + i * 0.07, 2.65 + i * 0.07);
      g.visible = sp > 0.001;
      g.position.z = fit.lift(SCREW_YS[i]) + PLATE_THICK + 0.004 + (1 - sp) * 0.7;
      g.rotation.z = (1 - sp) * Math.PI * 7;
    });

    // Callus: glows up and fades away while healing.
    const cal = smoothstep(p, 3.05, 3.45) * (1 - smoothstep(p, 3.5, 4));
    patch(mats.callus, { opacity: cal * 0.5, emissiveIntensity: 0.6 + 0.4 * Math.sin(s.clock.elapsedTime * 3) });
    if (callus.current) callus.current.visible = cal > 0.01;

    // Shock: expanding ring + both bone ends flare when the bone breaks.
    shock.current += dt;
    const rt = clamp01(shock.current / 1.2);
    const flare = (1 - rt) * (1 - rt);
    mats.a.emissiveIntensity = mats.b.emissiveIntensity = flare * 0.6;
    if (ringMesh.current) {
      ringMesh.current.visible = rt < 1;
      ringMesh.current.scale.setScalar(0.5 + rt * 2.2);
      patch(ringMesh.current.material as MeshBasicMaterial, { opacity: flare * 0.8 });
    }

    if (spin.current) {
      spin.current.rotation.y = PLATE_PHI - Math.PI / 2 - 0.25 + ptr.current.x * 0.12 + Math.sin(s.clock.elapsedTime * 0.3) * 0.05;
      spin.current.rotation.x = ptr.current.y * 0.05;
    }
  });

  const c = fit.cut;
  return (
    <group rotation={[0, 0, Math.PI / 2 - 0.2]}>
      <group ref={spin}>
        <group position={[-c.x, -c.y, -c.z]}>
          <group ref={pieceA}>
            <group position={[-c.x, -c.y, -c.z]}>
              <mesh geometry={tibia} material={mats.a} />
            </group>
          </group>
          <group ref={pieceB}>
            <group position={[-c.x, -c.y, -c.z]}>
              <mesh geometry={tibia} material={mats.b} />
            </group>
          </group>
          <mesh ref={callus} geometry={geo.callus} material={mats.callus} position={[c.x, c.y, c.z]} visible={false} />
          <mesh ref={ringMesh} position={[c.x, c.y, c.z]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
            <ringGeometry args={[fit.r * 1.1, fit.r * 1.1 + 0.07, 64]} />
            <meshBasicMaterial {...mats.ring} />
          </mesh>
          <group position={[c.x, c.y, c.z]} rotation={[0, Math.PI / 2 - PLATE_PHI, 0]}>
            <group ref={plateGroup} visible={false}>
              <mesh geometry={geo.plate} material={mats.plate} />
            </group>
            {SCREW_YS.map((y, i) => (
              <group
                key={y}
                position={[0, y, fit.lift(y) + PLATE_THICK + 0.7]}
                ref={(el) => {
                  screws.current[i] = el;
                }}
                visible={false}
              >
                <mesh geometry={geo.screw} material={mats.screws} />
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

export default function FractureScene({ active, onReady, phase = "intact" }: SceneBaseProps & { phase?: FracturePhase }) {
  useEffect(() => preloadModel("tibia"), []);
  return (
    <Stage active={active} onReady={onReady} cameraPosition={[0, 0.4, 7.2]} shadowY={-1.9} floorSize={8}>
      <Fracture phase={phase} />
    </Stage>
  );
}
