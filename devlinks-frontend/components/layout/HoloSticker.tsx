"use client";

import { useId } from "react";
import { useReducedMotion } from "motion/react";

import { HOLO_ICONS, type HoloIcon } from "@/lib/holo-icons";
import { cn } from "@/lib/utils";

// Grosor del troquel alrededor del logo (unidades del viewBox de 24)
const CUT = 3.5;

const FOIL = [
  ["0", "#e9eef5"],
  ["0.12", "#8eeefc"],
  ["0.24", "#6fe0cf"],
  ["0.36", "#f3a6fa"],
  ["0.48", "#bba8ff"],
  ["0.6", "#98efba"],
  ["0.72", "#ffcf8a"],
  ["0.84", "#fbe8b0"],
  ["1", "#f7f9fc"],
];

export function HoloSticker({
  icon,
  className,
  style,
}: {
  icon: HoloIcon;
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const animate = !useReducedMotion();
  const { color, fold: k, path } = HOLO_ICONS[icon];
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  // El doblez es la recta y = x - k; la esquina se dibuja reflejando el troquel
  // sobre ella, así que las sombras del flap usan dx/dy intercambiados
  const keep = `-4,-4 ${k - 4},-4 28,${28 - k} 28,28 -4,28`;
  const cut = `${k - 4},-4 28,-4 28,${28 - k}`;
  const fx = 12 + k / 2;
  const fy = 12 - k / 2;

  const cutPath = (fill: string, extra?: React.SVGProps<SVGPathElement>) => (
    <path
      d={path}
      fill={fill}
      stroke={fill}
      strokeWidth={CUT}
      strokeLinejoin="round"
      {...extra}
    />
  );

  return (
    <svg
      viewBox="-4 -4 32 32"
      aria-hidden
      className={cn("holo-sticker", className)}
      style={style}
    >
      <defs>
        <linearGradient
          id={id("foil")}
          gradientUnits="userSpaceOnUse"
          x1="-4"
          y1="-4"
          x2="20"
          y2="20"
          spreadMethod="reflect"
        >
          {FOIL.map(([offset, stop]) => (
            <stop key={offset} offset={offset} stopColor={stop} />
          ))}
          {animate && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="0 0; 48 48"
              dur="9s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
        <linearGradient
          id={id("foil2")}
          gradientUnits="userSpaceOnUse"
          x1="28"
          y1="-4"
          x2="10"
          y2="26"
          spreadMethod="reflect"
        >
          {FOIL.toReversed().map(([offset, stop], i) => (
            <stop key={offset} offset={FOIL[i][0]} stopColor={stop} />
          ))}
          {animate && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="0 0; -36 60"
              dur="13s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
        <radialGradient
          id={id("key")}
          gradientUnits="userSpaceOnUse"
          cx="-2"
          cy="-2"
          r="26"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("glare")} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={id("back")}
          gradientUnits="userSpaceOnUse"
          x1={fx}
          y1={fy}
          x2={fx + 6}
          y2={fy - 6}
        >
          <stop offset="0" stopColor="#c9d0da" />
          <stop offset="0.45" stopColor="#f4f6f9" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.6"
            numOctaves="2"
            seed="7"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <filter id={id("lift")} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0.9"
            dy="-0.5"
            stdDeviation="0.7"
            floodOpacity="0.35"
          />
        </filter>
        <clipPath id={id("keep")}>
          <polygon points={keep} />
        </clipPath>
        <clipPath id={id("cut")}>
          <polygon points={cut} />
        </clipPath>
        <mask
          id={id("die")}
          maskUnits="userSpaceOnUse"
          x="-4"
          y="-4"
          width="32"
          height="32"
        >
          {cutPath("#fff")}
        </mask>
      </defs>

      <g clipPath={url("keep")}>
        {cutPath("#9aa3b2", { transform: "translate(0.35 0.55)" })}
        {cutPath(url("foil"))}
        {cutPath(url("foil2"), {
          opacity: 0.55,
          style: { mixBlendMode: "soft-light" },
        })}
        <path d={path} fill={color} />
        <path
          d={path}
          fill={url("foil")}
          opacity={0.18}
          style={{ mixBlendMode: "screen" }}
        />
        <g mask={url("die")}>
          <rect x="-4" y="-4" width="32" height="32" fill={url("key")} />
          <rect
            x="-4"
            y="-4"
            width="32"
            height="32"
            filter={url("grain")}
            opacity={0.14}
            style={{ mixBlendMode: "multiply" }}
          />
          <rect
            x="-14"
            y="-8"
            width="7"
            height="40"
            fill={url("glare")}
            transform="rotate(25 12 12)"
            opacity={0.7}
          >
            {animate && (
              <animateTransform
                attributeName="transform"
                type="translate"
                additive="sum"
                values="0 0; 44 0; 44 0"
                keyTimes="0; 0.45; 1"
                dur="5s"
                repeatCount="indefinite"
              />
            )}
          </rect>
        </g>
      </g>
      <g transform={`matrix(0 1 1 0 ${k} ${-k})`} filter={url("lift")}>
        <g clipPath={url("cut")}>{cutPath(url("back"), { opacity: 0.95 })}</g>
      </g>
    </svg>
  );
}
