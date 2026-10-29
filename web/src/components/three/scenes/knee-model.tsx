"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type BufferGeometry, type Group, type Material, type MeshPhysicalMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { KneeFocus } from "../types";
import { createLigament, createMeniscus, extractPatch } from "./anatomy";
import { damp, patch } from "./damp";
import { computeKneeLandmarks, type KneeLandmarks } from "./fit";
import {
  boneMaterial,
  cartilageMaterial,
  ligamentMaterial,
  meniscusMaterial,
  setXrayTheme,
  xrayMaterial,
} from "./materials";
import { useBoneGeometries } from "./models";
import { Tag } from "./tag";
import { useDark } from "./theme";

type PartKey = "femur" | "tibia" | "fibula" | "patella" | "cart" | "menisci" | "acl" | "pcl";
const PARTS: PartKey[] = ["femur", "tibia", "fibula", "patella", "cart", "menisci", "acl", "pcl"];
const BONES: PartKey[] = ["femur", "tibia", "fibula", "patella"];
const BASE_OPACITY: Record<PartKey, number> = { femur: 1, tibia: 1, fibula: 1, patella: 1, cart: 0.66, menisci: 1, acl: 1, pcl: 1 };

/** Solid visibility (0..1) of every part per focus. Bones that fade out are replaced by the x-ray look. */
const VIS: Record<KneeFocus, Record<PartKey, number>> = {
  overview: { femur: 1, tibia: 1, fibula: 1, patella: 1, cart: 1, menisci: 1, acl: 1, pcl: 1 },
  acl: { femur: 0, tibia: 0, fibula: 0, patella: 0, cart: 0.12, menisci: 0.35, acl: 1, pcl: 0.5 },
  meniscus: { femur: 0, tibia: 0.75, fibula: 0.2, patella: 0, cart: 0.25, menisci: 1, acl: 0, pcl: 0 },
  cartilage: { femur: 0, tibia: 0, fibula: 0, patella: 0, cart: 1, menisci: 0.3, acl: 0, pcl: 0 },
  patella: { femur: 0, tibia: 0, fibula: 0, patella: 1, cart: 0.5, menisci: 0.2, acl: 0, pcl: 0 },
};
const XRAY: Record<KneeFocus, number> = { overview: 0, acl: 0.75, meniscus: 0.8, cartilage: 0.7, patella: 0.75 };
const GLOW: Record<KneeFocus, PartKey[]> = {
  overview: [],
  acl: ["acl"],
  meniscus: ["menisci"],
  cartilage: ["cart"],
  patella: ["patella"],
};
const LIFT: Record<KneeFocus, number> = { overview: 0, acl: 0, meniscus: 1.5, cartilage: 0.7, patella: 0 };
const FLEX: Record<KneeFocus, number> = { overview: 0, acl: 0, meniscus: 0, cartilage: 0, patella: 40 };
const GLOW_PEAK = 0.55;

export interface KneeData {
  geo: Record<"femur" | "tibia" | "fibula" | "patella", BufferGeometry>;
  lm: KneeLandmarks;
  tissue: Record<"cartF" | "cartT" | "cartP" | "menisci" | "acl" | "pcl", BufferGeometry>;
}

/** Loads the real bones and fits the soft tissue to them. Suspends until the GLB is ready. */
export function useKneeData(): KneeData {
  const geo = useBoneGeometries("knee", ["femur", "tibia", "fibula", "patella"] as const);
  const data = useMemo<KneeData>(() => {
    const lm = computeKneeLandmarks(geo);
    const f0 = lm.femurMinY;
    const cartF = extractPatch(
      geo.femur,
      (c, n) => {
        if (c.y > f0 + 1.3) return false;
        if (Math.abs(c.x - lm.notchX) < 0.1 && c.y > f0 + 0.25) return false;
        return n.y < -0.25 || (n.z < -0.45 && c.y < f0 + 1.1) || (n.z > 0.4 && c.y > f0 + 0.3 && Math.abs(c.x - lm.notchX) < 0.8);
      },
      0.028,
    );
    const yPlate = Math.min(lm.medial.y, lm.lateral.y);
    const cartT = extractPatch(
      geo.tibia,
      (c, n) => n.y > 0.72 && c.y > yPlate - 0.07 && Math.hypot(c.x - lm.spine.x, c.z - lm.spine.z) > 0.14,
      0.02,
    );
    const cartP = extractPatch(geo.patella, (_c, n) => n.z < -0.35, 0.022);
    const mk = (c: typeof lm.medial, open: number, gap: number, wScale: number) =>
      createMeniscus({
        cx: c.cx,
        cz: c.cz,
        y: c.y + 0.015,
        rx: c.rx * 0.97,
        rz: c.rz * 0.97,
        open,
        gap,
        width: c.rx * wScale,
        height: 0.17,
      });
    const toMid = lm.latSign > 0 ? 0 : Math.PI;
    const medialM = mk(lm.medial, toMid, 1.05, 0.5);
    const lateralM = mk(lm.lateral, toMid + Math.PI, 0.55, 0.42);
    const menisci = mergeGeometries([medialM, lateralM])!;
    const bow = (s: number) => new Vector3(0.02 * s, 0, 0.02 * s);
    const acl = createLigament(lm.aclFemoral, lm.aclTibial, 0.075, 1.4, bow(1));
    const pcl = createLigament(lm.pclFemoral, lm.pclTibial, 0.09, 1.1, bow(-1));
    [medialM, lateralM].forEach((g) => g.dispose());
    return { geo, lm, tissue: { cartF, cartT, cartP, menisci, acl, pcl } };
  }, [geo]);
  useEffect(
    () => () => {
      Object.values(data.tissue).forEach((g) => g.dispose());
    },
    [data],
  );
  return data;
}

