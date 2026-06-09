import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { LEVELS, NAV } from "../lib/data";
import { useAuth } from "../context/AuthContext";
import type { Level, ViewType } from "../types";
import mascotSrc from "../assets/mascot.svg";
import profileIconSrc from "../assets/profile_icon.svg";

/* ─── Icon ─── */
type IconName =
  | "home" | "cards" | "doc" | "trophy" | "user"
  | "mic" | "send" | "speaker" | "play" | "logout"
  | "search" | "download" | "clap" | "chat" | "check"
  | "x" | "arrow" | "fire" | "bell" | "save" | "edit"
  | "flag" | "sparkle" | "moon" | "sun";

interface IconProps { name: IconName; size?: number; className?: string; style?: CSSProperties; }

export function Icon({ name, size = 20, className, style }: IconProps) {
  const s: CSSProperties = { width: size, height: size, display: "block", ...style };
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    // ─── 제공된 SVG 아이콘 (currentColor로 색상 제어)
    home:   <path fill="currentColor" d="M22.262 10.4681C18.872 7.61405 12.716 2.29705 12.655 2.24305L12 1.68005L11.348 2.24305C11.286 2.29605 5.127 7.61105 1.688 10.4911C1.47405 10.6804 1.30225 10.9125 1.18374 11.1725C1.06522 11.4324 1.00262 11.7144 1 12.0001C1 12.5305 1.21071 13.0392 1.58579 13.4143C1.96086 13.7893 2.46957 14.0001 3 14.0001H4V20.0001C4 20.5305 4.21071 21.0392 4.58579 21.4143C4.96086 21.7893 5.46957 22.0001 6 22.0001H18C18.5304 22.0001 19.0391 21.7893 19.4142 21.4143C19.7893 21.0392 20 20.5305 20 20.0001V14.0001H21C21.5304 14.0001 22.0391 13.7893 22.4142 13.4143C22.7893 13.0392 23 12.5305 23 12.0001C23 11.4021 22.725 10.8391 22.262 10.4681ZM14 20.0001H10V15.0001H14V20.0001ZM18 12.0001L18.002 20.0001H15V14.0001H9V20.0001H6V12.0001H2.999C5.764 9.68805 10.314 5.77305 12 4.32005C13.686 5.77305 18.234 9.68705 21 12.0011L18 12.0001Z" />,
    cards:  <path fill="currentColor" d="M6 22C5.45 22 4.97933 21.8043 4.588 21.413C4.19667 21.0217 4.00067 20.5507 4 20V4C4 3.45 4.196 2.97933 4.588 2.588C4.98 2.19667 5.45067 2.00067 6 2H18C18.55 2 19.021 2.196 19.413 2.588C19.805 2.98 20.0007 3.45067 20 4V20C20 20.55 19.8043 21.021 19.413 21.413C19.0217 21.805 18.5507 22.0007 18 22H6ZM6 20H18V4H16V10.125C16 10.325 15.9167 10.471 15.75 10.563C15.5833 10.655 15.4167 10.6507 15.25 10.55L14.025 9.8C13.8583 9.7 13.6873 9.65 13.512 9.65C13.3367 9.65 13.166 9.7 13 9.8L11.775 10.55C11.6083 10.65 11.4377 10.6543 11.263 10.563C11.0883 10.4717 11.0007 10.3257 11 10.125V4H6V20Z" />,
    doc:    <path fill="currentColor" d="M6.66625 22.7679H17.3334C19.4128 22.7679 20.4474 21.7132 20.4474 19.6239V10.5035C20.4474 9.20746 20.3068 8.64518 19.5032 7.82146L13.9584 2.18661C13.1955 1.40275 12.5724 1.23218 11.4375 1.23218H6.66625C4.5971 1.23218 3.55225 2.29675 3.55225 4.38646V19.6239C3.55225 21.723 4.5971 22.7679 6.66625 22.7679ZM6.74639 21.1509C5.71182 21.1509 5.16925 20.598 5.16925 19.5939V4.41646C5.16925 3.42218 5.71182 2.84918 6.75667 2.84918H11.2164V8.68546C11.2164 9.95104 11.8592 10.5737 13.1047 10.5737H18.8304V19.5939C18.8304 20.598 18.2977 21.1509 17.2532 21.1509H6.74639ZM13.2855 9.05661C12.8938 9.05661 12.7327 8.89632 12.7327 8.49432V3.16075L18.5184 9.05703L13.2855 9.05661ZM15.6962 13.3359H8.07196C7.71067 13.3359 7.44967 13.6072 7.44967 13.9487C7.44967 14.3002 7.7111 14.5715 8.07239 14.5715H15.6962C15.7784 14.5728 15.86 14.5576 15.9361 14.5268C16.0123 14.496 16.0814 14.4501 16.1395 14.392C16.1976 14.334 16.2435 14.2648 16.2743 14.1886C16.3051 14.1125 16.3203 14.0309 16.319 13.9487C16.319 13.6072 16.0477 13.3359 15.6962 13.3359ZM15.6962 16.8416H8.07196C7.71067 16.8416 7.44967 17.1227 7.44967 17.4742C7.44967 17.8157 7.7111 18.0772 8.07239 18.0772H15.6962C16.0477 18.0772 16.319 17.8157 16.319 17.4742C16.319 17.1227 16.0477 16.8416 15.6962 16.8416Z" />,
    trophy: <><path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M2 22C2 20.585 2 19.878 2.44 19.44C2.879 19 3.585 19 5 19C6.415 19 7.122 19 7.56 19.44C8 19.879 8 20.586 8 22V13C8 11.585 8 10.878 8.44 10.44C8.879 10 9.586 10 11 10H13C14.415 10 15.122 10 15.56 10.44C16 10.879 16 11.586 16 13V22V19C16 17.585 16 16.878 16.44 16.44C16.879 16 17.585 16 19 16C20.415 16 21.122 16 21.56 16.44C22 16.879 22 17.586 22 19V22" /><path fill="none" stroke="currentColor" strokeWidth="1.5" d="M11.146 3.023C11.526 2.34 11.716 2 12 2C12.284 2 12.474 2.34 12.854 3.023L12.952 3.199C13.06 3.393 13.114 3.489 13.198 3.553C13.283 3.617 13.388 3.641 13.598 3.688L13.788 3.732C14.526 3.899 14.895 3.982 14.983 4.264C15.071 4.546 14.819 4.841 14.316 5.429L14.186 5.581C14.043 5.748 13.971 5.831 13.939 5.935C13.907 6.039 13.918 6.15 13.939 6.373L13.959 6.576C14.035 7.361 14.073 7.754 13.844 7.928C13.614 8.103 13.268 7.943 12.577 7.625L12.399 7.543C12.202 7.453 12.104 7.407 12 7.407C11.896 7.407 11.798 7.453 11.601 7.543L11.423 7.625C10.732 7.943 10.386 8.103 10.156 7.928C9.92604 7.754 9.96504 7.361 10.041 6.576L10.061 6.373C10.082 6.15 10.093 6.039 10.061 5.935C10.029 5.831 9.95704 5.748 9.81404 5.581L9.68404 5.429C9.18104 4.841 8.92904 4.547 9.01704 4.264C9.10504 3.982 9.47404 3.899 10.212 3.732L10.402 3.688C10.612 3.641 10.717 3.618 10.802 3.553C10.886 3.489 10.94 3.393 11.048 3.199L11.146 3.023Z" /></>,
    user:   <path fill="currentColor" d="M9.175 10.825C8.39167 10.0417 8 9.1 8 8C8 6.9 8.39167 5.95833 9.175 5.175C9.95833 4.39167 10.9 4 12 4C13.1 4 14.0417 4.39167 14.825 5.175C15.6083 5.95833 16 6.9 16 8C16 9.1 15.6083 10.0417 14.825 10.825C14.0417 11.6083 13.1 12 12 12C10.9 12 9.95833 11.6083 9.175 10.825ZM4 18V17.2C4 16.6333 4.146 16.1127 4.438 15.638C4.73 15.1633 5.11733 14.8007 5.6 14.55C6.63333 14.0333 7.68333 13.646 8.75 13.388C9.81667 13.13 10.9 13.0007 12 13C13.1 12.9993 14.1833 13.1287 15.25 13.388C16.3167 13.6473 17.3667 14.0347 18.4 14.55C18.8833 14.8 19.271 15.1627 19.563 15.638C19.855 16.1133 20.0007 16.634 20 17.2V18C20 18.55 19.8043 19.021 19.413 19.413C19.0217 19.805 18.5507 20.0007 18 20H6C5.45 20 4.97933 19.8043 4.588 19.413C4.19667 19.0217 4.00067 18.5507 4 18ZM6 18H18V17.2C18 17.0167 17.9543 16.85 17.863 16.7C17.7717 16.55 17.6507 16.4333 17.5 16.35C16.6 15.9 15.6917 15.5627 14.775 15.338C13.8583 15.1133 12.9333 15.0007 12 15C11.0667 14.9993 10.1417 15.112 9.225 15.338C8.30833 15.564 7.4 15.9013 6.5 16.35C6.35 16.4333 6.229 16.55 6.137 16.7C6.045 16.85 5.99933 17.0167 6 17.2V18ZM13.413 9.413C13.8043 9.021 14 8.55 14 8C14 7.45 13.8043 6.97933 13.413 6.588C13.0217 6.19667 12.5507 6.00067 12 6C11.4493 5.99933 10.9787 6.19533 10.588 6.588C10.1973 6.98067 10.0013 7.45133 10 8C9.99867 8.54867 10.1947 9.01967 10.588 9.413C10.9813 9.80633 11.452 10.002 12 10C12.548 9.998 13.019 9.80233 13.413 9.413Z" />,
    mic:    <g transform="scale(1.5)"><path fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M6 14H10M12 6.5V7.5C12 9.7 10.2 11.5 8 11.5M8 11.5C5.8 11.5 4 9.7 4 7.5V6.5M8 11.5V14" /><path fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M8.00003 2.00003C7.73701 1.9987 7.47634 2.04953 7.23309 2.14957C6.98984 2.24961 6.76884 2.39688 6.58286 2.58286C6.39688 2.76884 6.24961 2.98984 6.14957 3.23309C6.04953 3.47634 5.9987 3.73701 6.00003 4.00003V7.46878C6.00003 8.56878 6.90628 9.50003 8.00003 9.50003C9.09378 9.50003 10 8.59378 10 7.46878V4.00003C10 2.87503 9.12503 2.00003 8.00003 2.00003Z" /></g>,
    logout: <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M3 5C3 3.9 3.9 3 5 3H13V5H5V19H13V21H5C3.9 21 3 20.1 3 19V5ZM17.176 11L14.64 8.464L16.054 7.05L21.004 12L16.054 16.95L14.64 15.536L17.176 13H10.59V11H17.176Z" />,
    // ─── 나머지는 기존 인라인 SVG 유지
    send:     <><path {...p} d="M4 12 20 4l-6 16-3.5-6.5z" /><path {...p} d="M10.5 13.5 20 4" /></>,
    speaker:  <><path {...p} d="M4 9v6h4l5 4V5L8 9z" /><path {...p} d="M16.5 9a4 4 0 0 1 0 6" /></>,
    play:     <><path {...p} d="M8 5v14l11-7z" /></>,
    search:   <><circle {...p} cx="11" cy="11" r="6.5" /><path {...p} d="m20 20-3.5-3.5" /></>,
    download: <><path {...p} d="M12 4v10m0 0 4-4m-4 4-4-4" /><path {...p} d="M5 19h14" /></>,
    clap:     <><path {...p} d="M7 11 5.5 9.5a1.5 1.5 0 0 1 2-2L10 10" /><path {...p} d="M9 13 6 10a1.5 1.5 0 0 0-2 2l3.5 4c1.5 1.7 3 2.5 5 2.5 3 0 5-2 5-5l-.5-4.5a1.4 1.4 0 0 0-2.8.3" /><path {...p} d="M12.5 12 11 8.5a1.4 1.4 0 0 1 2.6-1l1.2 3M16 5l1-1.5M19 7l1.5-.7M14 4l.3-1.8" /></>,
    chat:     <><path {...p} d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4z" /><path {...p} d="M9 10h6M9 13h4" /></>,
    check:    <><path {...p} d="m5 12 5 5 9-10" /></>,
    x:        <><path {...p} d="M6 6l12 12M18 6 6 18" /></>,
    arrow:    <><path {...p} d="M5 12h14m-5-5 5 5-5 5" /></>,
    fire:     <><path {...p} d="M12 3c1 3-1.5 4-1.5 6.5a3 3 0 0 0 6 0c0-1-.3-2-.8-2.8 2 1 3.3 3.2 3.3 5.8a7 7 0 0 1-14 0c0-3.3 2-5.5 4-7.5C10 6 11 4.5 12 3z" /></>,
    bell:     <><path {...p} d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 1.5 6H4.5S6 14 6 9z" /><path {...p} d="M10 19a2 2 0 0 0 4 0" /></>,
    save:     <><path {...p} d="M5 4h11l3 3v13H5z" /><path {...p} d="M8 4v5h7V4M8 20v-6h8v6" /></>,
    edit:     <><path {...p} d="M5 19h14M7 15l9-9 3 3-9 9-4 1z" /></>,
    flag:     <><path {...p} d="M6 3v18M6 4h11l-2 3 2 3H6" /></>,
    sparkle:  <><path {...p} d="M12 4l1.8 4.7L18 10l-4.2 1.3L12 16l-1.8-4.7L6 10l4.2-1.3z" /></>,
    moon:     <><path {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></>,
    sun:      <><circle {...p} cx="12" cy="12" r="4" /><path {...p} d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
  };
  return <svg viewBox="0 0 24 24" style={s} className={className}>{paths[name] ?? null}</svg>;
}

