import {useCallback, useEffect, useSyncExternalStore} from 'react';
import Sound from 'react-native-nitro-sound';

type PlayerStatus = 'idle' | 'playing' | 'paused';

type PlayerState = {
  activeMessageId: string | null;
  status: PlayerStatus;
  positionMs: number;
  durationMs: number;
};

const listeners = new Set<() => void>();
const durationCache = new Map<string, number>();

let state: PlayerState = {
  activeMessageId: null,
  status: 'idle',
  positionMs: 0,
  durationMs: 0,
};

let fallbackTimer: ReturnType<typeof setInterval> | null = null;
let playStartedAt = 0;

function emit() {
  listeners.forEach(listener => listener());
}

function setState(patch: Partial<PlayerState>) {
  state = {...state, ...patch};
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function stopFallbackTimer() {
  if (fallbackTimer) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }
}

function startFallbackTimer(messageId: string) {
  stopFallbackTimer();
  playStartedAt = Date.now();
  fallbackTimer = setInterval(() => {
    if (state.activeMessageId !== messageId || state.status !== 'playing') return;
    const elapsed = Date.now() - playStartedAt;
    if (elapsed > state.positionMs + 80 || state.positionMs === 0) {
      setState({positionMs: elapsed});
    }
  }, 100);
}

function detachPlaybackListeners() {
  Sound.removePlayBackListener();
  Sound.removePlaybackEndListener();
}

export async function stopActiveVoicePlayback() {
  stopFallbackTimer();
  detachPlaybackListeners();
  await Sound.stopPlayer().catch(() => undefined);
  setState({
    activeMessageId: null,
    status: 'idle',
    positionMs: 0,
    durationMs: 0,
  });
}

export function useVoicePlayer(messageId: string, uri: string) {
  const playerState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const isActive = playerState.activeMessageId === messageId;
  const status: PlayerStatus = isActive ? playerState.status : 'idle';
  const positionMs = isActive ? playerState.positionMs : 0;
  const cachedDurationMs = durationCache.get(messageId) ?? 0;
  const durationMs = isActive
    ? playerState.durationMs || cachedDurationMs
    : cachedDurationMs;
  const progress =
    durationMs > 0
      ? Math.min(1, positionMs / durationMs)
      : status === 'playing'
        ? Math.min(0.92, positionMs / 5000)
        : 0;

  useEffect(() => {
    return () => {
      if (state.activeMessageId === messageId) {
        void stopActiveVoicePlayback();
      }
    };
  }, [messageId]);

  const play = useCallback(async () => {
    if (!uri) return;

    if (state.activeMessageId && state.activeMessageId !== messageId) {
      await stopActiveVoicePlayback();
    }

    const isResume = state.activeMessageId === messageId && state.status === 'paused';

    try {
      detachPlaybackListeners();
      Sound.setSubscriptionDuration(0.05);

      Sound.addPlayBackListener(meta => {
        if (state.activeMessageId !== messageId) return;
        const nextDuration =
          meta.duration > 0 ? meta.duration : state.durationMs || cachedDurationMs;
        setState({
          positionMs: meta.currentPosition,
          durationMs: nextDuration,
        });
        if (nextDuration > 0) {
          durationCache.set(messageId, nextDuration);
        }
      });

      Sound.addPlaybackEndListener(meta => {
        if (state.activeMessageId !== messageId) return;
        stopFallbackTimer();
        detachPlaybackListeners();
        const finalDuration = Math.max(
          meta.duration,
          meta.currentPosition,
          state.positionMs,
        );
        if (finalDuration > 0) {
          durationCache.set(messageId, finalDuration);
        }
        setState({
          activeMessageId: null,
          status: 'idle',
          positionMs: 0,
          durationMs: 0,
        });
      });

      setState({
        activeMessageId: messageId,
        status: 'playing',
        positionMs: isResume ? state.positionMs : 0,
        durationMs: state.durationMs || cachedDurationMs,
      });

      if (isResume) {
        await Sound.resumePlayer();
        startFallbackTimer(messageId);
        return;
      }

      await Sound.startPlayer(uri);
      startFallbackTimer(messageId);
    } catch {
      stopFallbackTimer();
      detachPlaybackListeners();
      setState({
        activeMessageId: null,
        status: 'idle',
        positionMs: 0,
        durationMs: 0,
      });
    }
  }, [messageId, uri, cachedDurationMs]);

  const pause = useCallback(async () => {
    if (state.activeMessageId !== messageId || state.status !== 'playing') return;
    stopFallbackTimer();
    await Sound.pausePlayer().catch(() => undefined);
    setState({status: 'paused'});
  }, [messageId]);

  const stop = useCallback(async () => {
    if (state.activeMessageId !== messageId) return;
    if (state.positionMs > 0) {
      durationCache.set(messageId, state.positionMs);
    }
    await stopActiveVoicePlayback();
  }, [messageId]);

  const toggle = useCallback(async () => {
    if (status === 'playing') {
      await pause();
      return;
    }
    await play();
  }, [status, play, pause]);

  return {
    status,
    isPlaying: status === 'playing',
    isPaused: status === 'paused',
    positionMs,
    durationMs,
    positionLabel: formatTime(positionMs),
    durationLabel: formatTime(durationMs),
    progress,
    play,
    pause,
    stop,
    toggle,
  };
}
