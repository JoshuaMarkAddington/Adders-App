import React, { useState, useEffect, useId, useRef } from "react";
import {
  Home as HomeIcon, BarChart3, LogOut, RotateCcw, ChevronRight, Bell, Calendar,
  Lock, CreditCard, Users, Plus, Baby, Settings, ShieldAlert, Play,
} from "lucide-react";

/* =========================================================================
   ADDERS ENTERTAINMENT — clickable prototype (v2: full-screen + immersive)
   Mock data only. Real auth / SMS / Stripe wire in at deploy.
   ========================================================================= */

const C = {
  bg: "#070B14", bg2: "#0C1322", panel: "#101A2E", line: "#243150",
  text: "#E9EDF6", muted: "#8B95AD",
  blue: "#5B9BD5", blueDeep: "#1F4F8F",
  gold: "#D9B65C", goldDeep: "#A9842F",
  copper: "#F0894A", copperDeep: "#B5471E",
  crimson: "#D14B4B", crimsonDeep: "#922A2A",
  green: "#46C68C", greenDeep: "#1B7A4E",
};

const PALETTE = {
  entertainment: ["#7FB0E0", "#214E8C"],
  pictures: ["#E6CB76", "#A9842F"],
  cinemas: ["#5AD0A0", "#1B7A4E"],
  filmschool: ["#F3A35E", "#B5471E"],
};

const SUBS = {
  pictures: { title: "PICTURES", pair: PALETTE.pictures, color: C.gold, tag: "Visit site", desc: "Our film & production house." },
  cinemas: { title: "CINEMAS", pair: PALETTE.cinemas, color: C.green, tag: "Coming soon", desc: "The big-screen experience." },
  filmschool: { title: "FILM SCHOOL", pair: PALETTE.filmschool, color: C.copper, tag: "Enter", desc: "Master the craft. Find your voice." },
};

const MODULE_DATA = [
  ["Scriptwriting", 38, 40],
  ["Cinematography & AudioVisual Production", 31, 40],
  ["Editing & Digital Mastering", 27, 40],
  ["Acting for Screen", 22, 40],
  ["Directing & Production Leadership", 18, 30],
  ["Sketch to Screen", 16, 30],
  ["Advanced Cinematography", 14, 30],
  ["The Recording Suite: Vocal Edition", 12, 25],
  ["Musical Theatre for Screen", 11, 30],
  ["Cinematic Lighting", 9, 30],
  ["Advanced Dance", 7, 25],
  ["Voice Acting & Foley Performance", 5, 25],
];

/* ---------- module options & rules ---------- */
const M1 = ["Scriptwriting","Acting for Screen","Musical Theatre for Screen","Cinematography & AudioVisual Production"];
const M2_ALL = ["Acting for Screen","Musical Theatre for Screen","Cinematography & AudioVisual Production","Directing & Production Leadership","Editing & Digital Mastering"];
const M3_ALL = ["The Recording Suite: Vocal Edition","Advanced Cinematography","Cinematic Lighting","Editing & Digital Mastering","Sketch To Screen","Advanced Dance","Voice Acting & Foley Performance"];
const M_LOCK = ["Acting for Screen","Musical Theatre for Screen","Cinematography & AudioVisual Production"];
const m2Opts = m1 => M_LOCK.includes(m1) ? [m1] : m1 === "Scriptwriting" ? ["Directing & Production Leadership","Editing & Digital Mastering"] : M2_ALL;
const m3Opts = m2 => m2 === "Editing & Digital Mastering" ? ["Editing & Digital Mastering"] : M3_ALL;

// Module descriptions (from the Adders Film School website)
const MODULE_INFO = {
  "Scriptwriting": "Great films start with great stories. Master WriterDuet, the industry-standard collaborative scriptwriting software, and learn to craft professional-grade scripts — from character development to dialogue and structure.",
  "Acting for Screen": "Step into the spotlight and master presence in ultra-high-definition. In our 6K environment, every heartbeat, breath and subtle expression becomes a storytelling tool — equipping you with the cinematic realism modern 4K HDR filmmaking demands.",
  "Musical Theatre for Screen": "Where Broadway meets the big screen. Translate live-performance energy into cinematic narratives, focusing on precision lip-syncing, movement for camera, and integrating high-fidelity audio with stunning 6K visuals.",
  "Cinematography & AudioVisual Production": "Get hands-on with the Blackmagic Pyxis 6K camera. Learn to manipulate light, texture and depth of field in 4K HDR, giving you the skills to create visually stunning productions that stand out.",
  "Directing & Production Leadership": "Learn what it takes to lead a production from start to finish — technical expertise, creative vision and managing complex emotional beats. Gain the tools to lead your team and bring your artistic vision to life.",
  "Editing & Digital Mastering": "Where your film comes alive. Dive into DaVinci Resolve and learn advanced editing, Fusion for visual effects, HDR grading and audio mastering — finishing your projects professionally, ready for the silver screen.",
  "The Recording Suite: Vocal Edition": "In our state-of-the-art recording suite, learn to capture exceptional vocal performances. From professional vocal training to advanced recording techniques, produce high-quality recordings that showcase your unique voice.",
  "Advanced Cinematography": "Unleash your visual storytelling potential. This advanced course dives into camera operation, lighting design and visual composition — the expertise to create cinematic masterpieces that captivate audiences.",
  "Cinematic Lighting": "Use light as a narrative tool to shape mood, atmosphere and meaning. Explore technical and creative approaches — from traditional methods to AI-assisted tools — designing lighting for multi-shot sequences.",
  "Sketch To Screen": "Learn improvisation and the art of devising original sketches. Develop your ideas from concept to screen through hands-on workshops covering character development, dialogue and on-camera performance, ending with a final film.",
  "Advanced Dance": "Master the technical and artistic aspects of dance for screen — precision, artistry and adaptability across styles. Translate movement into cinematic narratives alongside choreographers and directors.",
  "Voice Acting & Foley Performance": "Bring characters and scenes to life through sound. Covers voice-acting techniques, foley artistry and audio layering to create immersive soundscapes that elevate your storytelling.",
};

/* ---------- maze emblem ---------- */
function MazeMark({ pair = PALETTE.entertainment, size = 120, className, style }) {
  const id = useId().replace(/:/g, "");
  const [light, dark] = pair;
  const rings = [
    { r: 86, dash: "120 26", off: 0 }, { r: 72, dash: "70 30", off: 20 },
    { r: 58, dash: "95 22", off: 40 }, { r: 44, dash: "55 26", off: 10 },
    { r: 30, dash: "70 18", off: 30 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={`g${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={light} /><stop offset="100%" stopColor={dark} />
        </radialGradient>
        <filter id={`s${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={light} floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter={`url(#s${id})`} stroke={`url(#g${id})`} fill="none" strokeWidth="6" strokeLinecap="round">
        <circle cx="100" cy="100" r="94" strokeWidth="3" opacity="0.5" />
        {rings.map((ring, i) => (
          <circle key={i} cx="100" cy="100" r={ring.r} strokeDasharray={ring.dash}
            strokeDashoffset={ring.off} transform={`rotate(${i * 24} 100 100)`} />
        ))}
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1="100" y1="100"
            x2={100 + 86 * Math.cos((a * Math.PI) / 180)}
            y2={100 + 86 * Math.sin((a * Math.PI) / 180)} strokeWidth="3" opacity="0.18" />
        ))}
      </g>
      <circle cx="100" cy="100" r="9" fill={`url(#g${id})`} filter={`url(#s${id})`} />
    </svg>
  );
}

function Wordmark({ name = "ADDERS", sub, subColor = C.copper, size = 34 }) {
  return (
    <div style={{ textAlign: "center", lineHeight: 1 }}>
      <div style={{
        fontFamily: "'Cinzel', serif", fontWeight: 700,
        letterSpacing: size > 30 ? 8 : 5, fontSize: size,
        background: `linear-gradient(180deg, ${C.blue}, ${C.blueDeep})`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      }}>{name}</div>
      {sub && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <span style={{ height: 1, width: 26, background: subColor, opacity: 0.6 }} />
          <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: 6, fontSize: size * 0.4, color: subColor, fontWeight: 600 }}>{sub}</span>
          <span style={{ height: 1, width: 26, background: subColor, opacity: 0.6 }} />
        </div>
      )}
    </div>
  );
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const Btn = ({ children, onClick, variant = "solid", color = C.blue, full, style }) => (
  <button onClick={onClick} style={{
    cursor: "pointer", border: variant === "ghost" ? `1px solid ${C.line}` : "none",
    background: variant === "ghost" ? "transparent" : `linear-gradient(180deg, ${color}, ${shade(color, -28)})`,
    color: variant === "ghost" ? C.text : "#070B14", fontWeight: 700, fontSize: 15,
    padding: "13px 20px", borderRadius: 12, width: full ? "100%" : "auto", letterSpacing: 0.3,
    transition: "transform .12s ease", ...style,
  }}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>{children}</button>
);

const Field = ({ label, ...rest }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, letterSpacing: 0.3 }}>{label}</span>
    <input {...rest} style={{
      marginTop: 6, width: "100%", boxSizing: "border-box", background: C.bg2,
      border: `1px solid ${C.line}`, borderRadius: 11, padding: "13px 14px", color: C.text, fontSize: 15, outline: "none",
    }}
      onFocus={(e) => (e.target.style.borderColor = C.blue)}
      onBlur={(e) => (e.target.style.borderColor = C.line)} />
  </label>
);

