"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Pause,
  Play,
  Eye,
  Footprints,
  TramFront,
  X,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  ArrowUp,
  Orbit,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { resolveLandmark } from "@/lib/lego-city/content";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { BrandLogo } from "@/components/site-chrome";
import Joystick from "./joystick";
import styles from "./lego-city.module.css";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

const OUTFITS = [
  { id: "red", torso: "bright-red", legs: "dark-blue", hex: "#C91A09", label: "Classic red" },
  { id: "blue", torso: "bright-blue", legs: "black", hex: "#0055BF", label: "City blue" },
  { id: "lime", torso: "lime", legs: "dark-bluish-gray", hex: "#BBE90B", label: "Lime" },
  { id: "pink", torso: "dark-pink", legs: "dark-purple", hex: "#C870A0", label: "Dark pink" },
  { id: "yellow", torso: "bright-yellow", legs: "dark-blue", hex: "#F2CD37", label: "Yellow" },
  { id: "white", torso: "white", legs: "dark-bluish-gray", hex: "#F4F4F4", label: "White" },
];

const POSTCARDS = [
  { file: "overview", title: "The whole city", note: "Cycles render, 1920×1080" },
  { file: "station", title: "Central Station", note: "Where every visit starts" },
  { file: "square", title: "Mendoza Square", note: "Fountain and the brick sign" },
  { file: "night", title: "After dark", note: "Lamps, windows, and the Ferris wheel" },
];