export interface KneeModelProps {
  data: KneeData;
  focus: KneeFocus;
  label?: string;
}

/** The knee: real bones + fitted soft tissue. Highlight / x-ray / lift / flex are all damped per frame. */
export function KneeModel({ data, focus, label }: KneeModelProps) {
  const { geo, lm, tissue } = data;
  const dark = useDark();
  const mats = useMemo(() => {
    const bone = boneMaterial();
    const solid: Record<PartKey, MeshPhysicalMaterial> = {
      femur: bone,
      tibia: bone.clone(),
      fibula: bone.clone(),
      patella: bone.clone(),
      cart: cartilageMaterial(),
      menisci: meniscusMaterial(),
      acl: ligamentMaterial(),
      pcl: ligamentMaterial(),
    };
    const xray = Object.fromEntries(BONES.map((k) => [k, xrayMaterial()])) as Record<string, ReturnType<typeof xrayMaterial>>;
    return { solid, xray };
  }, []);
  useEffect(() => {
    Object.values(mats.xray).forEach((m) => setXrayTheme(m, dark));
  }, [mats, dark]);
  useEffect(
    () => () => {
      [...Object.values(mats.solid), ...Object.values(mats.xray)].forEach((m: Material) => m.dispose());
    },
    [mats],
  );

  const state = useRef<{
    lift: number;
    flex: number;
    xray: number;
    vis: Record<PartKey, number>;
    glow: Record<PartKey, number>;
    transparent: Record<PartKey, boolean>;
  } | null>(null);
  if (state.current == null) {
    state.current = {
      lift: LIFT[focus],
      flex: (FLEX[focus] * Math.PI) / 180,
      xray: XRAY[focus],
      vis: { ...VIS[focus] },
      glow: Object.fromEntries(PARTS.map((k) => [k, GLOW[focus].includes(k) ? 1 : 0])) as Record<PartKey, number>,
      transparent: Object.fromEntries(PARTS.map((k) => [k, false])) as Record<PartKey, boolean>,
    };
  }

  const femurGroup = useRef<Group>(null);
  const tibiaGroup = useRef<Group>(null);
  const patellaGroup = useRef<Group>(null);
  const pivot = lm.pivot;
  const negPivot = useMemo(() => pivot.clone().multiplyScalar(-1), [pivot]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const st = state.current!;
    const flexTarget = (FLEX[focus] * Math.PI) / 180;
    st.lift = damp(st.lift, LIFT[focus], 2.6, dt);
    st.flex = damp(st.flex, flexTarget, 2.6, dt);
    st.xray = damp(st.xray, XRAY[focus], 4, dt);
    if (femurGroup.current) femurGroup.current.position.y = st.lift;
    if (tibiaGroup.current) tibiaGroup.current.rotation.x = st.flex;
    if (patellaGroup.current) patellaGroup.current.rotation.x = st.flex * 0.55;

    const t = s.clock.elapsedTime;
    const pulse = 0.75 + 0.25 * Math.sin(t * 2.6);
    for (const k of PARTS) {
      const m = mats.solid[k];
      st.vis[k] = damp(st.vis[k], VIS[focus][k], 4, dt);
      st.glow[k] = damp(st.glow[k], GLOW[focus].includes(k) ? 1 : 0, 4, dt);
      const op = st.vis[k] * BASE_OPACITY[k];
      const transparent = op < 0.995;
      if (transparent !== st.transparent[k]) {
        st.transparent[k] = transparent;
        patch(m, { transparent: transparent || k === "cart", depthWrite: !transparent || op > 0.9, needsUpdate: true });
      }
      patch(m, { opacity: op, visible: op > 0.01, emissiveIntensity: st.glow[k] * GLOW_PEAK * pulse });
      if (k in mats.xray) {
        const x = mats.xray[k];
        const a = (1 - st.vis[k]) * st.xray;
        x.visible = a > 0.01;
        x.uniforms.uOpacity.value = a;
        x.uniforms.uTime.value = t;
      }
    }
  });

  const mesh = (k: "femur" | "tibia" | "fibula" | "patella") => (
    <>
      <mesh geometry={geo[k]} material={mats.solid[k]} />
      <mesh geometry={geo[k]} material={mats.xray[k]} renderOrder={2} />
    </>
  );
  const at = (v: Vector3): [number, number, number] => [v.x, v.y, v.z];
  const mid = lm.aclFemoral.clone().lerp(lm.aclTibial, 0.5);

  return (
    <group>
      <group ref={femurGroup}>
        {mesh("femur")}
        <mesh geometry={tissue.cartF} material={mats.solid.cart} />
        <group ref={patellaGroup} position={pivot}>
          <group position={negPivot}>
            {mesh("patella")}
            <mesh geometry={tissue.cartP} material={mats.solid.cart} />
            {label && focus === "patella" && <Tag key="p" text={label} at={at(lm.patellaFront)} />}
          </group>
        </group>
        {label && focus === "cartilage" && <Tag key="c" text={label} at={at(lm.medialCondyle)} />}
      </group>
      <group ref={tibiaGroup} position={pivot}>
        <group position={negPivot}>
          {mesh("tibia")}
          {mesh("fibula")}
          <mesh geometry={tissue.cartT} material={mats.solid.cart} />
          <mesh geometry={tissue.menisci} material={mats.solid.menisci} />
          {label && focus === "meniscus" && <Tag key="m" text={label} at={at(lm.meniscusRim)} />}
        </group>
      </group>
      <mesh geometry={tissue.acl} material={mats.solid.acl} />
      <mesh geometry={tissue.pcl} material={mats.solid.pcl} />
      {label && focus === "acl" && <Tag key="a" text={label} at={at(mid)} />}
    </group>
  );
}
