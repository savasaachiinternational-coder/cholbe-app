import {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  type IRtcEngine,
  type IRtcEngineEventHandler,
} from 'react-native-agora';
import {appointmentsApi} from '../api/appointments';
import {requestCallPermissions} from '../utils/callPermissions';

type AgoraCallState = {
  loading: boolean;
  error: string | null;
  joined: boolean;
  previewReady: boolean;
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
    previewReady: false,
    remoteUid: null,
    muted: false,
    videoEnabled: true,
    callSeconds: 0,
  });

  const leave = useCallback(async () => {
    if (engine) {
      engine.stopPreview();
      engine.leaveChannel();
      engine.release();
      setEngine(null);
    }
    setState(prev => ({
      ...prev,
      joined: false,
      previewReady: false,
      remoteUid: null,
    }));
  }, [engine]);

  useEffect(() => {
    let mounted = true;
    let rtc: IRtcEngine | null = null;

    const start = async () => {
      try {
        const allowed = await requestCallPermissions();
        if (!allowed) {
          if (!mounted) return;
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Camera and microphone permissions are required for video calls.',
          }));
          return;
        }

        const creds = await appointmentsApi.getAgoraToken(appointmentId);
        if (!mounted) return;

        rtc = createAgoraRtcEngine();
        const handler: IRtcEngineEventHandler = {
          onJoinChannelSuccess: () => {
            if (!mounted || !rtc) return;
            rtc.startPreview();
            setState(prev => ({
              ...prev,
              joined: true,
              loading: false,
              previewReady: true,
            }));
          },
          onUserJoined: (_connection, uid) => {
            if (!mounted) return;
            setState(prev => ({...prev, remoteUid: uid}));
          },
          onUserOffline: () => {
            if (!mounted) return;
            setState(prev => ({...prev, remoteUid: null}));
          },
          onLocalVideoStateChanged: (_source, stateCode) => {
            if (!mounted) return;
            if (stateCode === 1 || stateCode === 2) {
              setState(prev => ({...prev, previewReady: true}));
            }
          },
          onError: (_err, msg) => {
            if (!mounted) return;
            setState(prev => ({...prev, error: String(msg), loading: false}));
          },
        };

        rtc.registerEventHandler(handler);
        rtc.initialize({appId: creds.appId});
        rtc.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
        rtc.enableAudio();
        rtc.enableVideo();
        rtc.enableLocalVideo(true);
        rtc.startPreview();
        rtc.joinChannel(creds.token, creds.channelName, creds.uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });

        setEngine(rtc);
        if (mounted) {
          setState(prev => ({...prev, previewReady: true, loading: false}));
        }
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
        rtc.stopPreview();
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

  const toggleMute = useCallback(() => {
    if (!engine) return;
    setState(prev => {
      const nextMuted = !prev.muted;
      engine.muteLocalAudioStream(nextMuted);
      return {...prev, muted: nextMuted};
    });
  }, [engine]);

  const toggleVideo = useCallback(() => {
    if (!engine) return;
    setState(prev => {
      const nextEnabled = !prev.videoEnabled;
      engine.enableLocalVideo(nextEnabled);
      engine.muteLocalVideoStream(!nextEnabled);
      if (nextEnabled) {
        engine.startPreview();
      } else {
        engine.stopPreview();
      }
      return {
        ...prev,
        videoEnabled: nextEnabled,
        previewReady: nextEnabled,
      };
    });
  }, [engine]);

  const switchCamera = useCallback(() => {
    if (!engine) return;
    engine.switchCamera();
  }, [engine]);

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
    switchCamera,
    formatTimer,
    isAndroid: Platform.OS === 'android',
  };
};
