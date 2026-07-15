import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface AudioTrack { id: string; label: string; }
interface SubtitleTrack { id: string; label: string; }

interface BottomToolsModalProps {
  activeModal: "server" | "speed" | "audioSub" | null;
  setActiveModal: (modal: "server" | "speed" | "audioSub" | null) => void;
  availableServers: any[];
  currentServerIndex: number;
  changeServer: (index: number) => void;
  playbackRate: number;
  changeSpeed: (rate: number) => void;
  audioTracks?: AudioTrack[];
  selectedAudioId?: string;
  subtitleTracks?: SubtitleTrack[];
  selectedSubtitleId?: string;
  onApplyAudioSubtitle?: (audioId: string, subtitleId: string) => void;
}

const SERVER_ALIASES = [
  "Tsushima Relay", "Aqua Node", "Godot Stream", "Redstone Cache", 
  "Krita Proxy", "Ronin Link", "Known Node", "Ender Relay",
];

const SPEED_MARKS = [0.5, 0.75, 1, 1.25, 1.5];
const SPEED_MIN = 0.5;
const SPEED_MAX = 1.5;

function snapToNearestMark(value: number) {
  return SPEED_MARKS.reduce((closest, mark) =>
    Math.abs(mark - value) < Math.abs(closest - value) ? mark : closest
  );
}

