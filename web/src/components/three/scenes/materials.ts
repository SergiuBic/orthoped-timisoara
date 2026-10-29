import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  type IUniform,
  type WebGLProgramParametersWithUniforms,
} from "three";

export const PEACH = "#FFBE98";
export const NAVY = "#0F1E3D";
export const CLOUD = "#F0EEE9";

/** Realistic ivory cortical bone. */
export function boneMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#EFE3D0",
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.14,
    clearcoatRoughness: 0.55,
    sheen: 0.5,
    sheenColor: new Color(PEACH),
    sheenRoughness: 0.55,
    envMapIntensity: 0.9,
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

export function ligamentMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#E39A78",
    roughness: 0.42,
    clearcoat: 0.5,
    clearcoatRoughness: 0.35,
    sheen: 0.6,
    sheenColor: new Color("#FFD9C2"),
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

/**
 * Cartilage: glassy pale blue. Real `transmission` forces an extra full-scene render pass,
 * so it is faked with alpha + clearcoat (same look at this scale, much cheaper).
 */
export function cartilageMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#CFE0EE",
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    transparent: true,
    opacity: 0.62,
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

export function meniscusMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#E7C7B2",
    roughness: 0.48,
    clearcoat: 0.35,
    sheen: 0.7,
    sheenColor: new Color(PEACH),
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

export function titaniumMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: "#C7CCD6", metalness: 1, roughness: 0.28, envMapIntensity: 1.4 });
}

export function glowMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: PEACH,
    emissive: new Color(PEACH),
    emissiveIntensity: 1.2,
    roughness: 0.8,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: DoubleSide,
  });
}

/* ------------------------------- x-ray ------------------------------- */

export interface XrayUniforms {
  [k: string]: IUniform;
  uRim: IUniform<Color>;
  uCore: IUniform<Color>;
  uOpacity: IUniform<number>;
  uPower: IUniform<number>;
  uTime: IUniform<number>;
  uBase: IUniform<number>;
  uFade: IUniform<Vector2>; // object-space y range [lo, hi] in which the part fades out toward the ends (0,0 = off)
}

/**
 * Fresnel "hologram" material. Additive glow on dark pages; ink-like alpha blending on light pages
 * (additive light would vanish on the cloud background).
 */
export function xrayMaterial(): ShaderMaterial & { uniforms: XrayUniforms } {
  const m = new ShaderMaterial({
    uniforms: {
      uRim: { value: new Color(PEACH) },
      uCore: { value: new Color("#8FB4FF") },
      uOpacity: { value: 1 },
      uPower: { value: 2.4 },
      uTime: { value: 0 },
      uBase: { value: 0.07 },
      uFade: { value: new Vector2(0, 0) },
    } satisfies XrayUniforms,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vO;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vO = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uRim; uniform vec3 uCore; uniform float uOpacity; uniform float uPower; uniform float uTime; uniform float uBase; uniform vec2 uFade;
      varying vec3 vN; varying vec3 vV; varying vec3 vO;
      void main() {
        float ndv = abs(dot(normalize(vN), normalize(vV)));
        float f = pow(1.0 - ndv, uPower);
        float scan = 0.5 + 0.5 * sin(vO.y * 22.0 - uTime * 0.9);
        float a = (uBase + f * 0.9) * (0.88 + 0.12 * scan);
        if (uFade.y > uFade.x) a *= 1.0 - smoothstep(uFade.x, uFade.y, abs(vO.y));
        vec3 col = mix(uCore, uRim, smoothstep(0.0, 0.9, f));
        gl_FragColor = vec4(col, a * uOpacity);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  });
  return m as ShaderMaterial & { uniforms: XrayUniforms };
}

export function setXrayTheme(m: ShaderMaterial & { uniforms: XrayUniforms }, dark: boolean): void {
  if (dark) {
    m.blending = AdditiveBlending;
    m.uniforms.uRim.value.set(PEACH);
    m.uniforms.uCore.value.set("#7FA8FF");
    m.uniforms.uBase.value = 0.07;
  } else {
    m.blending = NormalBlending;
    m.uniforms.uRim.value.set("#1B3162");
    m.uniforms.uCore.value.set("#6F8FC4");
    m.uniforms.uBase.value = 0.045;
  }
  m.needsUpdate = true;
}

/* ------------------------- shader patch helper ------------------------- */

interface PatchSpec {
  key: string;
  uniforms: Record<string, IUniform>;
  /** GLSL declarations (fragment + vertex-safe), e.g. varyings/uniforms. */
  decl: string;
  /** Fragment code right at the top of main() (discard logic). */
  early?: string;
  /** Fragment code just before opaque_fragment (may modify outgoingLight / diffuseColor). */
  late?: string;
  /** Fragment code after opaque_fragment (may modify gl_FragColor). */
  after?: string;
}

/** Adds an object-space position varying (`vOP`) plus custom uniforms/logic to a built-in material. */
export function patchMaterial(mat: MeshPhysicalMaterial, spec: PatchSpec): void {
  mat.customProgramCacheKey = () => spec.key;
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, spec.uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOP;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOP = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vOP;\n${spec.decl}`)
      .replace("void main() {", `void main() {\n${spec.early ?? ""}`)
      .replace("#include <opaque_fragment>", `${spec.late ?? ""}\n#include <opaque_fragment>\n${spec.after ?? ""}`);
  };
}
