import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { LEVELS, NAV, USER } from "../lib/data";
import type { Level, ViewType } from "../types";

/* ─── Icon ─── */
type IconName =
  | "home"
  | "cards"
  | "doc"
  | "trophy"
  | "user"
  | "mic"
  | "send"
  | "speaker"
  | "play"
  | "logout"
  | "google"
  | "search"
  | "download"
  | "clap"
  | "chat"
  | "check"
  | "x"
  | "arrow"
  | "fire"
  | "bell"
  | "save"
  | "edit"
  | "flag"
  | "sparkle";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  const s: CSSProperties = {
    width: size,
    height: size,
    display: "block",
    ...style,
  };
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path {...p} d="M3 11.5 12 4l9 7.5" />
        <path {...p} d="M5 10v9h14v-9" />
      </>
    ),
    cards: (
      <>
        <rect {...p} x="3" y="5" width="13" height="15" rx="2.5" />
        <path {...p} d="M8 4.5 19 7l-2.2 12" />
      </>
    ),
    doc: (
      <>
        <path {...p} d="M6 3h8l4 4v14H6z" />
        <path {...p} d="M14 3v4h4" />
        <path {...p} d="M9 12h6M9 16h4" />
      </>
    ),
    trophy: (
      <>
        <path {...p} d="M7 4h10v4a5 5 0 0 1-10 0z" />
        <path {...p} d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
        <path {...p} d="M12 13v3M9 20h6M10 20v-2.5h4V20" />
      </>
    ),
    user: (
      <>
        <circle {...p} cx="12" cy="8" r="3.5" />
        <path {...p} d="M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
      </>
    ),
    mic: (
      <>
        <rect {...p} x="9" y="3" width="6" height="11" rx="3" />
        <path {...p} d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
    send: (
      <>
        <path {...p} d="M4 12 20 4l-6 16-3.5-6.5z" />
        <path {...p} d="M10.5 13.5 20 4" />
      </>
    ),
    speaker: (
      <>
        <path {...p} d="M4 9v6h4l5 4V5L8 9z" />
        <path {...p} d="M16.5 9a4 4 0 0 1 0 6" />
      </>
    ),
    play: (
      <>
        <path {...p} d="M8 5v14l11-7z" />
      </>
    ),
    logout: (
      <>
        <path {...p} d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
        <path {...p} d="M9 12h10M15 8l4 4-4 4" />
      </>
    ),
    google: (
      <g>
        <path
          fill="#4285F4"
          d="M21.6 12.2c0-.6-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 5-1 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"
        />
        <path
          fill="#EA4335"
          d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1z"
        />
      </g>
    ),
    search: (
      <>
        <circle {...p} cx="11" cy="11" r="6.5" />
        <path {...p} d="m20 20-3.5-3.5" />
      </>
    ),
    download: (
      <>
        <path {...p} d="M12 4v10m0 0 4-4m-4 4-4-4" />
        <path {...p} d="M5 19h14" />
      </>
    ),
    clap: (
      <>
        <path {...p} d="M7 11 5.5 9.5a1.5 1.5 0 0 1 2-2L10 10" />
        <path
          {...p}
          d="M9 13 6 10a1.5 1.5 0 0 0-2 2l3.5 4c1.5 1.7 3 2.5 5 2.5 3 0 5-2 5-5l-.5-4.5a1.4 1.4 0 0 0-2.8.3"
        />
        <path
          {...p}
          d="M12.5 12 11 8.5a1.4 1.4 0 0 1 2.6-1l1.2 3M16 5l1-1.5M19 7l1.5-.7M14 4l.3-1.8"
        />
      </>
    ),
    chat: (
      <>
        <path {...p} d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4z" />
        <path {...p} d="M9 10h6M9 13h4" />
      </>
    ),
    check: (
      <>
        <path {...p} d="m5 12 5 5 9-10" />
      </>
    ),
    x: (
      <>
        <path {...p} d="M6 6l12 12M18 6 6 18" />
      </>
    ),
    arrow: (
      <>
        <path {...p} d="M5 12h14m-5-5 5 5-5 5" />
      </>
    ),
    fire: (
      <>
        <path
          {...p}
          d="M12 3c1 3-1.5 4-1.5 6.5a3 3 0 0 0 6 0c0-1-.3-2-.8-2.8 2 1 3.3 3.2 3.3 5.8a7 7 0 0 1-14 0c0-3.3 2-5.5 4-7.5C10 6 11 4.5 12 3z"
        />
      </>
    ),
    bell: (
      <>
        <path {...p} d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 1.5 6H4.5S6 14 6 9z" />
        <path {...p} d="M10 19a2 2 0 0 0 4 0" />
      </>
    ),
    save: (
      <>
        <path {...p} d="M5 4h11l3 3v13H5z" />
        <path {...p} d="M8 4v5h7V4M8 20v-6h8v6" />
      </>
    ),
    edit: (
      <>
        <path {...p} d="M5 19h14M7 15l9-9 3 3-9 9-4 1z" />
      </>
    ),
    flag: (
      <>
        <path {...p} d="M6 3v18M6 4h11l-2 3 2 3H6" />
      </>
    ),
    sparkle: (
      <>
        <path
          {...p}
          d="M12 4l1.8 4.7L18 10l-4.2 1.3L12 16l-1.8-4.7L6 10l4.2-1.3z"
        />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" style={s} className={className}>
      {paths[name] ?? null}
    </svg>
  );
}

