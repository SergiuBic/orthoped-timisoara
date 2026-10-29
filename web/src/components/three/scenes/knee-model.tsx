"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group, type MeshPhysicalMaterial } from "three";
import type { KneeFocus } from "../types";
import {
  ACL_ENDS,
  KNEE_PIVOT,
  PATELLA_POS,
  PCL_ENDS,
  createFemoralCartilage,
  createFemur,
  createFibula,
  createLigament,
  createMenisci,
  createPatella,
  createTibia,
  createTibialCartilage,
} from "./anatomy";
import { damp, patch } from "./damp";
import { boneMaterial, cartilageMaterial, ligamentMaterial, meniscusMaterial } from "./materials";

type PartKey = "femur" | "tibia" | "patella" | "cart" | "menisci" | "acl" | "pcl";
const PARTS: PartKey[] = ["femur", "tibia", "patella", "cart", "menisci", "acl", "pcl"];
const BASE_OPACITY: Record<PartKey, number> = { femur: 1, tibia: 1, patella: 1, cart: 0.6, menisci: 1, acl: 1, pcl: 1 };

/** Visibility (0..1) of every part per focus. */
const VIS: Record<KneeFocus, Record<PartKey, number>> = {
  overview: { femur: 1, tibia: 1, patella: 1, cart: 1, menisci: 1, acl: 1, pcl: 1 },
  acl: { femur: 0.3, tibia: 0.3, patella: 0.1, cart: 0.25, menisci: 0.3, acl: 1, pcl: 0.45 },
  meniscus: { femur: 0.07, tibia: 0.5, patella: 0.07, cart: 0.3, menisci: 1, acl: 0, pcl: 0 },
  cartilage: { femur: 0.35, tibia: 0.35, patella: 0.2, cart: 1, menisci: 0.3, acl: 0, pcl: 0 },
  patella: { femur: 0.45, tibia: 0.45, patella: 1, cart: 0.3, menisci: 0.3, acl: 0, pcl: 0 },
};
const GLOW: Record<KneeFocus, PartKey[]> = {
  overview: [],
  acl: ["acl"],
  meniscus: ["menisci"],
  cartilage: ["cart"],
  patella: ["patella"],
};
const LIFT: Record<KneeFocus, number> = { overview: 0, acl: 0, meniscus: 1.5, cartilage: 0.8, patella: 0 };
const GLOW_PEAK = 0.6;

const negPivot = KNEE_PIVOT.clone().multiplyScalar(-1);
const patellaLocal = PATELLA_POS.clone().sub(KNEE_PIVOT);

export interface KneeModelProps {
  focus: KneeFocus;
  /** Override knee flexion in degrees (default: 40 for the patella focus, else 0). */
  flexDeg?: number;
}

/** The whole procedural knee. Highlight / dim / explode / flex are all damped per frame. */
export function KneeModel({ focus, flexDeg }: KneeModelProps) {
  const geo = useMemo(
    () => ({
      femur: createFemur(),
      tibia: createTibia(),
      fibula: createFibula(),
      patella: createPatella(),
      cartF: createFemoralCartilage(),
      cartT: createTibialCartilage(),
      menisci: createMenisci(),
      acl: createLigament(ACL_ENDS[0], ACL_ENDS[1], 0.055, 1.5, new Vector3(0.03, 0, 0.03)),
      pcl: createLigament(PCL_ENDS[0], PCL_ENDS[1], 0.065, 1.2, new Vector3(-0.03, 0, -0.03)),
    }),
    [],
  );
  const mats = useMemo<Record<PartKey, MeshPhysicalMaterial>>(() => {
    const bone = boneMaterial();
    return {
      femur: bone,
      tibia: bone.clone(),
      patella: bone.clone(),
      cart: cartilageMaterial(),
      menisci: meniscusMaterial(),
      acl: ligamentMaterial(),
      pcl: ligamentMaterial(),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );

  const state = useRef<{
    lift: number;
    flex: number;
    vis: Record<PartKey, number>;
    glow: Record<PartKey, number>;
    transparent: Record<PartKey, boolean>;
  } | null>(null);
  if (state.current == null) {
    state.current = {
      lift: LIFT[focus],
      flex: ((flexDeg ?? (focus === "patella" ? 40 : 0)) * Math.PI) / 180,
      vis: { ...VIS[focus] },
      glow: Object.fromEntries(PARTS.map((k) => [k, GLOW[focus].includes(k) ? 1 : 0])) as Record<PartKey, number>,
      transparent: Object.fromEntries(PARTS.map((k) => [k, false])) as Record<PartKey, boolean>,
    };
  }

  const femurGroup = useRef<Group>(null);
  const tibiaGroup = useRef<Group>(null);
  const patellaGroup = useRef<Group>(null);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const st = state.current!;
    const flexTarget = ((flexDeg ?? (focus === "patella" ? 40 : 0)) * Math.PI) / 180;
    st.lift = damp(st.lift, LIFT[focus], 3, dt);
    st.flex = damp(st.flex, flexTarget, 3, dt);
    if (femurGroup.current) femurGroup.current.position.y = st.lift;
    if (tibiaGroup.current) tibiaGroup.current.rotation.x = st.flex;
    if (patellaGroup.current) patellaGroup.current.rotation.x = st.flex * 0.55;

    const pulse = 0.8 + 0.2 * Math.sin(s.clock.elapsedTime * 2.6);
    for (const k of PARTS) {
      const m = mats[k];
      st.vis[k] = damp(st.vis[k], VIS[focus][k], 4, dt);
      st.glow[k] = damp(st.glow[k], GLOW[focus].includes(k) ? 1 : 0, 4, dt);
      const op = st.vis[k] * BASE_OPACITY[k];
      const transparent = op < 0.995;
      if (transparent !== st.transparent[k]) {
        st.transparent[k] = transparent;
        patch(m, { transparent: transparent || k === "cart", depthWrite: !transparent || op > 0.9, needsUpdate: true });
      }
      patch(m, { opacity: op, visible: op > 0.01, emissiveIntensity: st.glow[k] * GLOW_PEAK * pulse });
    }
  });

  return (
    <group>
      <group ref={femurGroup}>
        <mesh geometry={geo.femur} material={mats.femur} />
        <mesh geometry={geo.cartF} material={mats.cart} />
        <group ref={patellaGroup} position={KNEE_PIVOT}>
          <mesh geometry={geo.patella} material={mats.patella} position={patellaLocal} />
        </group>
      </group>
      <group ref={tibiaGroup} position={KNEE_PIVOT}>
        <group position={negPivot}>
          <mesh geometry={geo.tibia} material={mats.tibia} />
          <mesh geometry={geo.fibula} material={mats.tibia} />
          <mesh geometry={geo.cartT} material={mats.cart} />
          <mesh geometry={geo.menisci} material={mats.menisci} />
        </group>
      </group>
      <mesh geometry={geo.acl} material={mats.acl} />
      <mesh geometry={geo.pcl} material={mats.pcl} />
    </group>
  );
}
