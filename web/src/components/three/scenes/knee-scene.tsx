"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Spherical, Vector3 } from "three";
import type { KneeFocus, SceneBaseProps } from "../types";
import { damp, dampVec3 } from "./damp";
import type { KneeLandmarks } from "./fit";
import { KneeModel, useKneeData } from "./knee-model";
import { preloadModel } from "./models";
import { Stage } from "./stage";

interface Pose {
  pos: Vector3;
  target: Vector3;
}

/** Camera poses, derived from the fitted landmarks (so they follow the real geometry). */
function buildPoses(lm: KneeLandmarks): Record<KneeFocus, Pose> {
  const aclMid = lm.aclFemoral.clone().lerp(lm.aclTibial, 0.5);
  const mk = (target: Vector3, off: [number, number, number]): Pose => ({
    target,
    pos: target.clone().add(new Vector3(...off)),
  });
  const s = lm.latSign;
  return {
    overview: mk(new Vector3(0, 0.15, 0), [-s * 4.6, 1.9, 9.0]),
    acl: mk(aclMid.clone(), [s * 2.1, 0.5, 4.5]),
    meniscus: mk(new Vector3(lm.medial.cx * 0.35, lm.medial.y + 0.2, 0), [-s * 1.5, 4.6, 4.2]),
    cartilage: mk(new Vector3(lm.notchX, 0.55, 0.05), [-s * 3.9, 1.4, 5.4]),
    patella: mk(new Vector3(0, 0.1, 0.45), [-s * 5.6, 0.6, 3.0]),
  };
}

const IDLE_RETURN_MS = 3000;
const MAX_YAW = 0.85;
const MAX_PITCH = 0.45;

/** Smoothly tweens to the pose of the current step; lets the visitor nudge the view and eases back after 3 s idle. */
function CameraRig({ focus, poses }: { focus: KneeFocus; poses: Record<KneeFocus, Pose> }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const cur = useRef({ pos: poses[focus].pos.clone(), target: poses[focus].target.clone() });
  const goalPos = useRef(new Vector3());
  const goalTarget = useRef(new Vector3());
  const sph = useRef(new Spherical());
  const offset = useRef(new Vector3());
  const drag = useRef({ yaw: 0, pitch: 0, ty: 0, tp: 0, last: -1e9, down: false, x: 0, y: 0 });

  useEffect(() => {
    const d = drag.current;
    d.ty = d.tp = 0;
  }, [focus]);

  useEffect(() => {
    const el = gl.domElement;
    const d = drag.current;
    const down = (e: PointerEvent) => {
      d.down = true;
      d.x = e.clientX;
      d.y = e.clientY;
      d.last = performance.now();
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!d.down) return;
      d.ty = Math.max(-MAX_YAW, Math.min(MAX_YAW, d.ty - (e.clientX - d.x) * 0.0075));
      d.tp = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, d.tp - (e.clientY - d.y) * 0.005));
      d.x = e.clientX;
      d.y = e.clientY;
      d.last = performance.now();
    };
    const up = () => {
      d.down = false;
      d.last = performance.now();
      el.style.cursor = "grab";
    };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const d = drag.current;
    const pose = poses[focus];
    const aspect = size.width / Math.max(size.height, 1);
    const back = aspect < 1 ? 1 + (1 - aspect) * 0.85 : 1; // keep the joint in frame on portrait
    goalTarget.current.copy(pose.target);
    goalPos.current.copy(pose.pos).sub(goalTarget.current).multiplyScalar(back).add(goalTarget.current);
    dampVec3(cur.current.pos, goalPos.current, 2.4, dt);
    dampVec3(cur.current.target, goalTarget.current, 2.4, dt);

    if (!d.down && performance.now() - d.last > IDLE_RETURN_MS) {
      d.ty = damp(d.ty, 0, 1.6, dt);
      d.tp = damp(d.tp, 0, 1.6, dt);
    }
    d.yaw = damp(d.yaw, d.ty, 8, dt);
    d.pitch = damp(d.pitch, d.tp, 8, dt);

    offset.current.copy(cur.current.pos).sub(cur.current.target);
    sph.current.setFromVector3(offset.current);
    sph.current.theta += d.yaw + Math.sin(s.clock.elapsedTime * 0.35) * 0.045;
    sph.current.phi = Math.min(Math.PI - 0.2, Math.max(0.2, sph.current.phi + d.pitch));
    offset.current.setFromSpherical(sph.current);
    camera.position.copy(cur.current.target).add(offset.current);
    camera.lookAt(cur.current.target);
  });
  return null;
}

export interface KneeSceneProps extends SceneBaseProps {
  focus?: KneeFocus;
  labels?: Partial<Record<KneeFocus, string>>;
}

function KneeContent({ focus, labels }: { focus: KneeFocus; labels?: KneeSceneProps["labels"] }) {
  const data = useKneeData();
  const poses = useMemo(() => buildPoses(data.lm), [data.lm]);
  return (
    <>
      <CameraRig focus={focus} poses={poses} />
      <KneeModel data={data} focus={focus} label={labels?.[focus]} />
    </>
  );
}

export default function KneeScene({ active, onReady, focus = "overview", labels }: KneeSceneProps) {
  useEffect(() => preloadModel("knee"), []);
  return (
    <Stage active={active} onReady={onReady} cameraPosition={[-4.6, 2, 9]} shadowY={-3.35} floorSize={9} interactive>
      <KneeContent focus={focus} labels={labels} />
    </Stage>
  );
}