const Card = ({ children, style, onClick, hover }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: `linear-gradient(180deg, ${C.panel}, ${C.bg2})`,
      border: `1px solid ${h && hover ? C.line : "#1B2440"}`, borderRadius: 16, padding: 18,
      cursor: onClick ? "pointer" : "default", transform: h && hover ? "translateY(-3px)" : "none",
      transition: "transform .15s ease, border-color .15s ease", ...style,
    }}>{children}</div>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ alignSelf: "flex-start", color: C.muted, fontSize: 12, letterSpacing: 2, margin: "26px 0 12px" }}>
    {String(children).toUpperCase()}
  </div>
);

const Scroll = ({ children, style, max = 720 }) => (
  <div style={{ width: "100%", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
    <div style={{ width: "100%", maxWidth: max, padding: "0 24px 48px", boxSizing: "border-box" }}>{children}</div>
  </div>
);

/* ===================== LEFT NAV RAIL ===================== */
function Rail({ active, onNav, user, onToggleMember, onIntro, onLogout }) {
  const items = [
    { key: "library", label: "Home", icon: <HomeIcon size={20} /> },
    { key: "pictures", label: "Pictures", maze: PALETTE.pictures },
    { key: "cinemas", label: "Cinemas", maze: PALETTE.cinemas },
    { key: "filmschool", label: "Film School", maze: PALETTE.filmschool },
  ];
  return (
    <nav className="rail" style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 76, zIndex: 40,
      background: "linear-gradient(180deg,#0A101E,#070B14)", borderRight: `1px solid ${C.line}`,
      display: "flex", flexDirection: "column", padding: "16px 0", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px 14px", marginBottom: 8, borderBottom: `1px solid ${C.line}` }}>
        <MazeMark pair={PALETTE.entertainment} size={40} className="mz-idle" />
        <div className="rail-label" style={{ lineHeight: 1.15 }}>
          <div style={{ fontFamily: "'Cinzel',serif", color: C.text, fontWeight: 700, letterSpacing: 3, fontSize: 14 }}>ADDERS</div>
          <div style={{ fontFamily: "'Cinzel',serif", color: C.blue, fontWeight: 600, letterSpacing: 2, fontSize: 9.5 }}>ENTERTAINMENT</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 10px" }}>
        {items.map((it) => {
          const on = active === it.key;
          return (
            <button key={it.key} onClick={() => onNav(it.key)} title={it.label} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "11px 8px", borderRadius: 11,
              border: "none", cursor: "pointer", background: on ? "#15233f" : "transparent",
              boxShadow: on ? `inset 3px 0 0 ${C.blue}` : "none", color: on ? C.text : C.muted,
            }}>
              <span style={{ width: 24, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {it.maze ? <MazeMark pair={it.maze} size={24} /> : it.icon}
              </span>
              <span className="rail-label" style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{it.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="rail-label" style={{ fontSize: 10, color: "#4D5775", letterSpacing: 2, padding: "8px 8px 2px" }}>OWNER / PROTOTYPE</div>
        <RailMini icon={<BarChart3 size={18} />} label="Admin dashboard" accent={C.blue} onClick={() => onNav("admin")} />
        <RailMini icon={<Play size={18} />} label="Replay intro" onClick={onIntro} />
        <RailMini icon={<RotateCcw size={18} />}
          label={user.member ? "Viewing: Member" : "Viewing: Non-member"}
          accent={user.member ? C.copper : C.muted} onClick={onToggleMember} />
        <div style={{ height: 1, background: C.line, margin: "6px 8px" }} />
        <RailMini icon={<LogOut size={18} />} label="Log out" onClick={onLogout} />
      </div>
    </nav>
  );
}

const RailMini = ({ icon, label, onClick, accent = C.muted }) => (
  <button onClick={onClick} title={label} style={{
    display: "flex", alignItems: "center", gap: 16, padding: "10px 8px", borderRadius: 10,
    border: "none", cursor: "pointer", background: "transparent", color: accent,
  }}>
    <span style={{ width: 24, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>
    <span className="rail-label" style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
  </button>
);

/* ===================== SCREENS ===================== */
function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <Center>
      <MazeMark pair={PALETTE.entertainment} size={160} style={{ animation: "spinIn 1.5s cubic-bezier(.2,.7,.2,1) both" }} />
      <div style={{ marginTop: 28, animation: "fade 1s ease .9s both" }}>
        <Wordmark name="ADDERS" sub="ENTERTAINMENT" subColor={C.blue} size={38} />
      </div>
      <div style={{ position: "absolute", bottom: 34, color: C.muted, fontSize: 12, letterSpacing: 1.5, animation: "fade 1s ease 1.6s both" }}>
        ▷ YOUR INTRO VIDEO PLAYS HERE
      </div>
      <button onClick={onDone} style={cornerBtn}>Skip ›</button>
    </Center>
  );
}

function Auth({ onVerify }) {
  const [mode, setMode] = useState("login");
  const isLogin = mode === "login";
  return (
    <Scroll style={{ justifyContent: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 54 }}>
        <MazeMark pair={PALETTE.entertainment} size={92} style={{ animation: "spinIn 1.3s cubic-bezier(.2,.7,.2,1) both" }} />
        <div style={{ marginTop: 16, marginBottom: 26 }}><Wordmark name="ADDERS" size={28} /></div>

        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 22, background: C.bg2, padding: 5, borderRadius: 12 }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
                color: mode === m ? "#070B14" : C.muted,
                background: mode === m ? `linear-gradient(180deg, ${C.blue}, ${C.blueDeep})` : "transparent",
              }}>{m === "login" ? "Log in" : "Create account"}</button>
            ))}
          </div>
          {!isLogin && <Field label="Full name" placeholder="Jordan Rivers" />}
          <Field label="Email" placeholder="you@email.com" type="email" />
          {!isLogin && <Field label="Phone number" placeholder="+44 …" type="tel" />}
          <Field label="Password" placeholder="••••••••" type="password" />
          {isLogin && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2px 0 18px" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", color: C.muted, fontSize: 13 }}>
                <input type="checkbox" defaultChecked style={{ accentColor: C.blue }} /> Keep me logged in
              </label>
              <span style={{ color: C.blue, fontSize: 13, cursor: "pointer" }}>Forgot password?</span>
            </div>
          )}
          <Btn full color={C.blue} onClick={onVerify}>{isLogin ? "Log in" : "Create account"}</Btn>
          <p style={{ color: C.muted, fontSize: 12.5, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            We'll send a one-time code to your email or phone to confirm it's you.
          </p>
        </div>
      </div>
    </Scroll>
  );
}

function Verify({ onDone }) {
  const [vals, setVals] = useState(["", "", "", "", "", ""]);
  const set = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...vals]; n[i] = v; setVals(n);
    if (v && i < 5) document.getElementById(`d${i + 1}`)?.focus();
  };
  return (
    <Center>
      <MazeMark pair={PALETTE.entertainment} size={70} style={{ animation: "spinIn 1.2s ease both" }} />
      <h2 style={{ fontFamily: "'Cinzel',serif", color: C.text, marginTop: 22, marginBottom: 6, fontSize: 22 }}>Verify it's you</h2>
      <p style={{ color: C.muted, fontSize: 14, textAlign: "center", maxWidth: 300, marginBottom: 26 }}>
        Enter the 6-digit code we sent. (Demo: type anything)
      </p>
      <div style={{ display: "flex", gap: 9 }}>
        {vals.map((v, i) => (
          <input key={i} id={`d${i}`} value={v} onChange={(e) => set(i, e.target.value)} inputMode="numeric" maxLength={1} style={{
            width: 44, height: 54, textAlign: "center", fontSize: 22, fontWeight: 700, color: C.text,
            background: C.bg2, border: `1px solid ${v ? C.blue : C.line}`, borderRadius: 11, outline: "none",
          }} />
        ))}
      </div>
      <div style={{ marginTop: 28, width: "100%", maxWidth: 320 }}><Btn full color={C.blue} onClick={onDone}>Confirm</Btn></div>
      <p style={{ color: C.muted, fontSize: 13, marginTop: 16 }}>
        Didn't get it? <span style={{ color: C.blue, cursor: "pointer" }}>Resend code</span>
      </p>
    </Center>
  );
}

/* ---------- HOME (promotional landing) ---------- */
const IMG = "https://fs.addersentertainment.org/";
// Placeholder trailer — swap this URL for the real one when you send it
const TRAILER_URL = "https://eu2.contabostorage.com/ae102cc57ca240d1be6909977c40db2d:adders-pictures/video/rp1-t-090622.mp4";

