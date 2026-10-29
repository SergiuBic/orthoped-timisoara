import { Vector3, type BufferGeometry } from "three";

/** Geometry measurement helpers + knee landmarks derived from the real bone meshes (no hard-coded coordinates). */

function percentile(sorted: number[], q: number): number {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))];
}

export interface Compartment {
  /** centre of the plateau compartment on the XZ plane */
  cx: number;
  cz: number;
  /** half extents */
  rx: number;
  rz: number;
  /** plateau surface height */
  y: number;
}

export interface KneeLandmarks {
  /** +1 if the lateral side is +X, else -1 (right leg: -1). */
  latSign: 1 | -1;
  femurMinY: number;
  tibiaMaxY: number;
  /** Axis of flexion: through the femoral condyles. */
  pivot: Vector3;
  medial: Compartment;
  lateral: Compartment;
  /** Centre of the intercondylar notch (x) */
  notchX: number;
  spine: Vector3;
  aclFemoral: Vector3;
  aclTibial: Vector3;
  pclFemoral: Vector3;
  pclTibial: Vector3;
  patellaFront: Vector3;
  medialCondyle: Vector3;
  meniscusRim: Vector3;
}

export function computeKneeLandmarks(g: {
  femur: BufferGeometry;
  tibia: BufferGeometry;
  fibula: BufferGeometry;
  patella: BufferGeometry;
}): KneeLandmarks {
  const fp = g.femur.getAttribute("position");
  const tp = g.tibia.getAttribute("position");
  const tn = g.tibia.getAttribute("normal");
  const v = new Vector3();

  g.tibia.computeBoundingBox();
  g.femur.computeBoundingBox();
  g.fibula.computeBoundingBox();
  g.patella.computeBoundingBox();
  const tibiaBB = g.tibia.boundingBox!;
  const femurBB = g.femur.boundingBox!;
  const latSign: 1 | -1 = (g.fibula.boundingBox!.min.x + g.fibula.boundingBox!.max.x) / 2 > (tibiaBB.min.x + tibiaBB.max.x) / 2 ? 1 : -1;

  // --- tibial plateau: upward-facing vertices in the top 28 mm
  const plate: { x: number; y: number; z: number }[] = [];
  let spine = new Vector3(0, -1e9, 0);
  for (let i = 0; i < tp.count; i++) {
    v.fromBufferAttribute(tp, i);
    if (v.y > spine.y) spine = v.clone();
    if (v.y > tibiaBB.max.y - 0.56 && tn.getY(i) > 0.55) plate.push({ x: v.x, y: v.y, z: v.z });
  }
  const midX = (tibiaBB.min.x + tibiaBB.max.x) / 2;
  const compartment = (pick: (x: number) => boolean): Compartment => {
    const pts = plate.filter((p) => pick(p.x));
    const xs = pts.map((p) => p.x).sort((a, b) => a - b);
    const zs = pts.map((p) => p.z).sort((a, b) => a - b);
    const ys = pts.map((p) => p.y).sort((a, b) => a - b);
    const x0 = percentile(xs, 0.03);
    const x1 = percentile(xs, 0.97);
    const z0 = percentile(zs, 0.03);
    const z1 = percentile(zs, 0.97);
    return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, rx: (x1 - x0) / 2, rz: (z1 - z0) / 2, y: percentile(ys, 0.35) };
  };
  const lateral = compartment((x) => (x - midX) * latSign > 0.08);
  const medial = compartment((x) => (x - midX) * latSign < -0.08);

  // --- femoral condyles: lowest 36 mm
  const cond: Vector3[] = [];
  for (let i = 0; i < fp.count; i++) {
    v.fromBufferAttribute(fp, i);
    if (v.y < femurBB.min.y + 0.72) cond.push(v.clone());
  }
  const cxs = cond.map((p) => p.x).sort((a, b) => a - b);
  const czs = cond.map((p) => p.z).sort((a, b) => a - b);
  const notchX = (percentile(cxs, 0.02) + percentile(cxs, 0.98)) / 2;
  const zMin = percentile(czs, 0.03);
  const zMax = percentile(czs, 0.97);
  const condZ = (zMin + zMax) / 2;
  // condyle centres sit ~ one condylar radius above the lowest point
  const pivot = new Vector3(notchX, femurBB.min.y + 0.62, zMin + (zMax - zMin) * 0.38);
  const medialCondyle = new Vector3(notchX - latSign * (medial.rx * 0.8), femurBB.min.y + 0.1, condZ - 0.1);

  const aclFemoral = new Vector3(notchX + latSign * 0.1, femurBB.min.y + 0.62, zMin + (zMax - zMin) * 0.2);
  const aclTibial = new Vector3(spine.x - latSign * 0.03, medial.y + 0.04, spine.z + 0.26);
  const pclFemoral = new Vector3(notchX - latSign * 0.12, femurBB.min.y + 0.5, zMin + (zMax - zMin) * 0.52);
  const pclTibial = new Vector3(spine.x, medial.y - 0.06, tibiaBB.min.z + (tibiaBB.max.z - tibiaBB.min.z) * 0.1);

  g.patella.computeBoundingBox();
  const pb = g.patella.boundingBox!;
  const patellaFront = new Vector3((pb.min.x + pb.max.x) / 2, (pb.min.y + pb.max.y) / 2, pb.max.z);
  const meniscusRim = new Vector3(medial.cx - latSign * medial.rx * 0.9, medial.y + 0.05, medial.cz);

  return {
    latSign,
    femurMinY: femurBB.min.y,
    tibiaMaxY: tibiaBB.max.y,
    pivot,
    medial,
    lateral,
    notchX,
    spine,
    aclFemoral,
    aclTibial,
    pclFemoral,
    pclTibial,
    patellaFront,
    medialCondyle,
    meniscusRim,
  };
}

