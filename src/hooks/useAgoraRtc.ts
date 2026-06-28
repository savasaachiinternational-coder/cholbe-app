import {useCallback, useEffect, useState} from 'react';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  type IRtcEngine,
  type IRtcEngineEventHandler,
} from 'react-native-agora';
import {appointmentsApi} from '../api/appointments';

type AgoraCallState = {
  loading: boolean;
  error: string | null;
  joined: boolean;
  remoteUid: number | null;
  muted: boolean;
  videoEnabled: boolean;
  callSeconds: number;
};

export function useAgoraRtc(appointmentId: string) {
  const [engine, setEngine] = useState<IRtcEngine | null>(null);
  const [state, setState] = useState<AgoraCallState>({
    loading: true,
    error: null,
    joined: false,
    remoteUid: null,
    muted: false,
    videoEnabled: true,
    callSeconds: 0,
  });

  const leave = useCallback(async () => {
    if (engine) {
      engine.leaveChannel();
      engine.release();
      setEngine(null);
    }
    setState(prev => ({...prev, joined: false, remoteUid: null}));
  }, [engine]);

  useEffect(() => {
    let mounted = true;
    let rtc: IRtcEngine | null = null;

    const start = async () => {
      try {
        const creds = await appointmentsApi.getAgoraToken(appointmentId);
        if (!mounted) return;

        rtc = createAgoraRtcEngine();
        const handler: IRtcEngineEventHandler = {
          onJoinChannelSuccess: () => {
            if (!mounted) return;
            setState(prev => ({...prev, joined: true, loading: false}));
          },
          onUserJoined: (_connection, uid) => {
            if (!mounted) return;
            setState(prev => ({...prev, remoteUid: uid}));
          },
          onUserOffline: () => {
            if (!mounted) return;
            setState(prev => ({...prev, remoteUid: null}));
          },
          onError: (_err, msg) => {
            if (!mounted) return;
            setState(prev => ({...prev, error: String(msg), loading: false}));
          },
        };

        rtc.registerEventHandler(handler);
        rtc.initialize({appId: creds.appId});
        rtc.enableVideo();
        rtc.startPreview();
        rtc.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
        rtc.joinChannel(creds.token, creds.channelName, creds.uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });

        setEngine(rtc);
      } catch (err) {
        if (!mounted) return;
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Could not start video call',
        }));
      }
    };

    start();

    return () => {
      mounted = false;
      if (rtc) {
        rtc.leaveChannel();
        rtc.release();
      }
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!state.joined) return;
    const timer = setInterval(() => {
      setState(prev => ({...prev, callSeconds: prev.callSeconds + 1}));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.joined]);

  const toggleMute = () => {
    if (!engine) return;
    const next = !state.muted;
    engine.muteLocalAudioStream(next);
    setState(prev => ({...prev, muted: next}));
  };

  const toggleVideo = () => {
    if (!engine) return;
    const next = !state.videoEnabled;
    engine.muteLocalVideoStream(next);
    setState(prev => ({...prev, videoEnabled: next}));
  };

  const formatTimer = () => {
    const m = Math.floor(state.callSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (state.callSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    engine,
    state,
    leave,
    toggleMute,
    toggleVideo,
    formatTimer,
  };
}
