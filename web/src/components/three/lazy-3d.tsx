"use client";

import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FracturePhase, KneeFocus, SceneName } from "./types";

// Each scene is its own chunk, fetched only when that scene actually mounts.
const HeroScene = dynamic(() => import("./scenes/hero-scene"), { ssr: false });
const KneeScene = dynamic(() => import("./scenes/knee-scene"), { ssr: false });
const FractureScene = dynamic(() => import("./scenes/fracture-scene"), { ssr: false });

export interface Lazy3DProps {
  scene: SceneName;
  focus?: KneeFocus;
  phase?: FracturePhase;
  /** Per-focus label strings for the knee scene (from CMS content, never hardcoded). */
  labels?: Partial<Record<KneeFocus, string>>;
  /** The parent (or this className) must give the box its size; the fallback fills it, so no CLS. */
  className?: string;
  fallbackAlt: string;
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let hardwareOk: boolean | undefined;

function probeHardware(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.hardwareConcurrency <= 2 || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)) return false;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // do not burn a context slot on the probe
    return true;
  } catch {
    return false;
  }
}

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Cached, SSR-safe capability snapshot (reduced motion is live, the GPU probe runs once). */
function subscribeMotion(cb: () => void): () => void {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getCapable(): boolean {
  if (window.matchMedia(REDUCED).matches) return false;
  hardwareOk ??= probeHardware();
  return hardwareOk;
}

/** Resolves after window load + idle (max 1.5 s after load). */
function afterIdle(cb: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    if (cancelled) return;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => !cancelled && cb(), { timeout: 1500 });
    else timer = setTimeout(() => !cancelled && cb(), 1500);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timer) clearTimeout(timer);
  };
}

export function Lazy3D({ scene, focus, phase, labels, className, fallbackAlt }: Lazy3DProps) {
  const box = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const [idle, setIdle] = useState(false);
  const capable = useSyncExternalStore(subscribeMotion, getCapable, () => false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!capable) return;
    const stopIdle = afterIdle(() => setIdle(true));
    const el = box.current;
    let io: IntersectionObserver | undefined;
    if (el) {
      io = new IntersectionObserver(
        ([e]) => {
          setInView(e.isIntersecting);
          if (e.isIntersecting) setSeen(true);
        },
        { rootMargin: "200px" },
      );
      io.observe(el);
    }
    return () => {
      stopIdle();
      io?.disconnect();
    };
  }, [capable]);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const mount = capable && idle && seen && !failed;

  return (
    <div ref={box} className={cn("relative size-full overflow-hidden", className)}>
      <div
        aria-hidden={false}
        className={cn("absolute inset-0 transition-opacity duration-700", ready && "opacity-0")}
        style={{
          background:
            "radial-gradient(60% 60% at 50% 42%, rgb(255 190 152 / 0.45), transparent 70%), linear-gradient(160deg, var(--cloud, #F0EEE9), var(--cloud-2, #E8E4DD))",
        }}
      >
        <Image
          src={`/images/fallback-${scene}.webp`}
          alt={fallbackAlt}
          fill
          unoptimized
          priority={scene === "hero"}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
      {mount && (
        <div
          role="img"
          aria-label={fallbackAlt}
          className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        >
          <SceneBoundary onError={onError}>
            {scene === "hero" && <HeroScene active={inView} onReady={onReady} />}
            {scene === "knee" && <KneeScene active={inView} onReady={onReady} focus={focus} labels={labels} />}
            {scene === "fracture" && <FractureScene active={inView} onReady={onReady} phase={phase} />}
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