/* ─── LogoMark ─── */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <span className="mark" style={{ width: size, height: size, borderRadius: size * 0.32 }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.62, height: size * 0.62 }}>
        <path fill="#fff" d="M5 17V8.5c0-.6.7-.9 1.2-.5L12 12l5.8-4c.5-.4 1.2 0 1.2.5V17h-2.6v-5l-3.6 2.5c-.5.3-1 .3-1.5 0L7.6 12v5z" />
      </svg>
    </span>
  );
}

/* ─── Wordmark ─── */
export function Wordmark({ size = 26, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      {mark && <LogoMark size={size * 1.12} />}
      <span>Mimic</span>
    </span>
  );
}

/* ─── ProfileAvatar ─── */
export function ProfileAvatar({ size = 40 }: { size?: number }) {
  return (
    <img src={profileIconSrc} alt="profile"
      style={{ width: size, height: size, borderRadius: "50%", display: "block", objectFit: "cover", flexShrink: 0 }} />
  );
}

/* ─── Parrot ─── */
export function Parrot({ slot, w = 120, h = 120, float = false }: { slot: string; w?: number; h?: number; float?: boolean }) {
  return (
    <img id={`parrot-${slot}`} src={mascotSrc} alt="Mimic 캐릭터"
      style={{ width: w, height: h, display: "block", animation: float ? "floatY 4.5s ease-in-out infinite" : undefined }} />
  );
}

