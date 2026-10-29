import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Matrix4,
  Path,
  Shape,
  SphereGeometry,
  SplineCurve,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Joint layout (units ~ cm/3). Y up, +Z anterior (front), X lateral/medial. */
export const KNEE_PIVOT = new Vector3(0, 0.1, -0.12);

/** Smooth lathe from a list of [radius, y] control points (any order). */
function lathe(ctrl: [number, number][], samples = 56, segments = 40): LatheGeometry {
  const pts = ctrl.map(([r, y]) => new Vector2(r, y));
  const smooth = new SplineCurve(pts).getPoints(samples).map((p) => new Vector2(Math.max(p.x, 0), p.y));
  if (smooth[0].y > smooth[smooth.length - 1].y) smooth.reverse();
  return new LatheGeometry(smooth, segments);
}

function ellipsoid(rx: number, ry: number, rz: number, x: number, y: number, z: number, w = 36, h = 24) {
  const g = new SphereGeometry(1, w, h);
  g.applyMatrix4(new Matrix4().makeScale(rx, ry, rz));
  g.translate(x, y, z);
  return g;
}

/** Distal femur: shaft + metaphysis + two condyles + trochlear ridges. */
export function createFemur(): BufferGeometry {
  const shaft = lathe([
    [0, 0.05],
    [0.5, 0.12],
    [0.62, 0.45],
    [0.5, 0.9],
    [0.38, 1.35],
    [0.31, 1.9],
    [0.29, 2.4],
    [0.3, 2.8],
    [0, 2.8],
  ]);
  shaft.applyMatrix4(new Matrix4().makeScale(1.15, 1, 0.9));
  shaft.translate(0, 0, -0.05);
  return mergeGeometries([
    shaft,
    ellipsoid(0.36, 0.42, 0.62, -0.45, 0.1, -0.12), // medial condyle
    ellipsoid(0.34, 0.4, 0.58, 0.45, 0.1, -0.1), // lateral condyle
    ellipsoid(0.2, 0.45, 0.24, -0.26, 0.3, 0.3), // trochlear ridges
    ellipsoid(0.2, 0.45, 0.26, 0.28, 0.3, 0.3),
  ])!;
}

/** Proximal tibia with plateau, spine, tuberosity and a tapered shaft. */
export function createTibia(): BufferGeometry {
  const body = lathe([
    [0, -0.5],
    [0.55, -0.5],
    [0.69, -0.56],
    [0.7, -0.72],
    [0.58, -1.0],
    [0.42, -1.5],
    [0.33, -2.05],
    [0.31, -2.8],
    [0, -2.85],
  ]);
  body.applyMatrix4(new Matrix4().makeScale(1.12, 1, 0.88));
  body.translate(0, 0, -0.04);
  return mergeGeometries([
    body,
    ellipsoid(0.07, 0.1, 0.11, -0.1, -0.47, -0.02, 16, 12), // tibial spines
    ellipsoid(0.07, 0.1, 0.11, 0.1, -0.47, -0.02, 16, 12),
    ellipsoid(0.17, 0.36, 0.14, 0, -1.15, 0.4), // tuberosity
  ])!;
}

export function createFibula(): BufferGeometry {
  const g = lathe(
    [
      [0, -3.0],
      [0.09, -2.97],
      [0.085, -2.4],
      [0.075, -1.5],
      [0.095, -0.95],
      [0.17, -0.75],
      [0.18, -0.6],
      [0.1, -0.5],
      [0, -0.5],
    ],
    40,
    20,
  );
  g.rotateZ(-0.03);
  g.translate(0.88, 0, -0.24);
  return g;
}

export function createPatella(): BufferGeometry {
  const g = ellipsoid(0.3, 0.36, 0.15, 0, 0, 0, 32, 20);
  g.rotateX(-0.12);
  return g;
}

export const PATELLA_POS = new Vector3(0, 0.05, 0.74);