export default function BottomToolsModal({
  activeModal,
  setActiveModal,
  availableServers,
  currentServerIndex,
  changeServer,
  playbackRate,
  changeSpeed,
  audioTracks = [],
  selectedAudioId,
  subtitleTracks = [],
  selectedSubtitleId,
  onApplyAudioSubtitle,
}: BottomToolsModalProps) {
  const { width } = useWindowDimensions();
  const sliderWidth = Math.min(width * 0.5, 460);

  const [draftServerIndex, setDraftServerIndex] = useState(currentServerIndex);
  const [draftAudio, setDraftAudio] = useState(selectedAudioId || audioTracks[0]?.id || "");
  const [draftSubtitle, setDraftSubtitle] = useState(selectedSubtitleId || subtitleTracks[0]?.id || "");

  useEffect(() => {
    if (activeModal) {
      setDraftServerIndex(currentServerIndex);
      setDraftAudio(selectedAudioId || audioTracks[0]?.id || "");
      setDraftSubtitle(selectedSubtitleId || subtitleTracks[0]?.id || "");
    }
  }, [activeModal, currentServerIndex, selectedAudioId, selectedSubtitleId, audioTracks, subtitleTracks]);

  // 🚀 UNIFIED APPLY LOGIC
  function handleUnifiedApply() {
    if (activeModal === "server") {
      changeServer(draftServerIndex);
    } else if (activeModal === "audioSub") {
      onApplyAudioSubtitle?.(draftAudio, draftSubtitle);
    }
    setActiveModal(null);
  }

  // Speed Slider Math
  const normalFraction = (1 - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
  const valueFraction = (playbackRate - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
  const sliderStartX = useRef(0);

  const sliderWidthRef = useRef(0);
  const progressPercent = ((playbackRate - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100;

  function handleSpeedMove(evt: any) {
    if (sliderWidthRef.current === 0) return;
    const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, sliderWidthRef.current));
    const frac = touchX / sliderWidthRef.current;
    const rawValue = SPEED_MIN + frac * (SPEED_MAX - SPEED_MIN);
    changeSpeed(snapToNearestMark(rawValue));
  }

  if (!activeModal) return null;

  return (
    <Modal
      visible={activeModal !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setActiveModal(null)}
      statusBarTranslucent={true} 
    >
      {/* =======================
          SPEED TOOL
          ======================= */}
      {activeModal === "speed" && (
        <View style={styles.speedFullscreenOverlay}>
          <TouchableOpacity 
            style={styles.speedTransparentTop} 
            activeOpacity={1} 
            onPress={() => setActiveModal(null)} 
          />
          <View style={styles.speedBottomContainer}>
            <View style={styles.speedWrap}>
              <View 
                style={[styles.sliderTouchArea, { width: sliderWidth }]}
                onLayout={(e) => (sliderWidthRef.current = e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={handleSpeedMove}
                onResponderMove={handleSpeedMove}
                onResponderRelease={handleSpeedMove}
              >
                <View style={styles.sliderTrackBg} pointerEvents="none">
                  <View style={[styles.sliderTrackFill, { width: `${progressPercent}%` }]} />
                </View>
                <View style={[styles.sliderThickHandle, { left: `${progressPercent}%` }]} pointerEvents="none" />
              </View>

              <View style={[styles.sliderLabels, { width: sliderWidth }]} pointerEvents="box-none">
                {SPEED_MARKS.map((mark) => (
                  <TouchableOpacity 
                    key={mark} 
                    style={styles.sliderLabelCol}
                    onPress={() => changeSpeed(mark)}
                  >
                    <Text style={[styles.sliderLabelText, mark === playbackRate && styles.sliderLabelTextBold]}>
                      {mark}x
                    </Text>
                    {mark === 1 && <Text style={styles.sliderNormalText}>Normal</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* =======================
          SERVER / AUDIO & SUB
          ======================= */}
      {(activeModal === "server" || activeModal === "audioSub") && (
        <View style={styles.solidBlackout}>
          
          {/* Main Grid Wrapper */}
          <View style={styles.centerContainer}>
            
            {/* Dynamic Content Area (Fills space above buttons) */}
            <View style={styles.contentBlock}>
              
              {/* SERVER UI */}
              {activeModal === "server" && (
                <>
                  <Text style={styles.mainHeader}>Select Server</Text>
                  <View style={styles.serverListWrap}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
                      {availableServers.map((server, index) => {
                        const alias = SERVER_ALIASES[index % SERVER_ALIASES.length];
                        const isActive = draftServerIndex === index;
                        return (
                          <TouchableOpacity key={index} style={styles.checkRow} onPress={() => setDraftServerIndex(index)}>
                            <View style={styles.checkIconWrap}>
                              {isActive && <Feather name="check" size={24} color="#fff" />}
                            </View>
                            <Text style={[styles.checkLabel, isActive && styles.checkLabelActive]}>
                              {alias} {server.quality ? `[${server.quality}]` : ""}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      {availableServers.length === 0 && (
                        <Text style={[styles.checkLabel, { marginLeft: 44 }]}>No alternative servers available.</Text>
                      )}
                    </ScrollView>
                  </View>
                </>
              )}

              {/* AUDIO & SUBTITLES UI */}
              {activeModal === "audioSub" && (
                <View style={styles.twoColumnGrid}>
                  
                  {/* Left Audio Column */}
                  <View style={styles.column}>
                    <Text style={styles.columnHeader}>Audio</Text>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
                      {audioTracks.length > 0 ? audioTracks.map((track) => {
                        const isActive = track.id === draftAudio;
                        return (
                          <TouchableOpacity key={track.id} style={styles.checkRow} onPress={() => setDraftAudio(track.id)}>
                            <View style={styles.checkIconWrap}>
                              {isActive && <Feather name="check" size={24} color="#fff" />}
                            </View>
                            <Text style={[styles.checkLabel, isActive && styles.checkLabelActive]}>{track.label}</Text>
                          </TouchableOpacity>
                        );
                      }) : (
                        <Text style={[styles.checkLabel, { marginLeft: 44, marginTop: 10, fontStyle: 'italic' }]}>Default Audio</Text>
                      )}
                    </ScrollView>
                  </View>

                  {/* Right Subtitle Column */}
                  <View style={styles.column}>
                    <Text style={styles.columnHeader}>Subtitles</Text>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
                      {subtitleTracks.length > 0 ? subtitleTracks.map((track) => {
                        const isActive = track.id === draftSubtitle;
                        return (
                          <TouchableOpacity key={track.id} style={styles.checkRow} onPress={() => setDraftSubtitle(track.id)}>
                            <View style={styles.checkIconWrap}>
                              {isActive && <Feather name="check" size={24} color="#fff" />}
                            </View>
                            <Text style={[styles.checkLabel, isActive && styles.checkLabelActive]}>{track.label}</Text>
                          </TouchableOpacity>
                        );
                      }) : (
                        <Text style={[styles.checkLabel, { marginLeft: 44, marginTop: 10, fontStyle: 'italic' }]}>No subtitles available</Text>
                      )}
                    </ScrollView>
                  </View>
                  
                </View>
              )}
            </View>

            {/* 🚀 UNIFIED, STATIC ACTION BUTTONS */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleUnifiedApply}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      )}

    </Modal>
  );
}

const styles = StyleSheet.create({
  // === SPEED UI ===
  speedFullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  speedTransparentTop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  speedBottomContainer: {
    height: 180,
    backgroundColor: "rgba(0,0,0,0.85)", 
    justifyContent: "center",
    paddingBottom: 20,
  },
  speedWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTouchArea: {
    height: 40, 
    justifyContent: "center",
  },
  sliderTrackBg: {
    height: 6,
    backgroundColor: "#666",
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden", 
  },
  sliderTrackFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  sliderThickHandle: {
    position: "absolute",
    width: 6,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 2,
    transform: [{ translateX: -3 }],
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sliderLabelCol: {
    alignItems: "center",
    width: 60,
  },
  sliderLabelText: {
    color: "#b3b3b3",
    fontSize: 14,
    fontWeight: "500",
  },
  sliderLabelTextBold: {
    color: "#fff",
    fontWeight: "700",
  },
  sliderNormalText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },

  // === SERVER & AUDIO UI (Solid Black) ===
  solidBlackout: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    width: "85%",
    maxWidth: 900,
    height: "80%", // Fixed layout box
    position: "relative", // Required to anchor the buttons at the bottom
  },
  contentBlock: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 70, // Leaves exact space so scroll items don't hide behind buttons
  },
  mainHeader: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
  },
  serverListWrap: {
    width: 400,
    alignSelf: "center",
    flex: 1, // Allows it to scale naturally and scroll if needed
  },
  twoColumnGrid: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    flex: 1,
    gap: 40,
  },
  column: {
    flex: 1,
    maxWidth: 400,
  },
  columnHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    marginLeft: 44, 
  },
  scrollPadding: {
    paddingBottom: 20, // Final bit of padding inside the scrollview
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  checkIconWrap: {
    width: 44,
    alignItems: "flex-start",
  },
  checkLabel: {
    color: "#808080",
    fontSize: 18,
    fontWeight: "500",
  },
  checkLabelActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // 🚀 FIXED ACTION BUTTONS
  actionButtonsRow: {
    position: "absolute",
    bottom: 0,
    right: "5%",
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  applyBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  applyBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});