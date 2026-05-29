import { useState, useEffect } from "react";
import { Wordmark, Icon, Parrot } from "../components/Shell";
import type { ViewType } from "../types";

interface Props {
  initialTab?: "login" | "signup";
  onAuthed: () => void;
  go: (v: ViewType) => void;
}

export default function Auth({ initialTab = "login", onAuthed, go }: Props) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    setErr("");
  }, [tab]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.email || !f.pw) {
      setErr("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (!/.+@.+\..+/.test(f.email)) {
      setErr("올바른 이메일 형식이 아니에요.");
      return;
    }
    if (tab === "signup") {
      if (!f.name) {
        setErr("닉네임을 입력해주세요.");
        return;
      }
      if (f.pw.length < 6) {
        setErr("비밀번호는 6자 이상이어야 해요.");
        return;
      }
      if (f.pw !== f.pw2) {
        setErr("비밀번호가 일치하지 않아요.");
        return;
      }
    }
    onAuthed();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        padding: 24,
        position: "relative",
      }}
    >
      <button
        className="btn btn-sm"
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          background: "transparent",
          color: "var(--text-3)",
          padding: 6,
        }}
        onClick={() => go("landing")}
      >
        ← 홈으로
      </button>

      <div style={{ width: 410, animation: "fadeUp .45s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Parrot slot="auth" w={92} h={92} float />
          </div>
          <Wordmark size={30} mark={false} />
          <p
            style={{ color: "var(--text-3)", margin: "8px 0 0", fontSize: 15 }}
          >
            {tab === "login"
              ? "다시 만나서 반가워요!"
              : "한 마디씩, 말하는 그날까지 🦜"}
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: 26,
            borderRadius: "var(--r-xl)",
            boxShadow: "var(--sh-md)",
          }}
        >
          <div className="segment" style={{ width: "100%", marginBottom: 20 }}>
            {(["login", "signup"] as const).map((k) => (
              <button
                key={k}
                className={tab === k ? "on" : ""}
                style={{ flex: 1 }}
                onClick={() => setTab(k)}
              >
                {k === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <form
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: 11 }}
          >
            {tab === "signup" && (
              <div className="field">
                <span className="ic">
                  <Icon name="user" size={18} />
                </span>
                <input
                  placeholder="닉네임"
                  value={f.name}
                  onChange={set("name")}
                />
              </div>
            )}
            <div className="field">
              <span className="ic">
                <Icon name="user" size={18} />
              </span>
              <input
                placeholder="이메일"
                type="email"
                value={f.email}
                onChange={set("email")}
              />
            </div>
            <div className="field">
              <span className="ic">
                <Icon name="save" size={18} />
              </span>
              <input
                placeholder={
                  tab === "signup" ? "비밀번호 (6자 이상)" : "비밀번호"
                }
                type="password"
                value={f.pw}
                onChange={set("pw")}
              />
            </div>
            {tab === "signup" && (
              <div className="field">
                <span className="ic">
                  <Icon name="check" size={18} />
                </span>
                <input
                  placeholder="비밀번호 확인"
                  type="password"
                  value={f.pw2}
                  onChange={set("pw2")}
                />
              </div>
            )}
            {err && (
              <div
                style={{
                  background: "var(--lv-adv-bg)",
                  color: "#cf443c",
                  fontSize: 13.5,
                  padding: "9px 13px",
                  borderRadius: "var(--r-sm)",
                  fontWeight: 600,
                }}
              >
                {err}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-md btn-block"
              style={{ marginTop: 4 }}
            >
              {tab === "login" ? "로그인" : "시작하기 🚀"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12.5,
            color: "var(--text-3)",
            marginTop: 16,
          }}
        >
          계속 진행하면 <u>이용약관</u> 및 <u>개인정보처리방침</u>에 동의하게
          됩니다.
        </p>
      </div>
    </div>
  );
}
