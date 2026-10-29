export type KneeFocus = "overview" | "acl" | "meniscus" | "cartilage" | "patella";
export type FracturePhase = "intact" | "fracture" | "reduction" | "fixation" | "healed";
export type SceneName = "hero" | "knee" | "fracture";

/** Props every scene module receives from Lazy3D. */
export interface SceneBaseProps {
  /** false pauses the render loop (off-screen). */
  active: boolean;
  /** Called once the WebGL context exists and the first frame is queued. */
  onReady?: () => void;
}