/** Shaft profile helper for the fracture scene (tibia along Y). */
export class ShaftProfile {
  private pts: Float32Array;
  constructor(geo: BufferGeometry) {
    const p = geo.getAttribute("position");
    this.pts = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      this.pts[i * 3] = p.getX(i);
      this.pts[i * 3 + 1] = p.getY(i);
      this.pts[i * 3 + 2] = p.getZ(i);
    }
  }
  /** Centre (bounding-box middle) of the cross-section at height y. */
  centre(y: number, band = 0.06): { x: number; z: number; r: number } {
    let x0 = 1e9,
      x1 = -1e9,
      z0 = 1e9,
      z1 = -1e9;
    for (let i = 0; i < this.pts.length; i += 3) {
      if (Math.abs(this.pts[i + 1] - y) > band) continue;
      x0 = Math.min(x0, this.pts[i]);
      x1 = Math.max(x1, this.pts[i]);
      z0 = Math.min(z0, this.pts[i + 2]);
      z1 = Math.max(z1, this.pts[i + 2]);
    }
    return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, r: Math.max(x1 - x0, z1 - z0) / 2 };
  }
  /** Distance from (cx,cz) to the outer surface at height y along azimuth `phi` (XZ plane). */
  radius(y: number, cx: number, cz: number, phi: number, band = 0.05, cone = 0.22): number {
    let best = 0;
    const dx = Math.cos(phi);
    const dz = Math.sin(phi);
    for (let i = 0; i < this.pts.length; i += 3) {
      if (Math.abs(this.pts[i + 1] - y) > band) continue;
      const px = this.pts[i] - cx;
      const pz = this.pts[i + 2] - cz;
      const along = px * dx + pz * dz;
      if (along <= best) continue;
      const perp = Math.abs(-px * dz + pz * dx);
      if (perp < cone * Math.max(along, 0.3)) best = along;
    }
    return best;
  }
}
