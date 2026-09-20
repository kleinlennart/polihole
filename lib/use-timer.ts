"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Long enough for the three screen flashes in globals.css to finish. */
const FLASH_MS = 1080;
const BEEPS = 3;
const BEEP_GAP_MS = FLASH_MS / BEEPS;

export type TimerPhase = "idle" | "running" | "finished";

export type Timer = {
  phase: TimerPhase;
  /** Milliseconds left, or null when no timer is running. */
  remainingMs: number | null;
  start: (seconds: number) => void;
  reset: () => void;
};

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Three short beeps, synthesised rather than loaded, so there's no audio file
 * to ship or cache for offline use. The context has to be created inside the
 * click that starts the timer: browsers won't let a page open one on its own.
 */
function playAlarm(context: AudioContext | null) {
  if (!context) return;
  void context.resume().catch(() => {});

  for (let i = 0; i < BEEPS; i++) {
    const at = context.currentTime + (i * BEEP_GAP_MS) / 1000;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 880;
    // Ramped rather than switched, because an abrupt gain change clicks.
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.18, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.18);
  }
}

/**
 * A countdown someone starts by hand when they begin explaining. It counts
 * down from a wall-clock deadline rather than by subtracting ticks, so a
 * backgrounded tab that stops firing intervals still comes back with the right
 * time left. At zero it flashes and beeps, then puts the card back the way it
 * was — there's nothing to do with a spent clock.
 */
export function useTimer(): Timer {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (endsAt === null) return;
    let rung = false;
    const id = setInterval(() => {
      const left = Math.max(0, endsAt - Date.now());
      setRemainingMs(left);
      if (left === 0 && !rung) {
        rung = true;
        clearInterval(id);
        setPhase("finished");
        playAlarm(audio.current);
      }
    }, 200);
    return () => clearInterval(id);
  }, [endsAt]);

  // Back to the card as it was, once the flashes are done.
  useEffect(() => {
    if (phase !== "finished") return;
    const id = setTimeout(() => {
      setPhase("idle");
      setEndsAt(null);
      setRemainingMs(null);
    }, FLASH_MS);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => () => void audio.current?.close().catch(() => {}), []);

  const start = useCallback((seconds: number) => {
    if (!audio.current) {
      const w = window as AudioWindow;
      const Ctor = window.AudioContext ?? w.webkitAudioContext;
      audio.current = Ctor ? new Ctor() : null;
    }
    void audio.current?.resume().catch(() => {});

    setEndsAt(Date.now() + seconds * 1000);
    setRemainingMs(seconds * 1000);
    setPhase("running");
  }, []);

  const reset = useCallback(() => {
    setEndsAt(null);
    setRemainingMs(null);
    setPhase("idle");
  }, []);

  return { phase, remainingMs, start, reset };
}

/** Milliseconds as `0:47`, rounded up so it only shows 0:00 when it's over. */
export function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