function VideoHero({ onOpen }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!ref.current) return;
    if (ref.current.paused) { ref.current.play(); setPlaying(true); }
    else { ref.current.pause(); setPlaying(false); }
  };

  const goFull = () => ref.current?.requestFullscreen?.();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tick = () => setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    v.addEventListener("timeupdate", tick);
    return () => v.removeEventListener("timeupdate", tick);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 22, overflow: "hidden", background: "#030508", border: `1px solid #1B2440`, aspectRatio: "16/7", minHeight: 220, cursor: "pointer" }}
      onClick={toggle}>
      <video
        ref={ref} src={TRAILER_URL} autoPlay muted={muted} loop playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.88 }}
      />

      {/* gradient overlay — always on */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,11,20,.1) 0%, rgba(7,11,20,.45) 60%, rgba(7,11,20,.92) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,11,20,.45) 0%, transparent 55%)", pointerEvents: "none" }} />

      {/* title block */}
      <div style={{ position: "absolute", left: 26, bottom: 50, pointerEvents: "none" }}>
        <div style={{ color: C.blue, letterSpacing: 4, fontSize: 11, fontWeight: 700, fontFamily: "'Cinzel',serif", marginBottom: 10 }}>ADDERS ENTERTAINMENT</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 30, lineHeight: 1.1, margin: 0, color: C.text, fontWeight: 700 }}>Where stories<br/>are made.</h2>
        <div style={{ display: "flex", gap: 10, marginTop: 14, pointerEvents: "all" }}>
          <Btn color={C.copper} onClick={(e) => { e.stopPropagation(); onOpen("filmschool"); }} style={{ padding: "10px 18px", fontSize: 13 }}>
            Film School
          </Btn>
          <Btn variant="ghost" onClick={(e) => { e.stopPropagation(); onOpen("pictures"); }} style={{ padding: "10px 16px", fontSize: 13 }}>
            Adders Pictures
          </Btn>
        </div>
      </div>

      {/* controls row */}
      <div style={{ position: "absolute", bottom: 10, left: 14, right: 14, display: "flex", alignItems: "center", gap: 10, pointerEvents: "all" }}
        onClick={(e) => e.stopPropagation()}>
        {/* play/pause */}
        <button onClick={toggle} style={vidBtn}>{playing ? "⏸" : "▶"}</button>
        {/* progress bar */}
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.18)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: C.copper, borderRadius: 4, transition: "width .5s linear" }} />
        </div>
        {/* mute */}
        <button onClick={() => { setMuted(!muted); if (ref.current) ref.current.muted = !muted; }} style={vidBtn}>
          {muted ? "🔇" : "🔊"}
        </button>
        {/* fullscreen */}
        <button onClick={goFull} style={vidBtn} title="Full screen">⛶</button>
      </div>

      {/* big paused indicator */}
      {!playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>▶</div>
        </div>
      )}
    </div>
  );
}

const vidBtn = {
  background: "rgba(0,0,0,.45)", border: "none", color: C.text, fontSize: 14,
  width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center",
};

function Home({ user, onOpen }) {
  const companies = [
    { key: "pictures", name: "PICTURES", color: C.gold, pair: PALETTE.pictures, img: IMG + "module5.jpg", desc: "Encouraging creativity and self-discovery.", tag: "Visit site" },
    { key: "filmschool", name: "FILM SCHOOL", color: C.copper, pair: PALETTE.filmschool, img: IMG + "module4.jpg", desc: "Master the craft. Find your voice.", tag: user.member ? "Member" : "Join now" },
    { key: "cinemas", name: "CINEMAS", color: C.green, pair: PALETTE.cinemas, img: null, desc: "The big-screen experience.", tag: "Coming soon" },
  ];
  const featured = [
    ["Cinematography", "module4.jpg"], ["Directing", "module5.jpg"], ["Acting for Screen", "module1.jpg"],
    ["Editing & Mastering", "module6.jpg"], ["Scriptwriting", "module3.jpg"], ["Cinematic Lighting", "Module12.jpg"],
    ["Advanced Cinematography", "module9.jpg"],
  ];
  return (
    <Scroll max={1080} style={{ justifyContent: "flex-start" }}>
      <div style={{ paddingTop: 22 }}>
        <VideoHero onOpen={onOpen} />
      </div>

      <div style={{ marginTop: 20 }}>
        <span style={{ color: C.muted, fontSize: 13 }}>Welcome back, </span>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{user.name}</span>
      </div>

      <SectionTitle>Our companies</SectionTitle>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {companies.map((c) => (
          <button key={c.key} onClick={() => onOpen(c.key)} className="lift" style={{
            flex: "1 1 240px", position: "relative", overflow: "hidden", cursor: "pointer", textAlign: "left",
            border: `1px solid #1B2440`, borderRadius: 18, minHeight: 210, padding: 0,
            background: c.img ? "#0A1120" : `radial-gradient(120% 120% at 30% 20%, ${c.color}33, #0A1120 60%)`,
          }}>
            {c.img && <img src={c.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(7,11,20,.93))" }} />
            <div style={{ position: "absolute", top: 14, right: 14 }}><MazeMark pair={c.pair} size={30} /></div>
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 3, color: c.color, fontSize: 13 }}>ADDERS</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 2, color: C.text, fontSize: 19, marginTop: 2 }}>{c.name}</div>
              <div style={{ color: "#AEB7C8", fontSize: 12.5, marginTop: 6, lineHeight: 1.4 }}>{c.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: c.color, fontSize: 12, fontWeight: 700 }}>{c.tag} <ChevronRight size={14} /></div>
            </div>
          </button>
        ))}
      </div>

      <SectionTitle>Featured at the Film School</SectionTitle>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {featured.map(([name, file]) => (
          <div key={name} onClick={() => onOpen("filmschool")} className="lift" style={{ cursor: "pointer", flex: "0 0 168px" }}>
            <div style={{ height: 110, borderRadius: 14, overflow: "hidden", border: `1px solid #1B2440`, background: "#0A1120" }}>
              <img src={IMG + file} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            </div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginTop: 8 }}>{name}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>Film School module</div>
          </div>
        ))}
      </div>

      <SectionTitle>From Adders Pictures</SectionTitle>
      <Card hover onClick={() => onOpen("pictures")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderColor: `${C.gold}33` }}>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Got a script to review? A scene to shoot?</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 5 }}>Our production team can help bring it to life — explore our services.</div>
        </div>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", display: "inline-flex", gap: 6, alignItems: "center" }}>Services <ChevronRight size={15} /></span>
      </Card>
    </Scroll>
  );
}

/* ---------- transition overlay ---------- */
function Transition({ data, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1050); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 50% 45%, ${data.color}22, ${C.bg} 60%)`, animation: "fade .25s ease both",
    }}>
      <MazeMark pair={data.pair} size={170} style={{ animation: "spinBurst 1.05s cubic-bezier(.4,0,.2,1) both" }} />
      <div style={{ marginTop: 26, animation: "fade .5s ease .25s both" }}>
        <Wordmark name="ADDERS" sub={data.title} subColor={data.color} size={26} />
      </div>
    </div>
  );
}

function PicturesBrowser() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={browserBar}>
        <span style={{ display: "flex", gap: 6 }}>
          {[C.crimson, C.gold, "#5BC08A"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />)}
        </span>
        <span style={{ color: C.muted, fontSize: 12.5 }}>addersentertainment.org</span>
        <span style={{ width: 40 }} />
      </div>
      <Center style={{ flex: 1 }}>
        <MazeMark pair={PALETTE.pictures} size={110} className="mz-idle" />
        <div style={{ marginTop: 18 }}><Wordmark name="ADDERS" sub="PICTURES" subColor={C.gold} size={28} /></div>
        <p style={{ color: C.muted, marginTop: 22, textAlign: "center", maxWidth: 340, fontSize: 14, lineHeight: 1.6 }}>
          Opens the Adders Pictures website inside an in-app browser — visitors never leave the app.
        </p>
      </Center>
    </div>
  );
}

function Cinemas() {
  return (
    <Center>
      <MazeMark pair={PALETTE.cinemas} size={130} className="mz-idle" />
      <div style={{ marginTop: 20 }}><Wordmark name="ADDERS" sub="CINEMAS" subColor={C.green} size={30} /></div>
      <div style={{ marginTop: 26, border: `1px solid ${C.green}44`, color: C.green, padding: "9px 22px", borderRadius: 30, fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>COMING SOON</div>
      <p style={{ color: C.muted, marginTop: 20, textAlign: "center", maxWidth: 320, fontSize: 14, lineHeight: 1.6 }}>
        The big screen is on its way. We'll let you know the moment doors open.
      </p>
    </Center>
  );
}

function FilmSchoolJoin({ onStart }) {
  const plans = [
    { name: "Standard", color: C.copper, perks: ["All modules", "Professional equipment", "DaVinci Resolve", "WriterDuet", "4K HDR films", "Showreel after 24 months"], missing: ["Framed posters", "Merch pack", "T-shirt", "TOTUM card"] },
    { name: "Premium", color: C.gold, perks: ["Everything in Standard", "Framed posters", "Pen, notepad & bottle", "T-shirt", "TOTUM card after 6 months", "Showreel after 24 months"], missing: [] },
  ];
  return (
    <Scroll style={{ justifyContent: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30 }}>
        <MazeMark pair={PALETTE.filmschool} size={84} className="mz-idle" />
        <div style={{ marginTop: 14, marginBottom: 8 }}><Wordmark name="ADDERS" sub="FILM SCHOOL" subColor={C.copper} size={22} /></div>
        <p style={{ color: C.muted, textAlign: "center", maxWidth: 360, fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
          You're not a member yet. Pick a plan, choose 2–3 modules per 3-month cycle, and start your journey.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {plans.map((p) => (
          <Card key={p.name} style={{ borderColor: `${p.color}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Cinzel',serif", color: p.color, fontSize: 18, fontWeight: 700 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: C.muted }}>3-month cycle</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {p.perks.map((x) => <div key={x} style={{ color: C.text, fontSize: 13 }}><span style={{ color: p.color, marginRight: 8 }}>✓</span>{x}</div>)}
              {p.missing.map((x) => <div key={x} style={{ color: C.muted, fontSize: 13 }}><span style={{ marginRight: 8 }}>✕</span>{x}</div>)}
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <Btn full color={C.copper} onClick={onStart}>Begin application →</Btn>
      </div>
    </Scroll>
  );
}

