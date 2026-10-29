"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Box3, type Group } from "three";
import type { SceneBaseProps } from "../types";
import { damp } from "./damp";
import { boneMaterial, patchMaterial, setXrayTheme, xrayMaterial } from "./materials";
import { preloadModel, useBoneGeometries } from "./models";
import { Stage } from "./stage";
import { useDark } from "./theme";

const MAX_TILT = (9 * Math.PI) / 180;
const NAMES = ["hipbone", "femur", "tibia", "fibula", "patella", "foot"] as const;
const KNEE_RADIUS = 3.1; // object units (1 = 5 cm) of solid bone around the joint

/** Solid ivory bone that dissolves (with a glowing edge) into the hologram away from the knee. */
function heroBone() {
  const m = boneMaterial();
  const uniforms = { uR: { value: KNEE_RADIUS }, uPulse: { value: 0 } };
  patchMaterial(m, {
    key: "hero-dissolve",
    uniforms,
    decl: /* glsl */ `
      uniform float uR; uniform float uPulse;
      float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
        return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }`,
    early: /* glsl */ `
      float dd = abs(vOP.y) + vn(vOP * 4.5) * 0.75;
      if (dd > uR) discard;`,
    late: /* glsl */ `
      float edge = smoothstep(uR - 0.5, uR, dd);
      outgoingLight += vec3(1.0, 0.62, 0.38) * edge * (1.3 + uPulse);`,
  });
  return { m, uniforms };
}

function Leg() {
  const g = useBoneGeometries("leg", NAMES);
  const dark = useDark();
  const group = useRef<Group>(null);
  const tilt = useRef({ x: 0, y: 0, px: 0, py: 0, gx: 0, gy: 0, hasGyro: false });
  const viewport = useThree((s) => s.size);

  const { solid, pulse, xray, box } = useMemo(() => {
    const b = new Box3();
    for (const n of NAMES) {
      g[n].computeBoundingBox();
      b.union(g[n].boundingBox!);
    }
    const hb = heroBone();
    return { solid: hb.m, pulse: hb.uniforms.uPulse, xray: xrayMaterial(), box: b };
  }, [g]);
  useEffect(() => {
    setXrayTheme(xray, dark);
    xray.uniforms.uPower.value = dark ? 2.2 : 1.8;
  }, [xray, dark]);
  useEffect(
    () => () => {
      solid.dispose();
      xray.dispose();
    },
    [solid, xray],
  );

  // pointer + device-orientation parallax (the canvas itself is pointer-events:none behind the page)
  useEffect(() => {
    const t = tilt.current;
    const onMove = (e: PointerEvent) => {
      t.px = (e.clientX / window.innerWidth) * 2 - 1;
      t.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      t.hasGyro = true;
      t.gx = Math.max(-1, Math.min(1, e.gamma / 30));
      t.gy = Math.max(-1, Math.min(1, (e.beta - 50) / 30));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  // fit the whole leg into the box
  const height = box.max.y - box.min.y;
  const fit = useMemo(() => {
    const aspect = viewport.width / Math.max(viewport.height, 1);
    const visH = 2 * 12 * Math.tan((32 * Math.PI) / 360); // camera at z=12
    const visW = visH * aspect;
    const width = Math.max(box.max.x - box.min.x, 4);
    const s = Math.min((visH * 0.9) / height, (visW * 0.9) / (width * 1.15));
    return { s, cy: (box.max.y + box.min.y) / 2 };
  }, [viewport, box, height]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = tilt.current;
    const tx = t.hasGyro ? t.gx : t.px;
    const ty = t.hasGyro ? t.gy : t.py;
    t.y = damp(t.y, tx * MAX_TILT, 3, dt);
    t.x = damp(t.x, ty * MAX_TILT, 3, dt);
    const el = s.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = -0.5 + el * 0.14 + t.y;
      group.current.rotation.x = t.x * 0.6;
    }
    xray.uniforms.uTime.value = el;
    pulse.value = 0.35 * Math.sin(el * 1.8);
  });

  return (
    <group position={[0, -fit.cy * fit.s, 0]} scale={fit.s} rotation={[0, 0, 0.14]}>
      <group ref={group}>
        {NAMES.map((n) => (
          <group key={n}>
            <mesh geometry={g[n]} material={solid} />
            <mesh geometry={g[n]} material={xray} renderOrder={2} />
          </group>
        ))}
      </group>
    </group>
  );
}

export default function HeroScene({ active, onReady }: SceneBaseProps) {
  useEffect(() => preloadModel("leg"), []);
  return (
    <Stage active={active} onReady={onReady} cameraPosition={[0, 0, 12]}>
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.35} floatingRange={[-0.08, 0.08]}>
        <Leg />
      </Float>
      <Sparkles count={46} scale={[5, 6.5, 3.5]} size={3} speed={0.22} opacity={0.75} color="#FFBE98" />
    </Stage>
  );
}