/** Cartilage caps on femoral condyles (open shells, lower hemisphere). */
export function createFemoralCartilage(): BufferGeometry {
  const cap = (rx: number, ry: number, rz: number, x: number, y: number, z: number) => {
    const g = new SphereGeometry(1, 40, 20, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58);
    g.applyMatrix4(new Matrix4().makeScale(rx * 1.04, ry * 1.04, rz * 1.04));
    g.translate(x, y, z);
    return g;
  };
  return mergeGeometries([cap(0.36, 0.42, 0.62, -0.45, 0.1, -0.12), cap(0.34, 0.4, 0.58, 0.45, 0.1, -0.1)])!;
}

export function createTibialCartilage(): BufferGeometry {
  const disc = (x: number) => {
    const g = new CylinderGeometry(0.36, 0.36, 0.035, 36);
    g.applyMatrix4(new Matrix4().makeScale(1, 1, 1.3));
    g.translate(x, -0.495, -0.02);
    return g;
  };
  return mergeGeometries([disc(-0.4), disc(0.4)])!;
}

/** Two C-shaped menisci (300 degree torus arcs, flattened, gaps facing the notch). */
export function createMenisci(): BufferGeometry {
  const make = (x: number, rotZ: number) => {
    const g = new TorusGeometry(0.28, 0.1, 14, 40, (Math.PI * 2 * 300) / 360);
    g.scale(0.9, 1.3, 0.58);
    g.rotateZ(rotZ);
    g.rotateX(-Math.PI / 2);
    g.translate(x, -0.43, -0.02);
    return g;
  };
  return mergeGeometries([make(-0.4, (30 * Math.PI) / 180), make(0.4, (-150 * Math.PI) / 180)])!;
}

/** Twisted ligament tube between two attachment points. */
export function createLigament(a: Vector3, b: Vector3, radius: number, twist: number, bow: Vector3): BufferGeometry {
  const dir = b.clone().sub(a).normalize();
  const u = new Vector3(1, 0, 0).cross(dir).normalize();
  const v = dir.clone().cross(u);
  const pts: Vector3[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    const ang = t * Math.PI * twist;
    pts.push(
      a
        .clone()
        .lerp(b, t)
        .addScaledVector(u, Math.cos(ang) * 0.035 * env)
        .addScaledVector(v, Math.sin(ang) * 0.035 * env)
        .addScaledVector(bow, env),
    );
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), 28, radius, 10, false);
}

export const ACL_ENDS = [new Vector3(0.07, 0.14, -0.22), new Vector3(-0.05, -0.47, 0.14)] as const;
export const PCL_ENDS = [new Vector3(-0.05, 0.14, -0.02), new Vector3(0.03, -0.47, -0.4)] as const;

/* ------------------------------ fracture ------------------------------ */

export const SHAFT_HALF = 3.5;
const DOME = 0.32;
const SEG = 56;
export const shaftRadius = (x: number) => 0.4 + 0.2 * Math.pow(Math.abs(x) / SHAFT_HALF, 3);

/** Jagged, oblique fracture line (axial position of the cut vs. angle). Shared by both pieces. */
function cutX(theta: number): number {
  const tri = Math.abs(((theta / (Math.PI * 2)) * 6) % 1 * 2 - 1);
  return 0.2 * (tri * 2 - 1) + 0.24 * Math.cos(theta - 0.8);
}

/**
 * One half of the tibial shaft. side -1 = left half, +1 = right half.
 * Both halves share the same cut curve, so they fit together seamlessly.
 */
