import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
  PanResponder,
  Animated,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Brightness from "expo-brightness";
import { useVideoPlayer, VideoView } from "expo-video";

import BottomToolsModal from "../components/BottomToolsModal";

const DRAG_THRESHOLD = 6;
const GESTURE_SENSITIVITY = 220;

function formatTime(totalSeconds: number) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerScreen({ navigation, route }: any) {
  const { id, mediaType, title } = route?.params || {};
  const { width } = useWindowDimensions();
  const isTV = mediaType === "tv";

  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [videoFit, setVideoFit] = useState<"contain" | "cover">("contain");
  
  const [isScraping, setIsScraping] = useState(true); 
  const [streamError, setStreamError] = useState<string | null>(null); 
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const [brightness, setBrightness] = useState(0.5);
  const [volume, setVolume] = useState(0.7);

  const [availableServers, setAvailableServers] = useState<any[]>([]);
  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeModal, setActiveModal] = useState<"server" | "speed" | "audioSub" | null>(null);

  const isLockedRef = useRef(isLocked);
  const brightnessRef = useRef(brightness);
  const volumeRef = useRef(volume);
  const widthRef = useRef(width);
  const isScrapingRef = useRef(isScraping);
  const streamErrorRef = useRef(streamError);
  const modalRef = useRef(activeModal);

  const API_URL = 'http://192.168.0.108:3000'; 
  const getApiHost = (url: string) => {
    try {
      const match = url.match(/\/\/(.*?)(?:\/|$)/);
      return match ? match[1] : "localhost:3000";
    } catch {
      return "localhost:3000";
    }
  };

  useEffect(() => {
    isLockedRef.current = isLocked;
    brightnessRef.current = brightness;
    volumeRef.current = volume;
    widthRef.current = width;
    isScrapingRef.current = isScraping;
    streamErrorRef.current = streamError;
    modalRef.current = activeModal;
  }, [isLocked, brightness, volume, width, isScraping, streamError, activeModal]);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const lockedControlsOpacity = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  
  const [indicator, setIndicator] = useState<"brightness" | "volume" | null>(null);
  const hideIndicatorTimeout = useRef<any>(null);
  const [seekFeedback, setSeekFeedback] = useState<{ amount: number; side: "left" | "right" } | null>(null);
  const seekTimeout = useRef<any>(null);

  const gestureStartValue = useRef(0.5);
  const gestureZone = useRef<"brightness" | "volume" | "pinch" | null>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const hasPinched = useRef(false);
  const lastTapTime = useRef(0);
  const singleTapTimeout = useRef<any>(null);
  const lastTapX = useRef(0); 
  const progressBarWidth = useRef(0);

  const player = useVideoPlayer(null, (player) => {
    player.loop = true;
    player.playbackRate = playbackRate;
  });

  const extractSourceUrl = (rawUrl: string) => {
    let sourceObj: any = rawUrl;
    if (rawUrl.includes('/v1/proxy?data=')) {
      try {
        const encodedData = rawUrl.split('/v1/proxy?data=')[1];
        const decodedJson = JSON.parse(decodeURIComponent(encodedData));
        sourceObj = { uri: decodedJson.url, headers: decodedJson.headers };
      } catch (e) {}
    } else {
      const activeHost = getApiHost(API_URL);
      sourceObj = rawUrl.replace("localhost:3000", activeHost);
    }
    return sourceObj;
  };

  useEffect(() => {
    async function loadMovieMagic() {
      setIsScraping(true);
      setStreamError(null);
      try {
        const fetchUrl = mediaType === "tv" ? `${API_URL}/v1/tv/${id}/seasons/1/episodes/1` : `${API_URL}/v1/movies/${id}`;
        const response = await fetch(fetchUrl);
        const data = await response.json();
        
        if (data.sources && data.sources.length > 0) {
          setAvailableServers(data.sources);
          setCurrentServerIndex(0);
          const sourceObj = extractSourceUrl(data.sources[0].url);
          if (player) {
            await player.replaceAsync(sourceObj);
            player.play();
          }
        } else {
          setStreamError("We're having trouble playing this title right now.");
        }
      } catch (err: any) {
        setStreamError("Could not connect to the CinePro server.");
      } finally {
        setIsScraping(false);
      }
    }
    if (id) loadMovieMagic();
  }, [id, mediaType, player]);

  useEffect(() => {
    if (!player) return;
    if (activeModal === "server" || activeModal === "audioSub") {
      player.pause();
      setIsPlaying(false);
    } else if (activeModal === null && !isScraping && !streamError) {
      player.play();
      setIsPlaying(true);
    }
  }, [activeModal, player, isScraping, streamError]);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => { ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === "granted") setBrightness(await Brightness.getBrightnessAsync());
      } catch (err) {}
    })();
  }, []);

  // 🚀 FASTER ANIMATIONS: Dropped duration from 300ms to 200ms
  useEffect(() => {
    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: showControls && !isLocked && !isScraping && !streamError && !activeModal ? 1 : 0,
        duration: activeModal ? 0 : 60,
        useNativeDriver: true,
      }),
      Animated.timing(lockedControlsOpacity, {
        toValue: showControls && isLocked && !isScraping && !streamError && !activeModal ? 1 : 0,
        duration: activeModal ? 0 : 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showControls, isLocked, isScraping, streamError, activeModal]);

  useEffect(() => {
    if (showControls && isPlaying && !isDraggingProgress && !indicator && !isScraping && !streamError && !activeModal) {
      const timer = setTimeout(() => setShowControls(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying, isLocked, isDraggingProgress, indicator, isScraping, streamError, activeModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && !isDraggingProgress) {
        setCurrentTime(player.currentTime);
        setDuration(player.duration > 0 ? player.duration : 1);
        setIsPlaying(player.playing);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player, isDraggingProgress]);

  function togglePlayPause() {
    if (isPlaying) player.pause(); else player.play();
    setIsPlaying(!isPlaying);
  }

  const changeServer = async (index: number) => {
    if (!player || index === currentServerIndex) return;
    setCurrentServerIndex(index);
    setIsScraping(true);
    try {
      const sourceObj = extractSourceUrl(availableServers[index].url);
      const savedTime = player.currentTime;
      await player.replaceAsync(sourceObj);
      player.currentTime = savedTime;
      player.play();
    } catch (e) {} finally {
      setIsScraping(false);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (player) player.playbackRate = rate;
  };

  function handleSeek(direction: "rewind" | "forward") {
    if (streamErrorRef.current || isScrapingRef.current || modalRef.current) return;
    setShowControls(true);
    const increment = direction === "rewind" ? -10 : 10;
    const side = direction === "rewind" ? "left" : "right";
    setSeekFeedback((prev) => ({ amount: prev && prev.side === side ? prev.amount + increment : increment, side }));
    if (player) player.currentTime = Math.max(0, player.currentTime + increment);
    if (seekTimeout.current) clearTimeout(seekTimeout.current);
    seekTimeout.current = setTimeout(() => setSeekFeedback(null), 800);
  }

  function handleProgressMove(evt: any) {
    if (progressBarWidth.current === 0) return;
    const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, progressBarWidth.current));
    setCurrentTime((touchX / progressBarWidth.current) * duration); 
  }

  function handleProgressRelease(evt: any) {
    if (progressBarWidth.current === 0 || !player) return;
    const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, progressBarWidth.current));
    const newTime = (touchX / progressBarWidth.current) * duration;
    setCurrentTime(newTime); 
    player.currentTime = newTime; 
  }

  function showIndicator(type: "brightness" | "volume") {
    setIndicator(type);
    if (hideIndicatorTimeout.current) clearTimeout(hideIndicatorTimeout.current);
    Animated.timing(indicatorOpacity, { toValue: 1, duration: 120, useNativeDriver: true }).start();
  }

  function hideIndicatorSoon() {
    if (hideIndicatorTimeout.current) clearTimeout(hideIndicatorTimeout.current);
    hideIndicatorTimeout.current = setTimeout(() => {
      Animated.timing(indicatorOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setIndicator(null));
    }, 500);
  }

  async function applyBrightness(value: number) {
    setBrightness(value);
    try { await Brightness.setBrightnessAsync(value); } catch (err) {}
  }

  function applyVolume(value: number) {
    setVolume(value);
    if (player) player.volume = value;
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isLockedRef.current || isScrapingRef.current || streamErrorRef.current || modalRef.current) return false; 
        return Math.abs(gestureState.dy) > DRAG_THRESHOLD || Math.abs(gestureState.dx) > DRAG_THRESHOLD;
      },
      onPanResponderGrant: (evt) => {
        if (isLockedRef.current || isScrapingRef.current || streamErrorRef.current || modalRef.current) return;
        const touches = evt.nativeEvent.touches;
        hasPinched.current = touches.length >= 2;
        if (touches.length >= 2) {
          gestureZone.current = "pinch";
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
        } else {
          lastTapX.current = evt.nativeEvent.pageX; 
          gestureZone.current = lastTapX.current < widthRef.current / 2 ? "brightness" : "volume";
          gestureStartValue.current = gestureZone.current === "brightness" ? brightnessRef.current : volumeRef.current;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isLockedRef.current || isScrapingRef.current || streamErrorRef.current || modalRef.current) return;
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          hasPinched.current = true;
          gestureZone.current = "pinch";
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);
          if (initialPinchDistance.current === null) initialPinchDistance.current = currentDistance;
          else {
            const delta = currentDistance - initialPinchDistance.current;
            if (delta > 10) setVideoFit("cover"); else if (delta < -10) setVideoFit("contain");
          }
          return;
        }
        if (hasPinched.current || gestureZone.current === "pinch") return;
        if (Math.abs(gestureState.dy) <= DRAG_THRESHOLD) return;
        const delta = -gestureState.dy / GESTURE_SENSITIVITY;
        const newValue = Math.min(1, Math.max(0, gestureStartValue.current + delta));
        if (gestureZone.current === "brightness") { applyBrightness(newValue); showIndicator("brightness"); } 
        else if (gestureZone.current === "volume") { applyVolume(newValue); showIndicator("volume"); }
      },
      // 🚀 FASTER TAP DETECTION
      onPanResponderRelease: (_, gestureState) => {
        if (streamErrorRef.current || modalRef.current) return; 
        const wasDrag = Math.abs(gestureState.dy) > DRAG_THRESHOLD || Math.abs(gestureState.dx) > DRAG_THRESHOLD;
        
        if (isLockedRef.current || isScrapingRef.current) {
          if (!wasDrag && !isScrapingRef.current) setShowControls((prev) => !prev);
          return;
        }

        if (hasPinched.current) { gestureZone.current = null; initialPinchDistance.current = null; hasPinched.current = false; return; }
        
        if (!wasDrag) {
          const now = Date.now();
          const absoluteX = gestureState.x0; 
          
          if (now - lastTapTime.current < 250) {
            clearTimeout(singleTapTimeout.current);
            setShowControls(true);
            if (absoluteX < widthRef.current / 2) handleSeek("rewind"); else handleSeek("forward");
            lastTapTime.current = 0; 
          } else {
            lastTapTime.current = now;
            singleTapTimeout.current = setTimeout(() => setShowControls((prev) => !prev), 60);
          }
        } else { hideIndicatorSoon(); }
        gestureZone.current = null;
      },
    })
  ).current;

  const progressPercent = duration > 1 ? (currentTime / duration) * 100 : 0;
  const remainingTime = duration - currentTime;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.videoLayer} pointerEvents="none">
        <VideoView style={StyleSheet.absoluteFill} player={player} nativeControls={false} contentFit={videoFit} />
        {duration <= 1 && !isScraping && !streamError && <ActivityIndicator size="large" color="#E50914" style={styles.loadingSpinner} />}
      </View>

      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.01)" }]} {...panResponder.panHandlers} />

      {!activeModal && (
        <Animated.View 
          style={[StyleSheet.absoluteFill, { opacity: controlsOpacity }]} 
          pointerEvents={showControls && !isLocked && !isScraping && !streamError ? "box-none" : "none"}
        >
          <LinearGradient colors={["rgba(0,0,0,0.85)", "transparent"]} style={styles.topGradient} pointerEvents="box-none">
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-sharp" size={28} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>{title || "Loading..."}</Text>
              </View>
              
              {/* 🚀 FIXED LOCK BUTTON: Keeps HUD visible long enough to show lock animation */}
              <TouchableOpacity style={styles.headerIcon} onPress={() => { setIsLocked(true); setShowControls(true); }}>
                <Feather name="unlock" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.centerControls} pointerEvents="box-none">
            <View style={styles.centerRow}>
              <TouchableOpacity style={styles.seekButton} onPress={() => handleSeek("rewind")}>
                <View style={styles.seekIconContainer}>
                  <Feather name="rotate-ccw" size={42} color="#fff" />
                  <Text style={styles.seekIconText}>10</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
                <Ionicons name={isPlaying ? "pause-sharp" : "play-sharp"} size={68} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.seekButton} onPress={() => handleSeek("forward")}>
                <View style={styles.seekIconContainer}>
                  <Feather name="rotate-cw" size={42} color="#fff" />
                  <Text style={styles.seekIconText}>10</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <LinearGradient colors={["transparent", "rgba(0,0,0,0.95)"]} style={styles.bottomGradient} pointerEvents="box-none">
            <View style={styles.progressRow}>
              <Text style={styles.timeTextLeft}>{formatTime(currentTime)}</Text>
              <View 
                style={styles.progressBarWrapper}
                onLayout={(e) => (progressBarWidth.current = e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => { setIsDraggingProgress(true); handleProgressMove(e); }}
                onResponderMove={handleProgressMove}
                onResponderRelease={(e) => { handleProgressRelease(e); setIsDraggingProgress(false); }}
              >
                <View style={styles.progressBarBg} pointerEvents="none">
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} pointerEvents="none" />
                </View>
                <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} pointerEvents="none" />
              </View>
              <Text style={styles.timeTextRight}>{formatTime(remainingTime)}</Text>
            </View>

            <View style={styles.bottomTools}>
              <TouchableOpacity style={styles.toolButton} onPress={() => setActiveModal("server")}>
                <Ionicons name="server-outline" size={20} color="#fff" />
                <Text style={styles.toolText}>Server</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolButton} onPress={() => setActiveModal("speed")}>
                <Ionicons name="speedometer-outline" size={20} color="#fff" />
                <Text style={styles.toolText}>Speed ({playbackRate}x)</Text>
              </TouchableOpacity>

              {isTV && (
                <TouchableOpacity style={styles.toolButton}>
                  <Ionicons name="albums-outline" size={20} color="#fff" />
                  <Text style={styles.toolText}>Episodes</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.toolButton} onPress={() => setActiveModal("audioSub")}>
                <Ionicons name="chatbox-outline" size={20} color="#fff" />
                <Text style={styles.toolText}>Audio & Subtitles</Text>
              </TouchableOpacity>

              {isTV && (
                <TouchableOpacity style={styles.toolButton}>
                  <Ionicons name="play-skip-forward-sharp" size={22} color="#fff" />
                  <Text style={styles.toolText}>Next Ep.</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* 🚀 FIXED LOCK OVERLAY: Stripped black background */}
      <Animated.View 
        style={[styles.lockedOverlay, { opacity: lockedControlsOpacity }]} 
        pointerEvents={showControls && isLocked && !isScraping && !streamError && !activeModal ? "box-none" : "none"}
      >
        <View style={styles.lockedBottomContainer}>
          <TouchableOpacity style={styles.unlockCircleButton} onPress={() => setIsLocked(false)}>
            <Feather name="lock" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.screenLockedText}>Screen Locked</Text>
          <Text style={styles.tapToUnlockText}>Tap to Unlock</Text>
        </View>
      </Animated.View>

      {isScraping && (
        <View style={styles.scrapingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#E50914" style={{ transform: [{ scale: 1.5 }], marginBottom: 20 }} />
          {title && <Text style={styles.scrapingTitle}>{title}</Text>}
        </View>
      )}

      {streamError && !isScraping && (
        <View style={styles.errorOverlay} pointerEvents="box-none">
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#E50914" style={styles.errorIcon} />
            <Text style={styles.errorTitle}>Whoops, something went wrong...</Text>
            <Text style={styles.errorText}>{streamError}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
              <Text style={styles.errorButtonText}>Back to Browse</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {seekFeedback && !isScraping && !streamError && (
        <View style={[styles.seekFeedback, seekFeedback.side === "left" ? styles.seekFeedbackLeft : styles.seekFeedbackRight]} pointerEvents="none">
          <Text style={styles.seekFeedbackText}>{seekFeedback.amount > 0 ? `+${seekFeedback.amount}` : `${seekFeedback.amount}`}</Text>
        </View>
      )}

      {indicator && !isLocked && !isScraping && !streamError && (
        <Animated.View style={[styles.gestureIndicator, { opacity: indicatorOpacity, left: indicator === "brightness" ? width * 0.08 : undefined, right: indicator === "volume" ? width * 0.08 : undefined }]} pointerEvents="none">
          <Feather name={indicator === "brightness" ? "sun" : volume === 0 ? "volume-x" : "volume-2"} size={20} color="#fff" />
          <View style={styles.gestureTrack}>
            <View style={[styles.gestureFill, { height: `${(indicator === "brightness" ? brightness : volume) * 100}%` }]} />
          </View>
        </Animated.View>
      )}

      <BottomToolsModal 
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        availableServers={availableServers}
        currentServerIndex={currentServerIndex}
        changeServer={changeServer}
        playbackRate={playbackRate}
        changeSpeed={changeSpeed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "#050505" },
  loadingSpinner: { position: "absolute", transform: [{ scale: 1.5 }] },
  scrapingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000", justifyContent: "center", alignItems: "center", zIndex: 50 },
  scrapingTitle: { color: "#808080", fontSize: 18, fontWeight: "600", letterSpacing: 0.5 },
  errorOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000", justifyContent: "center", alignItems: "center", zIndex: 60 },
  errorContainer: { maxWidth: 400, alignItems: "center", padding: 20 },
  errorIcon: { marginBottom: 16 },
  errorTitle: { color: "#fff", fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  errorText: { color: "#b3b3b3", fontSize: 15, fontWeight: "400", textAlign: "center", lineHeight: 22, marginBottom: 12 },
  errorButton: { backgroundColor: "#fff", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 4 },
  errorButtonText: { color: "#000", fontSize: 16, fontWeight: "700" },
  seekFeedback: { position: "absolute", top: "50%", marginTop: -40 },
  seekFeedbackLeft: { left: "15%" },
  seekFeedbackRight: { right: "15%" },
  seekFeedbackText: { color: "rgba(255, 255, 255, 0.9)", fontSize: 32, fontWeight: "300" },
  gestureIndicator: { position: "absolute", top: "50%", marginTop: -60, width: 38, height: 120, alignItems: "center", justifyContent: "center" },
  gestureTrack: { width: 2, flex: 1, marginTop: 10, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 1, overflow: "hidden", justifyContent: "flex-end" },
  gestureFill: { width: "100%", backgroundColor: "#fff" },
  topGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 120 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Platform.OS === "ios" ? 45 : 25, paddingTop: 25 },
  headerTitleContainer: { position: "absolute", left: 0, right: 0, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  headerIcon: { padding: 10, zIndex: 10 },
  centerControls: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  centerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 80 },
  seekButton: { alignItems: "center", justifyContent: "center", width: 80 },
  seekIconContainer: { alignItems: "center", justifyContent: "center" },
  seekIconText: { position: "absolute", color: "#fff", fontSize: 12, fontWeight: "800" },
  playPauseButton: { alignItems: "center", justifyContent: "center", width: 120 },
  bottomGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 180, justifyContent: "flex-end", paddingBottom: 30 },
  progressRow: { flexDirection: "row", alignItems: "center", marginHorizontal: Platform.OS === "ios" ? 45 : 25, marginBottom: 25 },
  progressBarWrapper: { flex: 1, height: 30, justifyContent: "center" },
  progressBarBg: { height: 3, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2 },
  progressBarFill: { height: "100%", backgroundColor: "#E50914", borderRadius: 2 },
  progressThumb: { position: "absolute", width: 16, height: 16, backgroundColor: "#E50914", borderRadius: 8, transform: [{ translateX: -8 }] },
  timeTextLeft: { color: "#ccc", fontSize: 12, fontWeight: "600", marginRight: 16, fontVariant: ["tabular-nums"] },
  timeTextRight: { color: "#ccc", fontSize: 12, fontWeight: "600", marginLeft: 16, fontVariant: ["tabular-nums"] },
  bottomTools: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 40, marginHorizontal: Platform.OS === "ios" ? 45 : 25 },
  toolButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  toolText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // 🚀 FIXED LOCK OVERLAY UI
  lockedOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", alignItems: "center", paddingBottom: 45 },
  lockedBottomContainer: { alignItems: "center" },
  unlockCircleButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  screenLockedText: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 2 },
  tapToUnlockText: { color: "#999", fontSize: 11, fontWeight: "500" },
});