import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Path,
  Shape,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";

/** Procedural parts that are fitted onto the real bone meshes. Units: 1 = 50 mm. Y up, +Z anterior. */

/** Twisted ligament tube between two attachment points. */
export function createLigament(a: Vector3, b: Vector3, radius: number, twist: number, bow: Vector3): BufferGeometry {
  const dir = b.clone().sub(a).normalize();
  const u = new Vector3(1, 0, 0).cross(dir).normalize();
  const v = dir.clone().cross(u);
  const pts: Vector3[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    const ang = t * Math.PI * twist;
    pts.push(
      a
        .clone()
        .lerp(b, t)
        .addScaledVector(u, Math.cos(ang) * 0.03 * env)
        .addScaledVector(v, Math.sin(ang) * 0.03 * env)
        .addScaledVector(bow, env),
    );
  }
  // slightly fanned ends (ligaments flare where they meet bone)
  const g = new TubeGeometry(new CatmullRomCurve3(pts), 36, radius, 14, false);
  const pos = g.getAttribute("position");
  const ring = 15;
  const centre = new CatmullRomCurve3(pts);
  const c = new Vector3();
  const p = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    const seg = Math.floor(i / ring) / 36;
    const flare = 1 + 0.55 * (Math.pow(1 - seg, 6) + Math.pow(seg, 6));
    centre.getPointAt(Math.min(seg, 1), c);
    p.fromBufferAttribute(pos, i).sub(c).multiplyScalar(flare).add(c);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g.computeVertexNormals();
  return g;
}

export interface MeniscusSpec {
  cx: number;
  cz: number;
  y: number;
  rx: number;
  rz: number;
  /** Angle (param of the ellipse) at the middle of the opening. */
  open: number;
  /** Opening size (radians). */
  gap: number;
  width: number;
  height: number;
}

/** Crescent fibrocartilage: wedge cross-section (thick outer rim, thin inner edge) swept around an ellipse. */
export function createMeniscus(s: MeniscusSpec): BufferGeometry {
  const N = 72;
  const prof = [
    [0, 0], // outer bottom
    [0, 1], // outer top
    [0.28, 0.82],
    [0.55, 0.52],
    [0.8, 0.22],
    [1, 0.05], // inner top
    [1, 0], // inner bottom
  ] as const;
  const M = prof.length;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const phi = s.open + s.gap / 2 + t * (Math.PI * 2 - s.gap);
    const taper = Math.pow(Math.sin(Math.PI * t), 0.55); // pinched horns
    for (let j = 0; j < M; j++) {
      const [w, h] = prof[j];
      const rx = s.rx - w * s.width * taper;
      const rz = s.rz - w * s.width * taper;
      pos.push(s.cx + Math.cos(phi) * rx, s.y + h * s.height * (0.25 + 0.75 * taper), s.cz + Math.sin(phi) * rz);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * M + j;
      const b = i * M + ((j + 1) % M);
      idx.push(a, a + M, b, b, a + M, b + M);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // winding check: the top-outer vertex normal should point up/outward
  const n = g.getAttribute("normal");
  const probe = Math.floor(N / 2) * M + 1;
  const px = g.getAttribute("position").getX(probe) - s.cx;
  const pz = g.getAttribute("position").getZ(probe) - s.cz;
  if (n.getX(probe) * px + n.getZ(probe) * pz < 0) {
    const flipped = idx.slice();
    for (let i = 0; i < flipped.length; i += 3) [flipped[i + 1], flipped[i + 2]] = [flipped[i + 2], flipped[i + 1]];
    g.setIndex(flipped);
    g.computeVertexNormals();
  }
  return g;
}

/**
 * Thin shell copied from the triangles of `src` that pass `pick`, pushed out along the vertex normals.
 * Used for articular cartilage that sits exactly on the real bone surface.
 */
export function extractPatch(
  src: BufferGeometry,
  pick: (c: Vector3, n: Vector3) => boolean,
  offset: number,
): BufferGeometry {
  const pos = src.getAttribute("position");
  const nor = src.getAttribute("normal");
  const index = src.index!;
  const remap = new Map<number, number>();
  const P: number[] = [];
  const N: number[] = [];
  const I: number[] = [];
  const c = new Vector3();
  const n = new Vector3();
  const v = new Vector3();
  const tmp = new Vector3();
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t);
    const b = index.getX(t + 1);
    const d = index.getX(t + 2);
    c.set(0, 0, 0);
    n.set(0, 0, 0);
    for (const i of [a, b, d]) {
      c.add(v.fromBufferAttribute(pos, i));
      n.add(tmp.fromBufferAttribute(nor, i));
    }
    c.divideScalar(3);
    n.normalize();
    if (!pick(c, n)) continue;
    for (const i of [a, b, d]) {
      let m = remap.get(i);
      if (m === undefined) {
        m = P.length / 3;
        remap.set(i, m);
        v.fromBufferAttribute(pos, i);
        tmp.fromBufferAttribute(nor, i);
        P.push(v.x + tmp.x * offset, v.y + tmp.y * offset, v.z + tmp.z * offset);
        N.push(tmp.x, tmp.y, tmp.z);
      }
      I.push(m);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(P, 3));
  g.setAttribute("normal", new Float32BufferAttribute(N, 3));
  g.setIndex(I);
  return g;
}

/* ------------------------------ hardware ------------------------------ */

export const PLATE_THICK = 0.05;

/**
 * Locking plate lying on a shaft. Local frame: Y along the shaft, the surface normal is +Z.
 * `lift(y)` returns the distance from the plate's local origin plane to the bone surface at that y,
 * so the plate follows the real (tapering) shaft.
 */
export function createPlate(length: number, width: number, holeYs: number[], lift: (y: number) => number): BufferGeometry {
  const r = width / 2;
  const s = new Shape();
  const L = length / 2;
  s.moveTo(-r, -L + r);
  s.lineTo(-r, L - r * 1.6);
  s.absarc(0, L - r * 1.6, r, Math.PI, 0, true);
  s.lineTo(r, -L + r);
  s.absarc(0, -L + r, r, 0, Math.PI, true);
  for (const y of holeYs) {
    const h = new Path();
    h.absarc(0, y, 0.052, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const g = new ExtrudeGeometry(s, {
    depth: PLATE_THICK,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 3,
    curveSegments: 16,
    steps: 1,
  });
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const x = p.getX(i);
    // wrap across the width a little (shaft curvature) and ride the surface along its length
    p.setZ(i, p.getZ(i) + lift(y) - 0.6 * x * x);
  }
  g.computeVertexNormals();
  return g;
}

/** Cortical screw with a sawtooth thread, axis +Z (head up), shaft going into -Z. */
export function createScrew(): BufferGeometry {
  const pts: Vector2[] = [new Vector2(0, 0.06), new Vector2(0.095, 0.06), new Vector2(0.095, 0.0), new Vector2(0.04, 0.0)];
  const turns = 16;
  for (let i = 0; i <= turns; i++) {
    const y = -0.02 - (i / turns) * 0.5;
    pts.push(new Vector2(0.062, y), new Vector2(0.038, y - 0.015));
  }
  pts.push(new Vector2(0.0, -0.56));
  pts.reverse();
  const g = new LatheGeometry(pts, 14);
  g.rotateX(Math.PI / 2);
  return g;
}