/* ─── LogoMark ─── */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <span
      className="mark"
      style={{ width: size, height: size, borderRadius: size * 0.32 }}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: size * 0.62, height: size * 0.62 }}
      >
        <path
          fill="#fff"
          d="M5 17V8.5c0-.6.7-.9 1.2-.5L12 12l5.8-4c.5-.4 1.2 0 1.2.5V17h-2.6v-5l-3.6 2.5c-.5.3-1 .3-1.5 0L7.6 12v5z"
        />
      </svg>
    </span>
  );
}

/* ─── Wordmark ─── */
export function Wordmark({
  size = 26,
  mark = true,
  light = false,
}: {
  size?: number;
  mark?: boolean;
  light?: boolean;
}) {
  return (
    <span
      className="wordmark"
      style={{ fontSize: size, color: light ? "#fff" : undefined }}
    >
      {mark && <LogoMark size={size * 1.12} />}
      <span>Mimic</span>
    </span>
  );
}

/* ─── Parrot (uses our mascot SVG) ─── */
export function Parrot({
  slot,
  w = 120,
  h = 120,
  float = false,
}: {
  slot: string;
  w?: number;
  h?: number;
  float?: boolean;
}) {
  return (
    <img
      id={`parrot-${slot}`}
      src="../assets/mascot.svg"
      alt="Mimic 캐릭터"
      style={{
        width: w,
        height: h,
        display: "block",
        animation: float ? "floatY 4.5s ease-in-out infinite" : undefined,
      }}
    />
  );
}

/* ─── ScoreRing ─── */
export function ScoreRing({
  score,
  size = 132,
  stroke = 12,
  showLabel = true,
  animate = true,
}: {
  score: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  animate?: boolean;
}) {
  const [v, setV] = useState(animate ? 0 : score);
  useEffect(() => {
    const t = setTimeout(() => setV(score), 80);
    return () => clearTimeout(t);
  }, [score]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    score >= 80
      ? "var(--score-hi)"
      : score >= 60
        ? "var(--score-mid)"
        : "var(--score-lo)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EAEFE7"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          className="ring-num"
          style={{ fontSize: size * 0.3, color, lineHeight: 1 }}
        >
          {Math.round(v)}
        </div>
        {showLabel && (
          <div
            style={{
              fontSize: size * 0.1,
              color: "var(--text-3)",
              fontWeight: 600,
            }}
          >
            / 100
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sidebar ─── */
export function Sidebar({
  view,
  go,
  onLogout,
}: {
  view: ViewType;
  go: (v: ViewType) => void;
  onLogout: () => void;
}) {
  return (
    <aside
      style={{
        width: 252,
        flexShrink: 0,
        background: "var(--side-bg)",
        borderRight: "1px solid var(--side-border)",
        display: "flex",
        flexDirection: "column",
        padding: "22px 18px",
        position: "sticky",
        top: 0,
        height: "100vh",
        color: "var(--side-text)",
      }}
    >
      <div style={{ padding: "4px 8px 18px" }}>
        <Wordmark size={24} light />
      </div>

      {/* profile */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "14px 8px 18px",
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            background:
              "linear-gradient(150deg,var(--brand-300),var(--brand-600))",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,.3)",
          }}
        >
          <LogoMark size={40} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 15.5 }}>
            {USER.name}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--side-text-dim)" }}>
            {USER.email}
          </div>
        </div>
        <span className="badge badge-streak" style={{ marginTop: 2 }}>
          <Icon name="fire" size={13} /> {USER.streak}일 연속
        </span>
      </div>

      {/* nav */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 6,
        }}
      >
        {NAV.map((n) => {
          const on = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => go(n.id as ViewType)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: "var(--r-md)",
                border: "none",
                background: on ? "var(--side-active-bg)" : "transparent",
                color: on ? "var(--side-active-text)" : "var(--side-text)",
                fontWeight: on ? 700 : 500,
                fontSize: 15,
                cursor: "pointer",
                transition: "background .15s, color .15s",
                textAlign: "left",
              }}
            >
              <Icon name={n.icon as IconName} size={20} />
              {n.ko}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid var(--side-border)",
        }}
      >
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: "var(--r-md)",
            border: "none",
            background: "transparent",
            color: "var(--side-text-dim)",
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <Icon name="logout" size={18} /> 로그아웃
        </button>
      </div>
    </aside>
  );
}

/* ─── PageHead ─── */
export function PageHead({
  icon,
  title,
  sub,
  right,
}: {
  icon?: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon && <span style={{ fontSize: 26 }}>{icon}</span>}
          <h1
            style={{
              margin: 0,
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {title}
          </h1>
        </div>
        {sub && (
          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-3)",
              fontSize: 14.5,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

/* ─── levelBadge ─── */
export function levelBadge(lv: Level) {
  const L = LEVELS[lv];
  return <span className={`badge badge-${L.cls}`}>{L.ko}</span>;
}

/* ─── useRef re-export for convenience ─── */
export { useRef };
