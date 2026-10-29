import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { BufferGeometry, Float32BufferAttribute, Matrix3, Mesh, Vector3, type Object3D } from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/** Bones are real BodyParts3D meshes (see public/models/ATTRIBUTION.md), meshopt-compressed. */
export const MODEL_URL = {
  knee: "/models/knee.glb",
  leg: "/models/leg.glb",
  tibia: "/models/tibia.glb",
} as const;
export type ModelKey = keyof typeof MODEL_URL;

type ExtendLoader = Parameters<typeof useGLTF>[3];
const extend: ExtendLoader = (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
};

/** Start fetching a model (call from an effect, never at module top level). */
export function preloadModel(key: ModelKey): void {
  useGLTF.preload(MODEL_URL[key], false, false, extend);
}

/** Meshopt/quantized attributes -> plain float geometry in the glTF scene space (node transforms baked). */
function bake(mesh: Mesh): BufferGeometry {
  mesh.updateWorldMatrix(true, false);
  const src = mesh.geometry;
  const pos = src.getAttribute("position");
  const nor = src.getAttribute("normal");
  const nm = new Matrix3().getNormalMatrix(mesh.matrixWorld);
  const p = new Float32Array(pos.count * 3);
  const n = new Float32Array(pos.count * 3);
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).toArray(p, i * 3);
    v.fromBufferAttribute(nor, i).applyNormalMatrix(nm).normalize().toArray(n, i * 3);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  g.setAttribute("normal", new Float32BufferAttribute(n, 3));
  if (src.index) g.setIndex(src.index.clone());
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/** Suspends until the GLB is loaded; returns float geometries keyed by mesh name. Disposed on unmount. */
export function useBoneGeometries<K extends string>(key: ModelKey, names: readonly K[]): Record<K, BufferGeometry> {
  const gltf = useGLTF(MODEL_URL[key], false, false, extend);
  const geos = useMemo(() => {
    const out = {} as Record<K, BufferGeometry>;
    gltf.scene.traverse((o: Object3D) => {
      if ((o as Mesh).isMesh && (names as readonly string[]).includes(o.name)) out[o.name as K] = bake(o as Mesh);
    });
    for (const n of names) if (!out[n]) throw new Error(`Model ${key}: missing mesh "${n}"`);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, key]);
  useEffect(
    () => () => {
      Object.values<BufferGeometry>(geos).forEach((g) => g.dispose());
    },
    [geos],
  );
  return geos;
}
