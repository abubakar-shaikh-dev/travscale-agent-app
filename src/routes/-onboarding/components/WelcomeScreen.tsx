// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// Motion
import { motion, useReducedMotion, type Variants } from "framer-motion";

// UI Components
import { ShaderBackground } from "@/components/motion/shader-background";

// Utils
import { useAuthStore } from "@/lib/auth-store";

/**
 * The arrival moment between onboarding and the dashboard, in the same visual
 * language as the auth showcase panel: the brand shader, the user's name, and
 * a short hold, then an automatic handover.
 *
 * Pure type, no logo: the shader IS the brand statement, and a mark on top
 * of it would be the brand introducing itself twice. One idea per screen.
 *
 * Choreography (seconds, from mount):
 *   0.15  "Welcome" eyebrow rises in
 *   0.40  name letters cascade up out of a line mask (35ms apart)
 *   1.05  supporting line lands
 *   1.45  hold indicator starts filling (2.6s, linear)
 *   4.20  content passes through (scale up, blur, fade)
 *   4.68  navigate to the dashboard inside a view transition
 *
 * The exit beat happens in-page so the view transition crossfades between a
 * quiet shader frame and the dashboard, rather than snapping mid-type.
 * A Skip button is always available: never trap the user in a celebration.
 */

// Mirrors --motion-ease-out from index.css.
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
// Departures accelerate away; ease-out on an exit reads as hesitation.
const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

// Same palette as the auth showcase panel: the journey is bookended by it.
const SHADER_COLORS = ["#03071e", "#ff006e", "#03071e", "#ffbe0b"];

const TIMELINE = {
  eyebrow: 0.15,
  letters: 0.4,
  letterStagger: 0.035,
  subline: 1.05,
  footer: 1.25,
  barDelay: 1.45,
  barDuration: 2.6,
  leaveMs: 4200,
  exitMs: 480,
  reducedLeaveMs: 2200,
  reducedExitMs: 250,
} as const;

// Text shadow keeps the type legible over the moving shader (same recipe as
// the auth showcase panel).
const TEXT_SHADOW = "[text-shadow:_0_2px_24px_rgb(0_0_0_/_55%)]";