function FilmSchoolDashboard({ user, onSettings }) {
  const selected = ["Scriptwriting", "Cinematography & AudioVisual Production"];
  const announcements = [
    { t: "Spring showcase — submissions open", d: "2 days ago", body: "Submit your final cut by 30 June for the end-of-cycle screening." },
    { t: "New module: Cinematic Lighting", d: "1 week ago", body: "Now bookable for the next cycle. Spaces are limited." },
  ];
  return (
    <Scroll style={{ justifyContent: "flex-start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MazeMark pair={PALETTE.filmschool} size={40} className="mz-idle" />
          <span style={{ fontFamily: "'Cinzel',serif", color: C.copper, letterSpacing: 3, fontSize: 16, fontWeight: 700 }}>FILM SCHOOL</span>
        </div>
        <button onClick={onSettings} style={{ ...chip, color: C.text }}><Settings size={15} /> Settings</button>
      </div>

      <Card style={{ marginTop: 18, borderColor: `${C.copper}40`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.muted, fontSize: 12 }}>Membership</div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 18 }}>{user.plan} Plan</div>
          <div style={{ color: C.copper, fontSize: 12, marginTop: 2 }}>Cycle ends in 47 days</div>
        </div>
        <span style={{ background: `linear-gradient(180deg,${C.copper},${C.copperDeep})`, color: "#070B14", fontWeight: 700, fontSize: 12, padding: "6px 12px", borderRadius: 20 }}>ACTIVE</span>
      </Card>

      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        {[{ n: selected.length, l: "Modules", icon: <Lock size={15} /> }, { n: user.students, l: "Students", icon: <Users size={15} /> }, { n: "47", l: "Days left", icon: <Calendar size={15} /> }].map((s) => (
          <Card key={s.l} style={{ flex: 1, textAlign: "center", padding: 16 }}>
            <div style={{ color: C.copper, display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 26, color: C.text, fontWeight: 700 }}>{s.n}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <SectionTitle>Your modules this cycle</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {selected.map((m) => (
          <div key={m} style={rowChip}><span style={{ color: C.text, fontSize: 14 }}>{m}</span><span style={{ color: C.muted, fontSize: 11, display: "flex", gap: 5, alignItems: "center" }}><Lock size={12} /> final</span></div>
        ))}
        <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Module choices are locked for the cycle and can't be changed.</div>
      </div>

      <SectionTitle>Timetable</SectionTitle>
      <Card style={{ textAlign: "center", padding: 26, borderStyle: "dashed", borderColor: C.line }}>
        <Calendar size={22} color={C.muted} />
        <div style={{ color: C.text, fontWeight: 600, marginTop: 8 }}>Your schedule will appear here</div>
        <div style={{ color: C.muted, fontSize: 12.5, marginTop: 6 }}>Send the timetable and I'll wire it in.</div>
      </Card>

      <SectionTitle>Announcements</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {announcements.map((a) => (
          <Card key={a.t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.text, fontWeight: 700, fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}><Bell size={14} color={C.copper} />{a.t}</span>
              <span style={{ color: C.muted, fontSize: 11 }}>{a.d}</span>
            </div>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 7, lineHeight: 1.5 }}>{a.body}</p>
          </Card>
        ))}
      </div>
    </Scroll>
  );
}

function FilmSchoolSettings({ onBack }) {
  const items = [
    { t: "Children on this account", d: "Add a child membership — they log in separately", v: "1 added", icon: <Baby size={17} /> },
    { t: "Membership", d: "Change your plan (Standard ⇄ Premium)", v: "Standard", icon: <CreditCard size={17} /> },
    { t: "Emergency contact", d: "Keep your safety details current", v: "Edit", icon: <ShieldAlert size={17} /> },
    { t: "Payment & billing", d: "Manage your card and invoices via Stripe", v: "Visa ••42", icon: <CreditCard size={17} /> },
    { t: "Personal details", d: "Name, email, phone", v: "Edit", icon: <Settings size={17} /> },
  ];
  return (
    <Scroll style={{ justifyContent: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 26 }}>
        <button onClick={onBack} style={chip}>‹ Dashboard</button>
        <span style={{ fontFamily: "'Cinzel',serif", color: C.text, fontSize: 18, fontWeight: 700 }}>Settings</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 18 }}>
        {items.map((i) => (
          <Card key={i.t} hover style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", paddingRight: 12 }}>
              <span style={{ color: C.copper }}>{i.icon}</span>
              <div><div style={{ color: C.text, fontWeight: 700, fontSize: 14.5 }}>{i.t}</div><div style={{ color: C.muted, fontSize: 12.5, marginTop: 3 }}>{i.d}</div></div>
            </div>
            <span style={{ color: C.copper, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>{i.v} ›</span>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 18 }}><Btn full variant="ghost"><Plus size={15} style={{ verticalAlign: "-2px" }} /> Add a child membership</Btn></div>
    </Scroll>
  );
}

/* ---------- ADMIN: spaces available ---------- */
function Admin() {
  const cap = MODULE_DATA.reduce((a, [, , c]) => a + c, 0);
  const taken = MODULE_DATA.reduce((a, [, t]) => a + t, 0);
  const free = cap - taken;
  const sorted = [...MODULE_DATA].sort((a, b) => (a[2] - a[1]) - (b[2] - b[1]));
  return (
    <Scroll style={{ justifyContent: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 26 }}>
        <BarChart3 size={22} color={C.blue} />
        <span style={{ fontFamily: "'Cinzel',serif", color: C.text, fontSize: 20, fontWeight: 700 }}>Admin · Capacity</span>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {[[cap, "Total seats", C.blue], [taken, "Filled", C.copper], [free, "Available", "#5BC08A"]].map(([n, l, col]) => (
          <Card key={l} style={{ flex: 1, textAlign: "center", padding: 18 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: col, fontWeight: 700 }}>{n}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{l}</div>
          </Card>
        ))}
      </div>
      <div style={{ color: C.muted, fontSize: 13, marginTop: 12, textAlign: "center" }}>
        You can still fill <b style={{ color: "#5BC08A" }}>{free} seats</b> across {MODULE_DATA.length} modules.
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        {[["142", "Members"], ["8.6k", "App opens"], ["310", "Downloads"]].map(([n, l]) => (
          <Card key={l} style={{ flex: 1, textAlign: "center", padding: 14 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, color: C.text, fontWeight: 700 }}>{n}</div>
            <div style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>{l}</div>
          </Card>
        ))}
      </div>

      <SectionTitle>Seats remaining by module</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map(([name, t, c]) => {
          const left = c - t; const pct = Math.round((t / c) * 100); const full = left === 0;
          return (
            <div key={name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 12 }}>
                <span style={{ color: C.text, fontSize: 13 }}>{name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: full ? C.crimson : left <= 5 ? C.copper : "#5BC08A", whiteSpace: "nowrap" }}>
                  {full ? "FULL" : `${left} left`}
                </span>
              </div>
              <div style={{ height: 9, background: C.bg2, borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: full ? `linear-gradient(90deg,${C.crimsonDeep},${C.crimson})` : `linear-gradient(90deg,${C.copperDeep},${C.copper})` }} />
              </div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{t}/{c} seats taken</div>
            </div>
          );
        })}
      </div>
    </Scroll>
  );
}

/* =====================================================================
   FILM SCHOOL APPLICATION FORM — one question at a time
   ===================================================================== */

// ⚙️  Update these when prices are confirmed — all values are placeholders
const PRICES = {
  standard: [
    { months: 3,  label: "3 months",  price: 150, save: null },
    { months: 6,  label: "6 months",  price: 270, save: 30 },
    { months: 12, label: "12 months", price: 480, save: 120 },
  ],
  premium: [
    { months: 3,  label: "3 months",  price: 225, save: null },
    { months: 6,  label: "6 months",  price: 405, save: 45 },
    { months: 12, label: "12 months", price: 720, save: 180 },
  ],
};

const EMPTY = {
  studentName:"", studentDob:"",
  month1:"", month2:"", month3:"",
  newToFilm:null,
  guardianName:"", guardianDob:"",
  addressLine1:"", addressLine2:"", city:"", county:"", postcode:"",
  email:"", phone:"",
  emergencySame:null, emergencyName:"", emergencyPhone:"", emergencyRelation:"",
  allergies:null, allergiesDetail:"",
  additionalNeeds:null, additionalNeedsDetail:"",
  healthIssues:null, healthIssuesDetail:"",
  consentFilming:false, consentPolicy:false,
  selectedPlan: null, // { type:"standard"|"premium", months:3|6|12 }
};

const FSTEPS = [
  "intro","studentName","studentDob","month1","month2","month3","newToFilm",
  "guardianName","guardianDob","address","email","phone","emergency",
  "allergies","additionalNeeds","healthIssues","consents","policy","payment","done",
];