function Postcards({ onClose }) {
  const [index, setIndex] = useState(0);
  const card = POSTCARDS[index];
  return (
    <div className={styles.postcards} role="dialog" aria-label="Blender postcards">
      <header className={styles.cardHead}>
        <p className={styles.eyebrow}>
          <span className={styles.brick} aria-hidden="true" /> Rendered in Blender
        </p>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close postcards">
          <X size={16} />
        </button>
      </header>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/city/renders/${card.file}.png`} alt={`${card.title}: Pilleland rendered in Blender`} />
      <div className={styles.postcardNav}>
        <button type="button" className={styles.iconButton} onClick={() => setIndex((index + POSTCARDS.length - 1) % POSTCARDS.length)} aria-label="Previous postcard">
          <ChevronLeft size={18} />
        </button>
        <div>
          <strong>{card.title}</strong>
          <small>{card.note}</small>
        </div>
        <button type="button" className={styles.iconButton} onClick={() => setIndex((index + 1) % POSTCARDS.length)} aria-label="Next postcard">
          <ChevronRight size={18} />
        </button>
      </div>
      <p className={styles.postcardFoot}>
        The same spec builds the city in Three.js (what you are walking through) and in Blender via{" "}
        <code>tools/blender/build_lego_city.py</code>.{" "}
        <a href="/city/lego-city.glb" download>
          Download the glTF model
        </a>
        .
      </p>
    </div>
  );
}

function LandmarkCard({ landmark, onClose, compact = false }) {
  const data = useMemo(() => resolveLandmark(landmark), [landmark]);
  if (!data) return null;
  return (
    <article className={`${styles.card} ${compact ? styles.cardCompact : ""}`} aria-live="polite">
      <header className={styles.cardHead}>
        <p className={styles.eyebrow}>
          <span className={styles.brick} style={data.accent ? { background: data.accent } : undefined} aria-hidden="true" />
          {data.eyebrow}
        </p>
        {onClose && (
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close card">
            <X size={16} />
          </button>
        )}
      </header>
      <h2>{data.title}</h2>
      {data.subtitle && <p className={styles.subtitle}>{data.subtitle}</p>}
      {!compact && data.body && <p className={styles.body}>{data.body}</p>}
      {!compact && data.stats && (
        <dl className={styles.stats}>
          {data.stats.map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.tags?.length > 0 && (
        <ul className={styles.tags}>
          {data.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      {!compact && data.links && (
        <ul className={styles.links}>
          {data.links.map(([label, href]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noreferrer">
                {label} <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {data.href && data.cta && data.external && (
        <a className={styles.cta} href={data.href} target={data.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
          {data.cta}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      )}
      {data.href && data.cta && !data.external && (
        <Link className={styles.cta} href={data.href}>
          {data.cta}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}

export default function LegoCity() {
  const containerRef = useRef(null);
  const minimapRef = useRef(null);
  const appRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("loading");
  const [open, setOpen] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [landmarks, setLandmarks] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showPostcards, setShowPostcards] = useState(false);
  const [touch, setTouch] = useState(false);
  const [outfit, setOutfit] = useState("red");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    let app;
    let cancelled = false;
    if (!supportsWebGL()) {
      setStatus("unsupported");
      return undefined;
    }
    import("@/lib/lego-city/three/city-app")
      .then(({ CityApp }) => {
        if (cancelled || !containerRef.current) return;
        app = new CityApp(containerRef.current, {
          minimapCanvas: minimapRef.current,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          quality:
            window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) < 4 ? "low" : "high",
          onState: (next) => {
            setState(next);
            if (next.open) setOpen(next.open);
          },
        });
        try {
          app.init();
          appRef.current = app;
          setStatus("ready");
        } catch (err) {
          console.error("Pilleland failed to start", err);
          setStatus("error");
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
      app?.dispose();
      appRef.current = null;
    };
  }, []);

  // cards for the current stop (ride) or proximity (walk)
  const stopId = state?.stop?.id;
  const nearId = state?.near?.id;
  const mode = state?.mode ?? "ride";
  useEffect(() => setMenu(false), [mode]);

  useEffect(() => {
    const app = appRef.current;
    if (!app || !app.state) return;
    if (mode === "ride" && app.ride?.stop) setLandmarks(app.landmarksFor(app.ride.stop));
    else if (mode === "walk") setLandmarks(app.state.near ? [app.state.near] : []);
    setCardIndex(0);
  }, [mode, stopId, nearId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(null);
        setShowHelp(false);
        setShowPostcards(false);
      }
      if (e.key === "?") setShowHelp((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const app = appRef.current;
  const ready = status === "ready" && state?.ready;
  const stops = app?.city.route.stops ?? [];
  const current = landmarks[cardIndex] ?? landmarks[0] ?? null;

  const startTour = useCallback(() => {
    appRef.current?.startTour();
  }, []);
  const startWalk = useCallback(() => {
    const a = appRef.current;
    if (!a) return;
    a.sounds.unlock();
    a.setState({ intro: false });
    a.setMode("walk");
  }, []);

  if (status === "unsupported" || status === "error") {
    return (
      <div className={styles.fallback}>
        <BrandLogo className={styles.fallbackLogo} />
        <h1>Pilleland needs WebGL.</h1>
        <p>
          This portfolio is a 3D LEGO® city rendered in your browser. Your device couldn&apos;t start it, but
          everything in the city also lives on the classic page.
        </p>
        <Link href="/classic">Open the classic portfolio</Link>
      </div>
    );
  }

  return (
    <div className={styles.shell} data-mode={mode} data-night={state?.night ? "true" : "false"}>
      <div ref={containerRef} className={styles.canvas} />
      <div className={styles.vignette} aria-hidden="true" />

      {/* top bar */}
      <header className={styles.topbar}>
        <Link href="/classic" className={styles.brand} aria-label="Hector Mendoza, classic portfolio">
          <BrandLogo />
          <span>
            <strong>Pilleland</strong>
            <small>Hector Mendoza · Software Engineer</small>
          </span>
        </Link>
        {ready && !state?.intro && (
          <div className={styles.studCounter} aria-live="polite" title="Gold studs collected on foot">
            <span className={styles.goldStud} aria-hidden="true" />
            <strong>{state.studs}</strong>
            <small>/ {state.studsTotal}</small>
          </div>
        )}
        <div className={styles.controls} role="toolbar" aria-label="City controls">
          <div className={styles.segment} role="group" aria-label="Mode">
            <button
              type="button"
              aria-pressed={mode === "ride"}
              onClick={() => app?.setMode("ride")}
              disabled={!ready}
            >
              <TramFront size={15} aria-hidden="true" /> Ride
            </button>
            <button
              type="button"
              aria-pressed={mode === "walk"}
              onClick={() => app?.setMode("walk")}
              disabled={!ready}
            >
              <Footprints size={15} aria-hidden="true" /> Walk
            </button>
            <button
              type="button"
              aria-pressed={mode === "explore"}
              onClick={() => app?.setMode("explore")}
              disabled={!ready}
              title="3D model viewer"
            >
              <Orbit size={15} aria-hidden="true" /> Explore
            </button>
          </div>
          <button
            type="button"
            className={`${styles.pill} ${styles.moreToggle}`}
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label="More controls"
          >
            <MoreHorizontal size={16} aria-hidden="true" />
          </button>
          <div className={`${styles.secondaryControls} ${menu ? styles.secondaryOpen : ""}`}>
          {mode === "explore" ? (
            <button
              type="button"
              className={styles.pill}
              onClick={() => app?.setAutoRotate(!state?.autoRotate)}
              aria-pressed={!!state?.autoRotate}
              disabled={!ready}
              title="Turntable"
            >
              <RefreshCw size={15} aria-hidden="true" />
              <span>{state?.autoRotate ? "Turning" : "Still"}</span>
            </button>
          ) : mode === "ride" ? (
            <button
              type="button"
              className={styles.pill}
              onClick={() => app?.setAutoplay(!state?.autoplay)}
              aria-pressed={!!state?.autoplay}
              disabled={!ready}
              title="Auto-advance through the stops"
            >
              {state?.autoplay ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              <span>{state?.autoplay ? "Touring" : "Paused"}</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.pill}
              onClick={() => app?.setView(state?.view === "third" ? "first" : "third")}
              disabled={!ready}
              title="Toggle first / third person (V)"
            >
              <Eye size={15} aria-hidden="true" />
              <span>{state?.view === "first" ? "1st person" : "3rd person"}</span>
            </button>
          )}
          <button
            type="button"
            className={styles.pill}
            onClick={() => app?.setMuted(!state?.muted)}
            aria-pressed={!state?.muted}
            disabled={!ready}
            title="Sound (M)"
          >
            {state?.muted ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
            <span>{state?.muted ? "Muted" : "Sound"}</span>
          </button>
          <button
            type="button"
            className={styles.pill}
            onClick={() => app?.setNight(!state?.night)}
            aria-pressed={!!state?.night}
            disabled={!ready}
            title="Day / night (N)"
          >
            {state?.night ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
            <span>{state?.night ? "Day" : "Night"}</span>
          </button>
          <button
            type="button"
            className={styles.pill}
            onClick={() => setShowPostcards((v) => !v)}
            aria-expanded={showPostcards}
            title="Blender renders of the city"
          >
            <ImageIcon size={15} aria-hidden="true" />
            <span>Postcards</span>
          </button>
          <button type="button" className={styles.pill} onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp} aria-label="Controls help">
            ?
          </button>
          <Link href="/classic" className={`${styles.pill} ${styles.classicLink}`}>
            Classic site
          </Link>
          </div>
        </div>
      </header>

      {/* minimap */}
      <aside className={styles.minimapWrap} aria-label="City map">
        <canvas ref={minimapRef} className={styles.minimap} width={180} height={180} />
        <ul className={styles.legend}>
          <li>
            <i style={{ background: "#f2cd37" }} /> Line 1
          </li>
          <li>
            <i style={{ background: "#c91a09" }} /> Tram
          </li>
          <li>
            <i style={{ background: "#ffffff" }} /> You
          </li>
        </ul>
      </aside>

      {/* ride navigator */}
      {ready && mode === "ride" && !state?.intro && (
        <nav className={styles.navigator} aria-label="Tram stops">
          <button type="button" className={styles.iconButton} onClick={() => app?.prevStop()} aria-label="Previous stop">
            <ChevronLeft size={18} />
          </button>
          <div className={styles.stopInfo}>
            <small>
              {state?.moving ? "Next stop" : "Now at"} · {state.stopIndex + 1} / {stops.length}
            </small>
            <strong>{state?.stop?.title}</strong>
            <ol className={styles.dots}>
              {stops.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-label={`Go to ${s.title}`}
                    aria-current={i === state.stopIndex ? "step" : undefined}
                    onClick={() => app?.goToStop(i)}
                    title={s.title}
                  />
                </li>
              ))}
            </ol>
          </div>
          <button type="button" className={styles.iconButton} onClick={() => app?.nextStop()} aria-label="Next stop">
            <ChevronRight size={18} />
          </button>
        </nav>
      )}

      {/* explore (model viewer) toolbar */}
      {ready && mode === "explore" && !state?.intro && (
        <>
          <nav className={styles.viewerBar} aria-label="Model viewer">
            <button type="button" className={styles.iconButton} onClick={() => app?.orbitZoom(0.8)} aria-label="Zoom in" title="Zoom in">
              <ZoomIn size={18} />
            </button>
            <button type="button" className={styles.iconButton} onClick={() => app?.orbitZoom(1.25)} aria-label="Zoom out" title="Zoom out">
              <ZoomOut size={18} />
            </button>
            <span className={styles.viewerSep} aria-hidden="true" />
            <button type="button" className={styles.viewerView} onClick={() => app?.orbitView("home")}>
              <RotateCcw size={14} aria-hidden="true" /> Reset
            </button>
            <button type="button" className={styles.viewerView} onClick={() => app?.orbitView("top")}>
              Top
            </button>
            {!touch && (
              <>
                <button type="button" className={styles.viewerView} onClick={() => app?.orbitView("front")}>
                  Front
                </button>
                <button type="button" className={styles.viewerView} onClick={() => app?.orbitView("side")}>
                  Side
                </button>
                <span className={styles.viewerSep} aria-hidden="true" />
                <a className={styles.viewerView} href="/city/lego-city.glb" download title="Download the glTF model">
                  <Download size={14} aria-hidden="true" /> glTF
                </a>
              </>
            )}
          </nav>
          {!touch && <div className={styles.hint}>Drag to orbit · scroll to zoom · right-drag to pan · click a label to open it</div>}
        </>
      )}

      {/* walk helpers */}
      {ready && mode === "walk" && !state?.intro && (
        <>
          {touch && <Joystick onMove={(x, z) => app?.setJoystick(x, z)} />}
          {touch && (
            <button type="button" className={styles.jumpButton} onClick={() => app?.jump()} aria-label="Jump">
              <ArrowUp size={22} />
            </button>
          )}
          {!touch && <div className={styles.hint}>WASD walk · Shift run · Space jump · drag to look · E enter · Tab ride</div>}
          {state?.near && !open && (
            <button type="button" className={styles.enter} onClick={() => setOpen(state.near)}>
              <span className={styles.key}>E</span> Enter {state.near.title}
            </button>
          )}
        </>
      )}

      {/* ride cards: what's at this stop */}
      {ready && mode === "ride" && !state?.intro && !open && current && (
        <section className={styles.stopCards} aria-label="At this stop">
          {landmarks.length > 1 && (
            <div className={styles.cardTabs} role="tablist">
              {landmarks.map((lm, i) => (
                <button
                  key={lm.id}
                  type="button"
                  role="tab"
                  aria-selected={i === cardIndex}
                  onClick={() => setCardIndex(i)}
                >
                  {lm.title}
                </button>
              ))}
            </div>
          )}
          <LandmarkCard landmark={current} compact />
          <button type="button" className={styles.more} onClick={() => setOpen(current)}>
            Open {current.title}
          </button>
        </section>
      )}

      {/* full card */}
      {open && (
        <div className={styles.cardWrap}>
          <LandmarkCard landmark={open} onClose={() => setOpen(null)} />
        </div>
      )}

      {showPostcards && <Postcards onClose={() => setShowPostcards(false)} />}

      {/* help */}
      {showHelp && (
        <div className={styles.help} role="dialog" aria-label="Controls">
          <h3>Controls</h3>
          <dl>
            <dt>Tab</dt>
            <dd>Cycle Ride → Walk → Explore</dd>
            <dt>Explore</dt>
            <dd>3D viewer: drag to orbit, scroll or pinch to zoom, right-drag or two fingers to pan</dd>
            <dt>Space / ← →</dt>
            <dd>Next / previous tram stop (riding)</dd>
            <dt>WASD</dt>
            <dd>Walk (hold Shift to run)</dd>
            <dt>Space</dt>
            <dd>Jump (walking)</dd>
            <dt>Gold studs</dt>
            <dd>Walk into them to collect all {state?.studsTotal ?? ""}</dd>
            <dt>Drag</dt>
            <dd>Look around · scroll to zoom</dd>
            <dt>E</dt>
            <dd>Enter the building you&apos;re standing at</dd>
            <dt>Tap a label</dt>
            <dd>Open any building from afar</dd>
            <dt>V · N · M</dt>
            <dd>First person · night mode · mute</dd>
          </dl>
          <button type="button" className={styles.more} onClick={() => setShowHelp(false)}>
            Got it
          </button>
        </div>
      )}

      {/* intro / loading */}
      {(!ready || state?.intro) && (
        <div className={styles.intro} role="dialog" aria-label="Welcome">
          <div className={styles.introCard}>
            <p className={styles.eyebrow}>
              <span className={styles.brick} aria-hidden="true" /> Welcome to
            </p>
            <h1 className={styles.title}>
              <span>Pille</span><span>land</span>
            </h1>
            <p>
              A brick-built portfolio you can travel through. Every building is a project, a job, or a chapter of
              my story. Ride the tram for the guided tour, get off and walk anywhere, or spin the whole set around
              like a model.
            </p>
            {ready && (
              <div className={styles.picker} role="radiogroup" aria-label="Pick your minifig">
                <span>Your minifig</span>
                {OUTFITS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={outfit === o.id}
                    aria-label={o.label}
                    title={o.label}
                    style={{ background: o.hex }}
                    onClick={() => {
                      setOutfit(o.id);
                      app?.setPlayerColors({ torso: o.torso, legs: o.legs });
                    }}
                  />
                ))}
              </div>
            )}
            {ready ? (
              <div className={styles.introActions}>
                <button type="button" className={styles.primary} onClick={startTour}>
                  <TramFront size={16} aria-hidden="true" /> Start the tour
                </button>
                <button type="button" className={styles.secondary} onClick={startWalk}>
                  <Footprints size={16} aria-hidden="true" /> Walk instead
                </button>
                <button type="button" className={styles.secondary} onClick={() => appRef.current?.explore()}>
                  <Orbit size={16} aria-hidden="true" /> Just look around
                </button>
              </div>
            ) : (
              <div className={styles.loading} aria-live="polite">
                <span className={styles.studs}>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                Building {reducedMotion ? "" : "36,000 studs"}…
              </div>
            )}
            <small>
              Prefer a plain page? <Link href="/classic">Open the classic portfolio</Link>.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