/* ─── ScoreRing ─── */
export function ScoreRing({ score, size = 132, stroke = 12, showLabel = true, animate = true }: {
  score: number; size?: number; stroke?: number; showLabel?: boolean; animate?: boolean;
}) {
  const [v, setV] = useState(animate ? 0 : score);
  useEffect(() => { const t = setTimeout(() => setV(score), 80); return () => clearTimeout(t); }, [score]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "var(--score-hi)" : score >= 60 ? "var(--score-mid)" : "var(--score-lo)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div className="ring-num" style={{ fontSize: size * 0.3, color, lineHeight: 1 }}>{Math.round(v)}</div>
        {showLabel && <div style={{ fontSize: size * 0.1, color: "var(--text-3)", fontWeight: 600 }}>/ 100</div>}
      </div>
    </div>
  );
}

/* ─── Sidebar ─── */
export function Sidebar({ view, go, onLogout, darkMode, onToggleDark }: {
  view: ViewType;
  go: (v: ViewType) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}) {
  const { user } = useAuth();
  const nickname = (user?.user_metadata?.nickname as string) || user?.email?.split("@")[0] || "사용자";
  const email    = user?.email ?? "";

  return (
    <aside style={{
      width: 232,
      flexShrink: 0,
      background: "var(--bg)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "22px 16px",
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* logo */}
      <div style={{ padding: "4px 8px 20px" }}>
        <Wordmark size={22} />
      </div>

      {/* profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 8px 18px", borderBottom: "1px solid var(--border)" }}>
        <ProfileAvatar size={40} />
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nickname}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 14, flex: 1 }}>
        {NAV.map(n => {
          const on = view === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id as ViewType)} style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px", borderRadius: "var(--r-md)", border: "none",
              background: on ? "var(--brand-50)" : "transparent",
              color: on ? "var(--brand-strong)" : "var(--text-2)",
              fontWeight: on ? 700 : 500,
              fontSize: 14.5, cursor: "pointer",
              transition: "background .15s, color .15s",
              textAlign: "left",
            }}>
              <Icon name={n.icon as IconName} size={19} />
              {n.ko}
            </button>
          );
        })}
      </nav>

      {/* bottom */}
      <div style={{ paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* dark mode toggle */}
        <button onClick={onToggleDark} style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: "10px 12px", borderRadius: "var(--r-md)", border: "none",
          background: "transparent", color: "var(--text-3)",
          fontSize: 14, cursor: "pointer", width: "100%",
        }}>
          <Icon name={darkMode ? "sun" : "moon"} size={18} />
          {darkMode ? "라이트 모드" : "다크 모드"}
        </button>

        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: "10px 12px", borderRadius: "var(--r-md)", border: "none",
          background: "transparent", color: "var(--text-3)",
          fontSize: 14, cursor: "pointer", width: "100%",
        }}>
          <Icon name="logout" size={18} /> 로그아웃
        </button>
      </div>
    </aside>
  );
}

/* ─── PageHead ─── */
export function PageHead({ icon, title, sub, right }: { icon?: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon && <span style={{ fontSize: 26 }}>{icon}</span>}
          <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>{title}</h1>
        </div>
        {sub && <p style={{ margin: "6px 0 0", color: "var(--text-3)", fontSize: 14.5 }}>{sub}</p>}
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

/* ─── useRef re-export ─── */
export { useRef };
