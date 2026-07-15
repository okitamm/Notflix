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
import { Ionicons } from "@expo/vector-icons";

interface AudioTrack {
  id: string;
  label: string;
}

interface SubtitleTrack {
  id: string;
  label: string;
}

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
  "Tsushima Relay",
  "Aqua Node",
  "Godot Stream",
  "Redstone Cache",
  "Krita Proxy",
  "Ronin Link",
  "Known Node",
  "Ender Relay",
];

const SPEED_MARKS = [0.5, 0.75, 1, 1.25, 1.5];
const SPEED_MIN = 0.5;
const SPEED_MAX = 1.5;

const DEFAULT_AUDIO: AudioTrack[] = [
  { id: "en", label: "English [Original]" },
  { id: "fil", label: "Filipino" },
  { id: "cmn", label: "Mandarin (Guoyu)" },
  { id: "ja", label: "Japanese" },
];

const DEFAULT_SUBTITLES: SubtitleTrack[] = [
  { id: "off", label: "Off" },
  { id: "en-cc", label: "English (CC)" },
  { id: "en", label: "English" },
  { id: "fil", label: "Filipino" },
];

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
  audioTracks = DEFAULT_AUDIO,
  selectedAudioId,
  subtitleTracks = DEFAULT_SUBTITLES,
  selectedSubtitleId,
  onApplyAudioSubtitle,
}: BottomToolsModalProps) {
  const { width, height } = useWindowDimensions();
  const sliderWidth = Math.min(width * 0.5, 460);

  const [draftAudio, setDraftAudio] = useState(selectedAudioId || audioTracks[0]?.id);
  const [draftSubtitle, setDraftSubtitle] = useState(
    selectedSubtitleId || subtitleTracks[0]?.id
  );

  useEffect(() => {
    if (activeModal === "audioSub") {
      setDraftAudio(selectedAudioId || audioTracks[0]?.id);
      setDraftSubtitle(selectedSubtitleId || subtitleTracks[0]?.id);
    }
  }, [activeModal]);

  function handleApply() {
    onApplyAudioSubtitle?.(draftAudio, draftSubtitle);
    setActiveModal(null);
  }

  function handleCancel() {
    setActiveModal(null);
  }

  const normalFraction = (1 - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
  const valueFraction = (playbackRate - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
  const sliderStartX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const frac = Math.min(Math.max(x / sliderWidth, 0), 1);
        const rawValue = SPEED_MIN + frac * (SPEED_MAX - SPEED_MIN);
        changeSpeed(snapToNearestMark(rawValue));
      },

      onPanResponderMove: (_, gestureState) => {
        const x = Math.min(
          Math.max(gestureState.moveX - sliderStartX.current, 0),
          sliderWidth
        );
        const frac = x / sliderWidth;
        const rawValue = SPEED_MIN + frac * (SPEED_MAX - SPEED_MIN);
        changeSpeed(snapToNearestMark(rawValue));
      },
    })
  ).current;

  if (!activeModal) return null;

  return (
    <Modal
      visible={activeModal !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={[styles.fullScreen, { width, height }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>
            {activeModal === "server" && "Select Server"}
            {activeModal === "speed" && "Playback Speed"}
            {activeModal === "audioSub" && "Audio & Subtitles"}
          </Text>

          <TouchableOpacity
            onPress={() => setActiveModal(null)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* SERVER */}
          {activeModal === "server" && (
            <ScrollView
              style={styles.serverList}
              showsVerticalScrollIndicator={false}
            >
              {availableServers.map((server, index) => {
                const alias = SERVER_ALIASES[index % SERVER_ALIASES.length];
                const isActive = currentServerIndex === index;

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.checkRow}
                    onPress={() => changeServer(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.checkIconWrap}>
                      {isActive && (
                        <Ionicons name="checkmark" size={22} color="#fff" />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.checkLabel,
                        isActive && styles.checkLabelActive,
                      ]}
                    >
                      {alias}
                      {server.quality ? `  ·  ${server.quality}` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {availableServers.length === 0 && (
                <View style={styles.emptyStateWrap}>
                  <Ionicons name="server-outline" size={28} color="#3d3d3d" />
                  <Text style={styles.emptyText}>
                    No alternative servers available.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* SPEED */}
          {activeModal === "speed" && (
            <View style={styles.speedWrap}>
              <View
                style={[styles.sliderTrack, { width: sliderWidth }]}
                onLayout={(e) => {
                  e.currentTarget.measure((fx, fy, w, h, px) => {
                    sliderStartX.current = px;
                  });
                }}
                {...panResponder.panHandlers}
              >
                <View
                  style={[
                    styles.sliderWhiteSegment,
                    { width: sliderWidth * normalFraction },
                  ]}
                />
                <View
                  style={[
                    styles.sliderGraySegment,
                    { width: sliderWidth * (1 - normalFraction) },
                  ]}
                />

                <View
                  style={[
                    styles.normalTick,
                    { left: sliderWidth * normalFraction - 1 },
                  ]}
                />

                <View
                  style={[
                    styles.sliderHandle,
                    { left: sliderWidth * valueFraction - 9 },
                  ]}
                  pointerEvents="none"
                />
              </View>

              <View style={[styles.sliderLabels, { width: sliderWidth }]}>
                {SPEED_MARKS.map((mark) => (
                  <View key={mark} style={styles.sliderLabelCol}>
                    <Text
                      style={[
                        styles.sliderLabelText,
                        mark === 1 && styles.sliderLabelTextBold,
                      ]}
                    >
                      {mark}x
                    </Text>
                    {mark === 1 && (
                      <Text style={styles.sliderNormalText}>Normal</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* AUDIO & SUBTITLES */}
          {activeModal === "audioSub" && (
            <View style={styles.audioSubWrap}>
              <View style={styles.columnsRow}>
                <View style={styles.column}>
                  <Text style={styles.columnHeader}>Audio</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {audioTracks.map((track) => {
                      const isActive = track.id === draftAudio;
                      return (
                        <TouchableOpacity
                          key={track.id}
                          style={styles.checkRow}
                          onPress={() => setDraftAudio(track.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.checkIconWrap}>
                            {isActive && (
                              <Ionicons name="checkmark" size={20} color="#fff" />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.checkLabelSmall,
                              isActive && styles.checkLabelActive,
                            ]}
                            numberOfLines={2}
                          >
                            {track.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.column}>
                  <Text style={styles.columnHeader}>Subtitles</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {subtitleTracks.map((track) => {
                      const isActive = track.id === draftSubtitle;
                      return (
                        <TouchableOpacity
                          key={track.id}
                          style={styles.checkRow}
                          onPress={() => setDraftSubtitle(track.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.checkIconWrap}>
                            {isActive && (
                              <Ionicons name="checkmark" size={20} color="#fff" />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.checkLabelSmall,
                              isActive && styles.checkLabelActive,
                            ]}
                            numberOfLines={2}
                          >
                            {track.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.footerButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    backgroundColor: "#000",
    position: "absolute",
    top: 0,
    left: 0,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 20,
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },

  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },

  // Server
  serverList: {
    maxHeight: "70%",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  checkIconWrap: {
    width: 28,
    alignItems: "center",
    marginRight: 14,
  },
  checkLabel: {
    color: "#808080",
    fontSize: 17,
    fontWeight: "500",
    flexShrink: 1,
  },
  checkLabelSmall: {
    color: "#808080",
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
  },
  checkLabelActive: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyStateWrap: {
    alignItems: "center",
    paddingVertical: 36,
    gap: 14,
  },
  emptyText: {
    color: "#808080",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  // Speed slider — full screen, centered
  speedWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    flexDirection: "row",
    position: "relative",
  },
  sliderWhiteSegment: {
    height: 6,
    backgroundColor: "#fff",
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  sliderGraySegment: {
    height: 6,
    backgroundColor: "#5c5c5c",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  normalTick: {
    position: "absolute",
    top: -8,
    width: 2,
    height: 22,
    backgroundColor: "#fff",
  },
  sliderHandle: {
    position: "absolute",
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },

  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  sliderLabelCol: {
    alignItems: "center",
    width: 50,
  },
  sliderLabelText: {
    color: "#808080",
    fontSize: 15,
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

  // Audio & Subtitles
  audioSubWrap: {
    flex: 1,
    justifyContent: "center",
  },
  columnsRow: {
    flexDirection: "row",
    maxHeight: "75%",
  },
  column: {
    flex: 1,
    paddingRight: 40,
  },
  columnHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },

  footerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#2a2a2a",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  applyButton: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  applyText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
});