export function createShaftPiece(side: -1 | 1): BufferGeometry {
  type Station = (theta: number) => { x: number; r: number };
  const stations: Station[] = [];
  const D = 8;
  for (let d = D; d >= 0; d--) {
    const phi = (d / D) * (Math.PI / 2);
    stations.push(() => {
      const x = side * (SHAFT_HALF + DOME * Math.sin(phi));
      return { x, r: shaftRadius(side * SHAFT_HALF) * Math.cos(phi) };
    });
  }
  const BODY = 28;
  for (let k = 1; k <= BODY; k++) {
    const t = k / BODY;
    stations.push((th) => {
      const x0 = side * SHAFT_HALF;
      const x = x0 + (cutX(th) - x0) * t;
      return { x, r: shaftRadius(x0 + (0 - x0) * t) };
    });
  }
  const CAP = 5;
  for (let k = 1; k <= CAP; k++) {
    const m = 1 - k / CAP;
    stations.push((th) => {
      const x = cutX(th) + side * (0.1 * (1 - m) * (1 - m) + 0.05 * m * Math.sin(th * 5 + m * 7));
      return { x, r: shaftRadius(0) * m };
    });
  }

  const pos: number[] = [];
  for (const st of stations) {
    for (let i = 0; i < SEG; i++) {
      const th = (i / SEG) * Math.PI * 2;
      const { x, r } = st(th);
      pos.push(x, r * Math.cos(th), r * Math.sin(th));
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < stations.length - 1; j++) {
    for (let i = 0; i < SEG; i++) {
      const a = j * SEG + i;
      const b = j * SEG + ((i + 1) % SEG);
      const c = (j + 1) * SEG + i;
      const d = (j + 1) * SEG + ((i + 1) % SEG);
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();

  // Auto-orient: a mid-body vertex normal must point away from the axis.
  const p = g.getAttribute("position");
  const n = g.getAttribute("normal");
  const probe = (D + Math.floor(BODY / 2)) * SEG;
  const outward = p.getY(probe) * n.getY(probe) + p.getZ(probe) * n.getZ(probe);
  if (outward < 0) {
    for (let i = 0; i < idx.length; i += 3) {
      const t = idx[i + 1];
      idx[i + 1] = idx[i + 2];
      idx[i + 2] = t;
    }
    g.setIndex(idx);
    g.computeVertexNormals();
  }
  return g;
}

/** Spindle-shaped callus bulge around the cut (rotated so its axis is X). */
export function createCallus(): BufferGeometry {
  const pts: Vector2[] = [];
  for (let k = -18; k <= 18; k++) {
    const x = k * 0.075;
    pts.push(new Vector2(0.38 + 0.22 * Math.exp(-Math.pow(x / 0.55, 2)), x));
  }
  const g = new LatheGeometry(pts, 40);
  g.rotateZ(-Math.PI / 2);
  return g;
}

export const PLATE_RADIUS = 0.445;
export const PLATE_THICK = 0.05;
export const SCREW_XS = [-1.2, -0.9, -0.6, 0.6, 0.9, 1.2];

/** Locking plate with 6 screw holes, bent to wrap the shaft (axis X, lying on the +Z side). */
export function createPlate(): BufferGeometry {
  const L = 3.2;
  const W = 0.32;
  const r = W / 2;
  const s = new Shape();
  s.moveTo(-L / 2 + r, -r);
  s.lineTo(L / 2 - r, -r);
  s.absarc(L / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-L / 2 + r, r);
  s.absarc(-L / 2 + r, 0, r, Math.PI / 2, (Math.PI * 3) / 2, false);
  for (const x of SCREW_XS) {
    const h = new Path();
    h.absarc(x, 0, 0.06, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const g = new ExtrudeGeometry(s, {
    depth: PLATE_THICK,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 2,
    curveSegments: 14,
  });
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const z = p.getZ(i);
    const ang = y / PLATE_RADIUS;
    const rr = PLATE_RADIUS + z;
    p.setY(i, rr * Math.sin(ang));
    p.setZ(i, rr * Math.cos(ang));
  }
  g.computeVertexNormals();
  return g;
}

/** Cortical screw with a sawtooth thread, axis +Z (head up), shaft going into -Z. */
export function createScrew(): BufferGeometry {
  const pts: Vector2[] = [new Vector2(0, 0.06), new Vector2(0.1, 0.06), new Vector2(0.1, 0.0), new Vector2(0.045, 0.0)];
  const turns = 16;
  for (let i = 0; i <= turns; i++) {
    const y = -0.02 - (i / turns) * 0.78;
    pts.push(new Vector2(0.065, y), new Vector2(0.04, y - 0.025));
  }
  pts.push(new Vector2(0.0, -0.84));
  pts.reverse();
  const g = new LatheGeometry(pts, 14);
  g.rotateX(Math.PI / 2);
  return g;
}