export function WelcomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const reducedMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const handedOffRef = useRef(false);

  // First name reads more personal (Windows OOBE does the same). The API
  // always supplies a name; "Travscale" is only a graceful fallback.
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  const eyebrow = firstName ? "Welcome" : "Welcome to";
  const headline = firstName || "Travscale";
  const letters = useMemo(() => Array.from(headline), [headline]);

  const handOff = useCallback(() => {
    if (handedOffRef.current) return;
    handedOffRef.current = true;
    // viewTransition: the router wraps the commit in document.startViewTransition
    // where supported (the CSS below tunes the dissolve); older browsers fall
    // back to a plain swap after the in-page exit beat.
    void navigate({ to: "/", replace: true, viewTransition: true });
  }, [navigate]);

  useEffect(() => {
    const leaveMs = reducedMotion ? TIMELINE.reducedLeaveMs : TIMELINE.leaveMs;
    const exitMs = reducedMotion ? TIMELINE.reducedExitMs : TIMELINE.exitMs;
    const leaveTimer = window.setTimeout(() => setLeaving(true), leaveMs);
    const navTimer = window.setTimeout(handOff, leaveMs + exitMs);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(navTimer);
    };
  }, [reducedMotion, handOff]);

  // This scene is dark regardless of the OS scheme, but the browser chrome
  // takes its color from the static per-scheme theme-color metas in
  // index.html. Paint it to match the shader while mounted, restore after
  // (the dashboard that follows is light unless the OS says otherwise).
  useEffect(() => {
    const metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    );
    if (metas.length === 0) return;
    const previous = metas.map((meta) => meta.getAttribute("content"));
    metas.forEach((meta) => meta.setAttribute("content", "#03071e"));
    return () => {
      metas.forEach((meta, index) => {
        const value = previous[index];
        if (value === null) meta.removeAttribute("content");
        else meta.setAttribute("content", value);
      });
    };
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#03071e] px-6 text-center">
      <ShaderBackground
        variant="warp"
        className="absolute inset-0"
        colors={SHADER_COLORS}
        speed={0.8}
      />
      {/* Scrim: keeps the white type legible without flattening the shader. */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/30"
        aria-hidden="true"
      />

      <motion.div
        initial="idle"
        animate={leaving ? "leaving" : "idle"}
        variants={stackVariants}
        className="relative z-10 flex flex-col items-center"
      >
        {/* One idea per screen: the name IS the content. The greeting uses
            the wizard's own eyebrow language (small, uppercase, tracked out)
            so the two screens read as one flow. */}
        <motion.p
          variants={fadeUpVariants(reducedMotion, TIMELINE.eyebrow, 12)}
          initial="hidden"
          animate="shown"
          className={`text-xs font-medium uppercase tracking-wider text-white/65 ${TEXT_SHADOW}`}
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          variants={
            reducedMotion
              ? fadeUpVariants(reducedMotion, 0, 0)
              : headlineWrapVariants
          }
          initial="hidden"
          animate="shown"
          aria-label={headline}
          className="mt-3 font-heading text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          {/* aria-hidden letters: assistive tech reads the aria-label above,
              never the per-letter split. The padding + negative margin keeps
              descenders (g, j, y) unclipped by the line mask. */}
          <span
            aria-hidden="true"
            className="flex flex-wrap justify-center leading-[1.05]"
          >
            {reducedMotion
              ? headline
              : letters.map((letter, index) => (
                  <span
                    key={index}
                    className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em]"
                  >
                    <motion.span
                      variants={letterVariants}
                      className="inline-block will-change-transform"
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  </span>
                ))}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUpVariants(reducedMotion, TIMELINE.subline, 10)}
          initial="hidden"
          animate="shown"
          className={`mt-5 text-base text-white/65 ${TEXT_SHADOW}`}
        >
          Your workspace is ready.
        </motion.p>

        {/* Status line for assistive tech: the redirect is automatic, so it
            must be announced, not just visual. The bar itself is decoration. */}
        <p className="sr-only">Taking you to your dashboard.</p>

        {/* Hold indicator: communicates the auto-redirect without words.
            Fills linearly so the remaining wait is readable at a glance.
            Pure movement, so it is dropped under reduced motion. */}
        {!reducedMotion && (
          <motion.div
            variants={fadeUpVariants(reducedMotion, TIMELINE.footer, 6)}
            initial="hidden"
            animate="shown"
            className="mt-14"
          >
            <div
              className="h-[3px] w-28 overflow-hidden rounded-full bg-white/15"
              aria-hidden="true"
            >
              <motion.div
                className="h-full w-full rounded-full bg-white/85"
                style={{ transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: TIMELINE.barDelay,
                  duration: TIMELINE.barDuration,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          variants={fadeUpVariants(
            reducedMotion,
            reducedMotion ? 0.05 : TIMELINE.footer + 0.1,
            6,
          )}
          initial="hidden"
          animate="shown"
          className="mt-4"
        >
          <button
            type="button"
            onClick={handOff}
            aria-label="Skip and open your dashboard"
            className="cursor-pointer rounded-sm px-2 py-1 text-xs font-medium text-white/55 transition-colors outline-none hover:text-white/90 active:text-white/90 focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Skip
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}

/* ---------- Variants ---------- */

const stackVariants: Variants = {
  idle: {},
  leaving: {
    opacity: 0,
    scale: 1.04,
    filter: "blur(8px)",
    transition: { duration: TIMELINE.exitMs / 1000, ease: EASE_IN },
  },
};

// The name cascade: each letter rises out of its own line mask. Transform
// only, so the cascade stays on the compositor.
const headlineWrapVariants: Variants = {
  hidden: {},
  shown: {
    transition: {
      staggerChildren: TIMELINE.letterStagger,
      delayChildren: TIMELINE.letters,
    },
  },
};

const letterVariants: Variants = {
  hidden: { y: "115%" },
  shown: { y: "0%", transition: { duration: 0.55, ease: EASE_OUT } },
};

/** Fade-up factory. Reduced motion keeps the opacity change (it aids
    comprehension), drops the movement and the blur, and tightens timing. */
function fadeUpVariants(
  reducedMotion: boolean | null,
  delay: number,
  distance: number,
): Variants {
  return reducedMotion
    ? {
        hidden: { opacity: 0 },
        shown: {
          opacity: 1,
          transition: { duration: 0.2, ease: EASE_OUT, delay: delay },
        },
      }
    : {
        hidden: { opacity: 0, y: distance, filter: "blur(6px)" },
        shown: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease: EASE_OUT, delay: delay },
        },
      };
}
