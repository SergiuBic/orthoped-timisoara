"use client";

import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";

type V3 = [number, number, number];

/** Floating hotspot: glowing dot on the anatomy, a leader line, and a glass label. */
export function Tag({ text, at }: { text: string; at: V3 }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <Html position={at} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div className="relative" style={{ width: 0, height: 0 }}>
        <span
          className="absolute -left-1.5 -top-1.5 block size-3 rounded-full border-2 border-white bg-peach transition-transform duration-500"
          style={{ transform: `scale(${on ? 1 : 0})`, boxShadow: "0 0 0 5px rgb(255 190 152 / 0.35), 0 0 18px 4px rgb(255 190 152 / 0.55)" }}
        />
        <span
          className="absolute left-0 top-0 block h-px origin-left bg-peach transition-all duration-500"
          style={{ width: on ? 46 : 0, transform: "rotate(-32deg)", boxShadow: "0 0 6px rgb(255 190 152 / 0.9)" }}
        />
        <span
          className="glass absolute whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all duration-500"
          style={{ left: 38, top: -42, color: "var(--fg)", opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 6}px)` }}
        >
          {text}
        </span>
      </div>
    </Html>
  );
}
