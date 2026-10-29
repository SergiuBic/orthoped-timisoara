import { Color, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

export const PEACH = "#FFBE98";

export function boneMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#F5ECDF",
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.5,
    sheen: 0.4,
    sheenColor: new Color(PEACH),
    sheenRoughness: 0.6,
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

export function ligamentMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#E8916A",
    roughness: 0.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.4,
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

/**
 * Cartilage: translucent pale blue. Real `transmission` forces an extra full-scene render pass,
 * so it is faked with plain alpha + clearcoat (same look at this scale, much cheaper).
 */
export function cartilageMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#DDE7F0",
    roughness: 0.25,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    transparent: true,
    opacity: 0.6,
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

export function meniscusMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: "#EBCFBE",
    roughness: 0.5,
    clearcoat: 0.3,
    sheen: 0.5,
    sheenColor: new Color(PEACH),
    emissive: new Color(PEACH),
    emissiveIntensity: 0,
  });
}

export function metalMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: "#B9C0D0", metalness: 1, roughness: 0.25 });
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