function FilmSchoolForm({ onBack, onDone }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState("fwd");
  const [ak, setAk] = useState(0);
  const [d, setD] = useState(EMPTY);
  const [paying, setPaying] = useState(false);
  const set = (k,v) => setD(p => ({...p,[k]:v}));

  const total = FSTEPS.length;
  const step = FSTEPS[idx];
  const pct = Math.round((idx / (total - 1)) * 100);

  const canGo = () => {
    switch(step){
      case "intro": return true;
      case "studentName": return d.studentName.trim().length > 1;
      case "studentDob": return !!d.studentDob;
      case "month1": return !!d.month1;
      case "month2": return !!d.month2;
      case "month3": return !!d.month3;
      case "newToFilm": return d.newToFilm !== null;
      case "guardianName": return d.guardianName.trim().length > 1;
      case "guardianDob": return !!d.guardianDob;
      case "address": return d.addressLine1.trim().length > 2 && d.city.trim().length > 1 && d.postcode.trim().length > 3;
      case "email": return /\S+@\S+\.\S+/.test(d.email);
      case "phone": return d.phone.trim().length > 7;
      case "emergency": return d.emergencySame !== null && (d.emergencySame || (d.emergencyName.trim().length > 1 && d.emergencyPhone.trim().length > 7));
      case "allergies": return d.allergies !== null && (d.allergies === false || d.allergiesDetail.trim().length > 1);
      case "additionalNeeds": return d.additionalNeeds !== null && (d.additionalNeeds === false || d.additionalNeedsDetail.trim().length > 1);
      case "healthIssues": return d.healthIssues !== null && (d.healthIssues === false || d.healthIssuesDetail.trim().length > 1);
      case "consents": return d.consentFilming && d.consentPolicy;
      case "policy": return true;
      case "payment": return !!d.selectedPlan;
      default: return true;
    }
  };

  const next = () => { if(!canGo()) return; setDir("fwd"); setAk(k=>k+1); setIdx(i=>Math.min(i+1,total-1)); };
  const prev = () => { setDir("bk"); setAk(k=>k+1); setIdx(i=>Math.max(i-1,0)); };

  // mock Stripe: show processing overlay, then advance to done
  const handlePay = () => {
    if(!canGo()) return;
    setPaying(true);
    setTimeout(() => { setPaying(false); setDir("fwd"); setAk(k=>k+1); setIdx(i=>Math.min(i+1,total-1)); }, 2200);
  };

  const btnLabel = step==="intro" ? "Begin application"
    : step==="policy" ? "Review payment options →"
    : step==="payment" ? "Pay now — secure checkout"
    : "Continue →";

  const handleContinue = step==="payment" ? handlePay : next;
  const firstName = d.studentName ? d.studentName.split(" ")[0] : "the student";

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background: step==="payment"
        ? `radial-gradient(ellipse 90% 50% at 50% -10%, ${C.gold}18, ${C.copper}10, transparent 60%), ${C.bg}`
        : `radial-gradient(ellipse 80% 40% at 50% -5%, ${C.copper}1A, transparent 55%), ${C.bg}` }}>

      {/* top bar: back + subtle progress */}
      <div style={{ display:"flex", alignItems:"center", padding:"18px 28px 0", gap:14, flexShrink:0 }}>
        {step !== "done" && (
          <button onClick={idx===0 ? onBack : prev}
            style={{ background:"transparent", border:`1px solid ${C.line}`, color:C.muted,
              borderRadius:9, padding:"7px 14px", cursor:"pointer", fontSize:14, fontWeight:600, flexShrink:0 }}>
            ‹ {idx===0 ? "Back" : "Prev"}
          </button>
        )}
        <div style={{ flex:1, height:3, background:"#1B2440", borderRadius:4, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", borderRadius:4, transition:"width .45s ease",
            background:`linear-gradient(90deg,${C.copperDeep},${C.copper})` }} />
        </div>
        <div style={{ width:50, flexShrink:0 }} />
      </div>

      {/* animated step content */}
      <div key={ak} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"24px 32px", overflowY:"auto",
        animation:`${dir==="fwd"?"stepFwd":"stepBk"} .3s cubic-bezier(.25,.46,.45,.94) both` }}>
        <FormContent step={step} d={d} set={set} firstName={firstName} onDone={onDone} />
      </div>

      {/* bottom CTA */}
      {step !== "done" && (
        <div style={{ padding:"10px 32px 30px", flexShrink:0, maxWidth:500, width:"100%", alignSelf:"center" }}>
          <button onClick={handleContinue} style={{
            width:"100%", padding:"16px 20px", fontSize:16, fontWeight:700, cursor: canGo()?"pointer":"not-allowed",
            border:"none", borderRadius:13, letterSpacing:0.3, transition:"opacity .15s, transform .1s",
            opacity: canGo()?1:0.3,
            background: canGo()
              ? step==="payment"
                ? `linear-gradient(180deg,${C.gold},${C.goldDeep})`
                : `linear-gradient(180deg,${C.copper},${C.copperDeep})`
              : "#2A3650",
            color:"#070B14",
          }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(.98)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
          >{btnLabel}</button>
          {step==="payment" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:10, color:C.muted, fontSize:12.5 }}>
              <span>🔒</span> Secured by Stripe — your card details never touch our servers
            </div>
          )}
        </div>
      )}

      {/* mock Stripe processing overlay */}
      {paying && <PayingOverlay plan={d.selectedPlan} />}
    </div>
  );
}

/* ---------- step renderer ---------- */
function FormContent({ step, d, set, firstName, onDone }) {
  const Q = ({children,sub}) => (
    <div style={{ textAlign:"center", marginBottom:28, maxWidth:520 }}>
      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:26, lineHeight:1.25, color:C.text, fontWeight:700, margin:0 }}>{children}</h2>
      {sub && <p style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginTop:10 }}>{sub}</p>}
    </div>
  );

  switch(step){

    case "intro": return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", maxWidth:460 }}>
        <MazeMark pair={PALETTE.filmschool} size={82} className="mz-idle" />
        <div style={{ marginTop:16 }}><Wordmark name="ADDERS" sub="FILM SCHOOL" subColor={C.copper} size={20} /></div>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:28, color:C.text, marginTop:22, lineHeight:1.2 }}>Begin your application</h2>
        <p style={{ color:C.muted, fontSize:14.5, lineHeight:1.75, marginTop:14 }}>
          We'll walk you through everything we need to set up your membership. Take your time — your progress is saved as you go.
        </p>
        <div style={{ marginTop:22, display:"flex", alignItems:"center", gap:10, color:C.copper, fontSize:13, fontWeight:600,
          border:`1px solid ${C.copper}44`, padding:"10px 18px", borderRadius:30, background:`${C.copper}0E` }}>
          ⚡ Module choices are final and cannot be changed after submission
        </div>
      </div>
    );

    case "studentName": return (
      <div style={{ width:"100%", maxWidth:460 }}>
        <Q>What is the student's full name?</Q>
        <FInput value={d.studentName} onChange={e=>set("studentName",e.target.value)} placeholder="e.g. Jamie Rivers" autoFocus />
      </div>
    );

    case "studentDob": return (
      <div style={{ width:"100%", maxWidth:460 }}>
        <Q sub="We use this to confirm eligibility for the programme.">When was {firstName} born?</Q>
        <FInput type="date" value={d.studentDob} onChange={e=>set("studentDob",e.target.value)} />
      </div>
    );

    case "month1": return (
      <div style={{ width:"100%", maxWidth:520 }}>
        <Q sub={`${firstName} will study this module during the first month of the cycle.`}>Choose the Month 1 module</Q>
        <TimetableHint />
        <ModWarn />
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {M1.map(m=>(
            <ModCard key={m} name={m} selected={d.month1===m}
              onClick={()=>{ set("month1",m); set("month2",""); set("month3",""); }} />
          ))}
        </div>
      </div>
    );

    case "month2": {
      const opts = m2Opts(d.month1);
      const locked = opts.length===1;
      return (
        <div style={{ width:"100%", maxWidth:520 }}>
          <Q sub="Month 2 options may be limited based on your Month 1 choice.">Now choose the Month 2 module</Q>
          <TimetableHint />
          {locked && (
            <div style={{ background:`${C.blue}14`, border:`1px solid ${C.blue}44`, borderRadius:12,
              padding:"12px 16px", marginBottom:18, color:C.blue, fontSize:13, lineHeight:1.5 }}>
              ℹ️ Because <b>{d.month1}</b> was chosen for Month 1, {firstName} must continue with the same module in Month 2.
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {opts.map(m=>(
              <ModCard key={m} name={m} selected={d.month2===m} locked={locked}
                onClick={()=>{ set("month2",m); set("month3",""); }} />
            ))}
          </div>
          <ModSummary month1={d.month1} />
        </div>
      );
    }

    case "month3": {
      const opts = m3Opts(d.month2);
      const locked = opts.length===1;
      return (
        <div style={{ width:"100%", maxWidth:520 }}>
          <Q sub="The final month of the cycle. Once submitted, all module choices are locked.">Finally, the Month 3 module</Q>
          <TimetableHint />
          {locked && (
            <div style={{ background:`${C.blue}14`, border:`1px solid ${C.blue}44`, borderRadius:12,
              padding:"12px 16px", marginBottom:18, color:C.blue, fontSize:13, lineHeight:1.5 }}>
              ℹ️ Because <b>{d.month2}</b> was chosen for Month 2, Month 3 must also be {d.month2}.
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {opts.map(m=>(
              <ModCard key={m} name={m} selected={d.month3===m} locked={locked} onClick={()=>set("month3",m)} />
            ))}
          </div>
          <ModSummary month1={d.month1} month2={d.month2} />
        </div>
      );
    }

    case "newToFilm": return (
      <div style={{ width:"100%", maxWidth:420, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <Q sub="This helps us pitch sessions at the right level. There's no wrong answer!">
          Is {firstName} new to filmmaking?
        </Q>
        <div style={{ display:"flex", gap:16, width:"100%", maxWidth:300 }}>
          {[["Yes",true],["No",false]].map(([label,val])=>(
            <button key={label} onClick={()=>set("newToFilm",val)} style={{
              flex:1, padding:"22px 0", borderRadius:14, border:`2px solid ${d.newToFilm===val?C.copper:C.line}`,
              background:d.newToFilm===val?`${C.copper}18`:C.bg2, cursor:"pointer",
              color:d.newToFilm===val?C.copper:C.text, fontSize:20, fontWeight:700,
              fontFamily:"'Cinzel',serif", transition:"all .15s ease",
            }}>{label}</button>
          ))}
        </div>
      </div>
    );

    case "guardianName": return (
      <div style={{ width:"100%", maxWidth:460 }}>
        <Q sub="The responsible adult who is signing up the student.">Parent or guardian's full name</Q>
        <FInput value={d.guardianName} onChange={e=>set("guardianName",e.target.value)} placeholder="Full name" autoFocus />
      </div>
    );

    case "guardianDob": return (
      <div style={{ width:"100%", maxWidth:460 }}>
        <Q>{d.guardianName?d.guardianName.split(" ")[0]+"'s":"Guardian's"} date of birth</Q>
        <FInput type="date" value={d.guardianDob} onChange={e=>set("guardianDob",e.target.value)} />
      </div>
    );

    case "address": return (
      <div style={{ width:"100%", maxWidth:480 }}>
        <Q sub="Address Line 2, County are optional — the rest are required.">What is your home address?</Q>
        <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
          <div>
            <div style={{ color:C.muted, fontSize:12, fontWeight:600, letterSpacing:0.3, marginBottom:5 }}>Address Line 1 *</div>
            <FInput value={d.addressLine1} onChange={e=>set("addressLine1",e.target.value)} placeholder="House number and street" autoFocus />
          </div>
          <div>
            <div style={{ color:C.muted, fontSize:12, fontWeight:600, letterSpacing:0.3, marginBottom:5 }}>Address Line 2</div>
            <FInput value={d.addressLine2} onChange={e=>set("addressLine2",e.target.value)} placeholder="Apartment, flat, suite (optional)" />
          </div>
          <div style={{ display:"flex", gap:11 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:C.muted, fontSize:12, fontWeight:600, letterSpacing:0.3, marginBottom:5 }}>City *</div>
              <FInput value={d.city} onChange={e=>set("city",e.target.value)} placeholder="City" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.muted, fontSize:12, fontWeight:600, letterSpacing:0.3, marginBottom:5 }}>County</div>
              <FInput value={d.county} onChange={e=>set("county",e.target.value)} placeholder="County (optional)" />
            </div>
          </div>
          <div style={{ maxWidth:200 }}>
            <div style={{ color:C.muted, fontSize:12, fontWeight:600, letterSpacing:0.3, marginBottom:5 }}>Postcode *</div>
            <FInput value={d.postcode} onChange={e=>set("postcode",e.target.value.toUpperCase())} placeholder="e.g. SW1A 1AA" />
          </div>
        </div>
      </div>
    );

    case "email": return (
      <div style={{ width:"100%", maxWidth:460 }}>
        <Q sub="This should match the email used to log in to the app — it links your membership.">
          Best email to reach you?
        </Q>
        <FInput type="email" value={d.email} onChange={e=>set("email",e.target.value)} placeholder="your@email.com" autoFocus />
      </div>
    );

    case "phone": return (
      <div style={{ width:"100%", maxWidth:460 }}>
        <Q>And your phone number?</Q>
        <FInput type="tel" value={d.phone} onChange={e=>set("phone",e.target.value)} placeholder="+44 7700 900000" autoFocus />
      </div>
    );

    case "emergency": return (
      <div style={{ width:"100%", maxWidth:480 }}>
        <Q sub="Who should we contact if there's an emergency during a session?">Emergency contact</Q>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:18 }}>
          {[[true,`Use ${d.guardianName||"parent/guardian"} details above`,d.phone||"Same contact info"],
            [false,"Someone different","I'll add their details below"]].map(([val,label,sub])=>(
            <button key={String(val)} onClick={()=>set("emergencySame",val)} style={{
              padding:"15px 18px", borderRadius:14, border:`2px solid ${d.emergencySame===val?C.copper:C.line}`,
              background:d.emergencySame===val?`${C.copper}14`:C.bg2, cursor:"pointer", textAlign:"left",
              transition:"all .15s ease",
            }}>
              <div style={{ color:d.emergencySame===val?C.copper:C.text, fontWeight:700, fontSize:14 }}>{label}</div>
              <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{sub}</div>
            </button>
          ))}
        </div>
        {d.emergencySame===false && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <FInput value={d.emergencyName} onChange={e=>set("emergencyName",e.target.value)} placeholder="Their full name" />
            <FInput type="tel" value={d.emergencyPhone} onChange={e=>set("emergencyPhone",e.target.value)} placeholder="Their phone number" />
            <FInput value={d.emergencyRelation} onChange={e=>set("emergencyRelation",e.target.value)} placeholder="Relationship to student (e.g. Grandparent, Aunt)" />
          </div>
        )}
      </div>
    );

    case "allergies": return (
      <MedStep question={`Does ${firstName} have any allergies?`}
        hint="Food, medication, environmental — include anything that's relevant."
        val={d.allergies} detail={d.allergiesDetail}
        onVal={v=>set("allergies",v)} onDetail={v=>set("allergiesDetail",v)} />
    );

    case "additionalNeeds": return (
      <MedStep question="Any additional needs or disabilities?"
        hint="Any support we should put in place to make sessions the best they can be."
        val={d.additionalNeeds} detail={d.additionalNeedsDetail}
        onVal={v=>set("additionalNeeds",v)} onDetail={v=>set("additionalNeedsDetail",v)} />
    );

    case "healthIssues": return (
      <MedStep question="Any health issues we should know about?"
        hint="Conditions, medications, or anything that may affect the student during sessions."
        val={d.healthIssues} detail={d.healthIssuesDetail}
        onVal={v=>set("healthIssues",v)} onDetail={v=>set("healthIssuesDetail",v)} />
    );

    case "consents": return (
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <MazeMark pair={PALETTE.filmschool} size={52} />
          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:22, color:C.text, marginTop:14, marginBottom:0 }}>Almost there</h2>
          <p style={{ color:C.muted, fontSize:14, marginTop:8, lineHeight:1.6 }}>
            We need your agreement on two important points before we review your application.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <ConsentCard checked={d.consentFilming} onChange={v=>set("consentFilming",v)}
            title="Consent to film the student"
            desc="Because this is a film school, students will be filmed as part of their learning and for promotional purposes. I give consent for the student to be filmed during sessions and for appropriate footage to be used by Adders Film School." />
          <ConsentCard checked={d.consentPolicy} onChange={v=>set("consentPolicy",v)}
            title="I accept the terms and policy"
            desc="I confirm I have read and understood the Adders Film School policy agreement (shown on the next screen) and I agree to abide by its terms on behalf of myself and the student." />
        </div>
      </div>
    );

    case "policy": return (
      <div style={{ width:"100%", maxWidth:580 }}>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:22, color:C.text, textAlign:"center", marginBottom:18 }}>
          Policy Agreement
        </h2>
        <div style={{ background:C.bg2, border:`1px solid ${C.line}`, borderRadius:14, padding:"22px 24px",
          maxHeight:360, overflowY:"auto", color:C.muted, fontSize:13.5, lineHeight:1.85 }}>
          <div style={{ color:C.copper, fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:16, marginBottom:16 }}>
            Adders Film School — Membership Policy
          </div>
          <div style={{ color:`${C.copper}CC`, fontStyle:"italic", marginBottom:18, border:`1px dashed ${C.copper}44`,
            padding:"12px 16px", borderRadius:10 }}>
            📄 Your full policy document will be placed here. Send it across and I'll drop it straight in — formatted and scrollable exactly like this.
          </div>
          <p>This document sets out the terms and expectations for all Adders Film School members, including attendance requirements, code of conduct, and the use of footage captured during sessions. Members and their guardians are expected to have read and understood all sections before submitting their application.</p>
          <p style={{ marginTop:14 }}>By proceeding, you confirm that you have scrolled through and accepted the full policy on the previous screen.</p>
        </div>
        <div style={{ color:C.muted, fontSize:12.5, textAlign:"center", marginTop:14 }}>
          You confirmed acceptance on the previous screen. Submitting locks your application.
        </div>
      </div>
    );

    case "payment": return <PaymentStep d={d} set={set} />;

    case "done": return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:60, marginBottom:16 }}>🎬</div>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:28, color:C.text, lineHeight:1.2, margin:0 }}>
          You're in!
        </h2>
        <p style={{ color:C.muted, fontSize:15, lineHeight:1.75, marginTop:12 }}>
          Welcome to Adders Film School,{" "}
          <b style={{color:C.copper}}>{d.studentName||"new member"}</b>. Two emails are on their way.
        </p>
        <div style={{ marginTop:18, width:"100%", display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
          {/* email 1 — confirmation */}
          <div style={{ background:"#0E1E12", border:"1px solid #1E4A28", borderRadius:13, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:20, flexShrink:0 }}>✉️</span>
            <div>
              <div style={{ color:"#5BC08A", fontWeight:700, fontSize:14 }}>Booking confirmation sent</div>
              <div style={{ color:C.muted, fontSize:12.5, marginTop:3, lineHeight:1.5 }}>
                Your receipt, membership details and module summary have been sent to <b style={{color:C.text}}>{d.email||"your email"}</b>.
              </div>
            </div>
          </div>
          {/* email 2 — info pack */}
          <div style={{ background:`${C.blue}0C`, border:`1px solid ${C.blue}33`, borderRadius:13, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:20, flexShrink:0 }}>📋</span>
            <div>
              <div style={{ color:C.blue, fontWeight:700, fontSize:14 }}>Info pack email queued</div>
              <div style={{ color:C.muted, fontSize:12.5, marginTop:3, lineHeight:1.5 }}>
                A second email with everything you need to know — what to bring, what to wear, and what to expect — will be sent once finalised.
              </div>
              <div style={{ color:C.muted, fontSize:11.5, marginTop:6, fontStyle:"italic" }}>
                Content placeholder — drop the copy in whenever you're ready.
              </div>
            </div>
          </div>
        </div>
        {/* plan & module summary */}
        {d.selectedPlan && (
          <div style={{ background:`${C.gold}0E`, border:`1px solid ${C.gold}44`, borderRadius:14, padding:"16px 20px", marginTop:18, width:"100%", textAlign:"left" }}>
            <div style={{ color:C.muted, fontSize:11.5, letterSpacing:2, marginBottom:10 }}>YOUR MEMBERSHIP</div>
            <div style={{ color:C.gold, fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:17 }}>
              {d.selectedPlan.type.charAt(0).toUpperCase()+d.selectedPlan.type.slice(1)} — {d.selectedPlan.months} months
            </div>
            <div style={{ color:C.muted, fontSize:12.5, marginTop:4 }}>
              £{PRICES[d.selectedPlan.type].find(p=>p.months===d.selectedPlan.months)?.price}
              {PRICES[d.selectedPlan.type].find(p=>p.months===d.selectedPlan.months)?.save &&
                <span style={{color:"#5BC08A",marginLeft:8}}>
                  · Saved £{PRICES[d.selectedPlan.type].find(p=>p.months===d.selectedPlan.months).save}
                </span>
              }
            </div>
          </div>
        )}
        <div style={{ background:`${C.copper}10`, border:`1px solid ${C.copper}44`, borderRadius:14, padding:"16px 20px", marginTop:12, width:"100%", textAlign:"left" }}>
          <div style={{ color:C.muted, fontSize:11.5, letterSpacing:2, marginBottom:10 }}>MODULES SELECTED</div>
          {[["Month 1",d.month1],["Month 2",d.month2],["Month 3",d.month3]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
              <span style={{ color:C.muted, fontSize:13 }}>{l}</span>
              <span style={{ color:C.copper, fontSize:13, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:26 }}>
          <Btn color={C.copper} onClick={onDone}>Go to my dashboard →</Btn>
        </div>
      </div>
    );

    default: return null;
  }
}

/* ---------- form helpers ---------- */
const FI = {
  width:"100%", boxSizing:"border-box", background:C.bg2, border:`2px solid ${C.line}`,
  borderRadius:12, padding:"16px 18px", color:C.text, fontSize:16, outline:"none",
};
const FInput = (props) => (
  <input {...props} style={FI}
    onFocus={e=>{e.target.style.borderColor=C.copper}}
    onBlur={e=>{e.target.style.borderColor=C.line}} />
);

function ModCard({ name, selected, locked, onClick }) {
  const [info, setInfo] = useState(false);
  const desc = MODULE_INFO[name];
  return (
    <div style={{
      borderRadius:13, border:`2px solid ${selected?C.copper:info?`${C.copper}66`:C.line}`,
      background: selected ? `linear-gradient(135deg,${C.copper}1E,${C.copperDeep}14)` : C.bg2,
      transition:"all .14s ease", overflow:"hidden",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px" }}>
        {/* select area */}
        <button onClick={onClick} style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          background:"transparent", border:"none", textAlign:"left",
          cursor: locked&&selected ? "default" : "pointer", padding:0,
        }}>
          <span style={{ color:selected?C.copper:C.text, fontWeight:selected?700:400, fontSize:15, lineHeight:1.3 }}>{name}</span>
          {selected && <span style={{ color:C.copper, fontSize:18, flexShrink:0 }}>✓</span>}
          {locked && !selected && <span style={{ color:C.muted, fontSize:11, flexShrink:0 }}>Required</span>}
        </button>
        {/* info toggle */}
        {desc && (
          <button onClick={()=>setInfo(o=>!o)} aria-label={`About ${name}`} title="Module info" style={{
            flexShrink:0, width:26, height:26, borderRadius:"50%", cursor:"pointer",
            border:`1.5px solid ${info?C.copper:C.muted}`, background:info?C.copper:"transparent",
            color:info?"#070B14":C.muted, fontFamily:"Georgia, serif", fontStyle:"italic",
            fontWeight:700, fontSize:14, display:"grid", placeItems:"center", transition:"all .15s ease", lineHeight:1,
          }}>i</button>
        )}
      </div>
      {/* expandable description */}
      {info && desc && (
        <div style={{ padding:"0 16px 15px", animation:"slideDown .2s ease both" }}>
          <div style={{ borderTop:`1px solid ${C.copper}2E`, paddingTop:12, color:C.muted, fontSize:13, lineHeight:1.65 }}>
            {desc}
          </div>
        </div>
      )}
    </div>
  );
}

function TimetableHint() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {/* availability notice */}
      <div style={{ background:`${C.blue}12`, border:`1px solid ${C.blue}3A`, borderRadius:12,
        padding:"12px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:18, flexShrink:0 }}>📅</span>
        <div style={{ flex:1 }}>
          <div style={{ color:C.text, fontWeight:700, fontSize:14 }}>Check the timetable before you choose</div>
          <div style={{ color:C.muted, fontSize:13, lineHeight:1.5, marginTop:4 }}>
            Each module runs on specific days and times. Please review the schedule below to make sure it works for you — your selection can't be changed once submitted.
          </div>
          <button onClick={()=>setOpen(o=>!o)} style={{ marginTop:9, background:"transparent", border:`1px solid ${C.blue}55`,
            color:C.blue, fontSize:12.5, fontWeight:600, padding:"5px 13px", borderRadius:20, cursor:"pointer" }}>
            {open ? "Hide timetable ▲" : "View timetable ▼"}
          </button>
        </div>
      </div>
      {/* timetable placeholder — drops in when you send the real schedule */}
      {open && (
        <div style={{ marginTop:10, background:C.bg2, border:`1px dashed ${C.line}`, borderRadius:12, padding:"20px 18px",
          display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <Calendar size={28} color={C.muted} />
          <div style={{ color:C.text, fontWeight:600, fontSize:14 }}>Timetable coming soon</div>
          <div style={{ color:C.muted, fontSize:12.5, textAlign:"center", lineHeight:1.6, maxWidth:320 }}>
            Send the session schedule and I'll drop it in here — formatted as a proper weekly grid with days, times and module names.
          </div>
        </div>
      )}
    </div>
  );
}

function ModWarn() {
  return (
    <div style={{ background:`${C.copper}12`, border:`1px solid ${C.copper}3A`, borderRadius:12,
      padding:"11px 16px", marginBottom:18, display:"flex", gap:10, alignItems:"flex-start" }}>
      <span>⚠️</span>
      <span style={{ color:C.copper, fontSize:13, lineHeight:1.5 }}>
        <b>Choices are final.</b> Once submitted, module selections cannot be changed for this cycle.
      </span>
    </div>
  );
}

function ModSummary({ month1, month2, month3 }) {
  const entries = [["Month 1",month1],["Month 2",month2],["Month 3",month3]].filter(([,v])=>v);
  if(!entries.length) return null;
  return (
    <div style={{ marginTop:16, background:C.bg2, border:`1px solid ${C.line}`, borderRadius:12, padding:"13px 16px" }}>
      <div style={{ color:C.muted, fontSize:11, letterSpacing:2, marginBottom:10 }}>YOUR SELECTIONS SO FAR</div>
      {entries.map(([l,v])=>(
        <div key={l} style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:6 }}>
          <span style={{ color:C.muted, fontSize:13 }}>{l}</span>
          <span style={{ color:C.text, fontSize:13, fontWeight:600, textAlign:"right" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function MedStep({ question, hint, val, detail, onVal, onDetail }) {
  return (
    <div style={{ width:"100%", maxWidth:480 }}>
      <div style={{ textAlign:"center", marginBottom:hint?6:24 }}>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:24, lineHeight:1.3, color:C.text, fontWeight:700, margin:0 }}>{question}</h2>
        {hint && <p style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginTop:8, marginBottom:22 }}>{hint}</p>}
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:18 }}>
        {[["No",false],["Yes",true]].map(([label,v])=>(
          <button key={label} onClick={()=>onVal(v)} style={{
            flex:1, padding:"20px 0", borderRadius:14, border:`2px solid ${val===v?C.copper:C.line}`,
            background:val===v?`${C.copper}18`:C.bg2, cursor:"pointer",
            color:val===v?C.copper:C.text, fontSize:18, fontWeight:700,
            fontFamily:"'Cinzel',serif", transition:"all .15s ease",
          }}>{label}</button>
        ))}
      </div>
      {val===true && (
        <textarea value={detail} onChange={e=>onDetail(e.target.value)}
          placeholder="Please give us details so we can make sure we're fully prepared..."
          rows={4} style={{...FI, resize:"vertical", fontFamily:"inherit", lineHeight:1.6, marginTop:4}}
          onFocus={e=>e.target.style.borderColor=C.copper} onBlur={e=>e.target.style.borderColor=C.line} />
      )}
    </div>
  );
}

function ConsentCard({ checked, onChange, title, desc }) {
  return (
    <button onClick={()=>onChange(!checked)} style={{
      padding:"18px 20px", borderRadius:16, textAlign:"left", cursor:"pointer", width:"100%",
      border:`2px solid ${checked?C.copper:C.line}`, background:checked?`${C.copper}10`:C.bg2,
      transition:"all .18s ease", display:"flex", gap:14, alignItems:"flex-start",
    }}>
      <div style={{ width:22, height:22, borderRadius:6, flexShrink:0, marginTop:2,
        border:`2px solid ${checked?C.copper:C.muted}`, background:checked?C.copper:"transparent",
        display:"grid", placeItems:"center" }}>
        {checked && <span style={{ color:"#070B14", fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
      </div>
      <div>
        <div style={{ color:checked?C.copper:C.text, fontWeight:700, fontSize:15, marginBottom:6 }}>{title}</div>
        <div style={{ color:C.muted, fontSize:13, lineHeight:1.65 }}>{desc}</div>
      </div>
    </button>
  );
}

/* ---------- payment step ---------- */
function PaymentStep({ d, set }) {
  const planDefs = {
    premium:  { color: C.gold,   label: "Premium",  perks: ["Everything in Standard","Framed posters","Merch pack","T-shirt","TOTUM after 6 months"] },
    standard: { color: C.copper, label: "Standard", perks: ["All modules","Professional equipment","DaVinci Resolve","WriterDuet","4K HDR films"] },
  };
  return (
    <div style={{ width:"100%", maxWidth:720 }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <MazeMark pair={PALETTE.filmschool} size={52} className="mz-idle" />
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:26, color:C.text, marginTop:14, marginBottom:0 }}>Choose your membership</h2>
        <p style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginTop:8 }}>
          Longer memberships save you more. Prices shown are placeholders — update when confirmed.
        </p>
      </div>

      <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
        {Object.entries(planDefs).map(([type, plan]) => (
          <div key={type} style={{ flex:"1 1 280px", display:"flex", flexDirection:"column", gap:10 }}>
            {/* plan header */}
            <div style={{ background:`${plan.color}14`, border:`1px solid ${plan.color}44`, borderRadius:16, padding:"18px 20px" }}>
              <div style={{ fontFamily:"'Cinzel',serif", color:plan.color, fontWeight:700, fontSize:18, marginBottom:10 }}>{plan.label}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {plan.perks.map(p=>(
                  <div key={p} style={{ color:C.text, fontSize:12.5, display:"flex", gap:8 }}>
                    <span style={{ color:plan.color }}>✓</span>{p}
                  </div>
                ))}
              </div>
            </div>

            {/* duration options */}
            {PRICES[type].map(opt => {
              const sel = d.selectedPlan?.type===type && d.selectedPlan?.months===opt.months;
              return (
                <button key={opt.months} onClick={()=>set("selectedPlan",{type,months:opt.months})} style={{
                  padding:"15px 18px", borderRadius:13, textAlign:"left", cursor:"pointer", width:"100%",
                  border:`2px solid ${sel?plan.color:C.line}`,
                  background: sel?`linear-gradient(135deg,${plan.color}1E,${plan.color}0A)`:C.bg2,
                  transition:"all .15s ease", position:"relative",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ color:sel?plan.color:C.text, fontWeight:700, fontSize:15 }}>{opt.label}</div>
                      {opt.save && (
                        <div style={{ color:"#5BC08A", fontSize:12, fontWeight:700, marginTop:3 }}>
                          🎉 Save £{opt.save} vs monthly
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:sel?plan.color:C.text, fontWeight:700, fontSize:20, fontFamily:"'Cinzel',serif" }}>
                        £{opt.price}
                      </div>
                      <div style={{ color:C.muted, fontSize:11 }}>
                        £{Math.round(opt.price/opt.months)}/mo
                      </div>
                    </div>
                  </div>
                  {opt.months===12 && (
                    <div style={{ position:"absolute", top:-10, right:12, background:`linear-gradient(90deg,${plan.color},${shade(plan.color,-20)})`,
                      color:"#070B14", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:0.5 }}>
                      BEST VALUE
                    </div>
                  )}
                  {sel && <span style={{ position:"absolute", top:14, right:16, color:plan.color, fontSize:18 }}>✓</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* selection summary */}
      {d.selectedPlan && (
        <div style={{ marginTop:20, background:C.bg2, border:`1px solid ${C.line}`, borderRadius:12, padding:"13px 18px",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:C.muted, fontSize:13 }}>Selected:</span>
          <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>
            {planDefs[d.selectedPlan.type].label} · {d.selectedPlan.months} months
            {" — "}
            <span style={{ color: planDefs[d.selectedPlan.type].color }}>
              £{PRICES[d.selectedPlan.type].find(p=>p.months===d.selectedPlan.months)?.price}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- paying overlay ---------- */
function PayingOverlay({ plan }) {
  const [phase, setPhase] = useState(0);
  // 0 = connecting, 1 = processing, 2 = confirmed
  useEffect(() => {
    const t1 = setTimeout(()=>setPhase(1), 800);
    const t2 = setTimeout(()=>setPhase(2), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const msgs = ["Connecting to Stripe…","Processing payment…","Payment confirmed ✓"];
  const colors = [C.blue, C.copper, "#5BC08A"];
  return (
    <div style={{ position:"absolute", inset:0, zIndex:50, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:`rgba(7,11,20,.92)`, backdropFilter:"blur(8px)",
      animation:"fade .25s ease both" }}>
      <MazeMark pair={phase===2?PALETTE.filmschool:[C.gold,C.goldDeep]} size={100}
        style={{ animation: phase===2?"none":"spinR 1s linear infinite", transformOrigin:"50% 50%" }} />
      <div style={{ marginTop:28, fontFamily:"'Cinzel',serif", fontSize:18, color:colors[phase],
        transition:"color .4s ease", fontWeight:700 }}>
        {msgs[phase]}
      </div>
      {plan && (
        <div style={{ marginTop:14, color:C.muted, fontSize:13 }}>
          {plan.type.charAt(0).toUpperCase()+plan.type.slice(1)} · {plan.months} months
        </div>
      )}
    </div>
  );
}
const Center = ({ children, style }) => (
  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: 24, boxSizing: "border-box", ...style }}>{children}</div>
);

const cornerBtn = { position: "absolute", top: 20, right: 24, background: "transparent", border: `1px solid ${C.line}`, color: C.muted, fontSize: 13, padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 600 };
const chip = { background: "transparent", border: `1px solid ${C.line}`, color: C.muted, fontSize: 13, padding: "7px 13px", borderRadius: 10, cursor: "pointer", fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" };
const rowChip = { display: "flex", justifyContent: "space-between", alignItems: "center", background: C.panel, border: `1px solid #1B2440`, borderRadius: 11, padding: "12px 14px" };
const browserBar = { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${C.line}`, background: C.bg2, boxSizing: "border-box" };

/* ===================== APP SHELL ===================== */
function getInitialScreen() {
  const params = new URLSearchParams(window.location.search);
  return params.get("signup") === "1" ? "fs-form" : "library";
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen); // boots straight to the library, or the sign-up form if linked directly
  const [trans, setTrans] = useState(null);
  const [user, setUser] = useState({ name: "Jordan Rivers", member: true, plan: "Standard", students: 3 });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const goSub = (key) => {
    if (key === "library" || key === "admin") { setScreen(key); return; }
    const s = SUBS[key];
    const target = key === "filmschool" ? (user.member ? "fs-dash" : "fs-join") : key;
    setTrans({ pair: s.pair, color: s.color, title: s.title, target });
  };

  const preAuth = ["splash", "auth", "verify"].includes(screen);
  const noNav = preAuth || screen === "fs-form";

  const render = () => {
    switch (screen) {
      case "splash": return <Splash onDone={() => setScreen("auth")} />;
      case "auth": return <Auth onVerify={() => setScreen("verify")} />;
      case "verify": return <Verify onDone={() => setScreen("library")} />;
      case "library": return <Home user={user} onOpen={goSub} />;
      case "pictures": return <PicturesBrowser />;
      case "cinemas": return <Cinemas />;
      case "fs-join": return <FilmSchoolJoin onStart={() => setScreen("fs-form")} />;
      case "fs-form": return <FilmSchoolForm onBack={() => setScreen("fs-join")} onDone={() => { setUser(u => ({ ...u, member: true })); setScreen("fs-dash"); }} />;
      case "fs-dash": return <FilmSchoolDashboard user={user} onSettings={() => setScreen("fs-settings")} />;
      case "fs-settings": return <FilmSchoolSettings onBack={() => setScreen("fs-dash")} />;
      case "admin": return <Admin />;
      default: return null;
    }
  };

  const railActive = screen.startsWith("fs-") ? "filmschool" : screen;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, width: "100vw", height: "100vh", overflow: "hidden", color: C.text }}>
      <style>{`
        @keyframes stepFwd { from { opacity:0; transform: translateX(38px) } to { opacity:1; transform:none } }
        @keyframes slideDown { from { opacity:0; transform: translateY(-6px) } to { opacity:1; transform:none } }
        @keyframes stepBk  { from { opacity:0; transform: translateX(-38px) } to { opacity:1; transform:none } }
        @keyframes rise { from { opacity:0; transform: translateY(18px) } to { opacity:1; transform:none } }
        @keyframes fade { from { opacity:0 } to { opacity:1 } }
        @keyframes spinIn { from { opacity:0; transform: rotate(-360deg) scale(.55) } to { opacity:1; transform: rotate(0) scale(1) } }
        @keyframes spinBurst { from { transform: rotate(0) } to { transform: rotate(720deg) } }
        @keyframes spinR { to { transform: rotate(360deg) } }
        .mz-idle { animation: spinR 26s linear infinite; transform-origin: 50% 50%; }
        .band:hover { transform: translateY(-4px); border-color: ${C.line} !important; }
        .band:hover .mz-idle { animation-duration: 4s; }
        .lift { transition: transform .16s ease; }
        .lift:hover { transform: translateY(-3px); }
        .rail { transition: width .22s ease; }
        .rail:hover { width: 224px !important; box-shadow: 12px 0 40px rgba(0,0,0,.45); }
        .rail-label { opacity: 0; transition: opacity .15s ease; }
        .rail:hover .rail-label { opacity: 1; }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background:#1B2440; border-radius:8px; }
        button { font-family: inherit; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>

      {!noNav && (
        <Rail active={railActive} user={user} onNav={goSub}
          onToggleMember={() => setUser({ ...user, member: !user.member })}
          onIntro={() => setScreen("splash")}
          onLogout={() => setScreen("auth")} />
      )}

      <main style={{ position: "absolute", inset: 0, left: noNav ? 0 : 76, transition: "left .2s ease" }}>
        {render()}
      </main>

      {trans && <Transition data={trans} onDone={() => { setScreen(trans.target); setTrans(null); }} />}
    </div>
  );
}
