import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

interface BottomToolsModalProps {
  activeModal: "server" | "speed" | "audioSub" | null;
  setActiveModal: (modal: "server" | "speed" | "audioSub" | null) => void;
  availableServers: any[];
  currentServerIndex: number;
  changeServer: (index: number) => void;
  playbackRate: number;
  changeSpeed: (rate: number) => void;
}

export default function BottomToolsModal({
  activeModal,
  setActiveModal,
  availableServers,
  currentServerIndex,
  changeServer,
  playbackRate,
  changeSpeed,
} : BottomToolsModalProps) {
  return (
    <Modal
      visible={activeModal !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalDismissArea} onPress={() => setActiveModal(null)} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeModal === "server" && "Select Server"}
              {activeModal === "speed" && "Playback Speed"}
              {activeModal === "audioSub" && "Audio & Subtitles"}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {activeModal === "server" && (
            <ScrollView style={styles.modalScroll}>
              {availableServers.map((server, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalOptionRow}
                  onPress={() => changeServer(index)}
                >
                  <Text style={[styles.modalOptionText, currentServerIndex === index && styles.modalOptionActive]}>
                    {server.provider?.name || `Server ${index + 1}`} ({server.quality || 'Auto'})
                  </Text>
                  {currentServerIndex === index && <Feather name="check" size={20} color="#E50914" />}
                </TouchableOpacity>
              ))}
              {availableServers.length === 0 && (
                <Text style={styles.modalOptionText}>No alternative servers available.</Text>
              )}
            </ScrollView>
          )}

          {activeModal === "speed" && (
            <ScrollView style={styles.modalScroll}>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={styles.modalOptionRow}
                  onPress={() => changeSpeed(rate)}
                >
                  <Text style={[styles.modalOptionText, playbackRate === rate && styles.modalOptionActive]}>
                    {rate === 1 ? "Normal (1x)" : `${rate}x`}
                  </Text>
                  {playbackRate === rate && <Feather name="check" size={20} color="#E50914" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {activeModal === "audioSub" && (
            <View style={styles.modalScroll}>
              <Text style={[styles.modalOptionText, { textAlign: 'center', opacity: 0.7, marginTop: 20 }]}>
                Subtitles embedded in the stream are managed natively. Custom file selection UI coming soon.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, flexDirection: "row" },
  modalDismissArea: { flex: 1, backgroundColor: "transparent" },
  modalContent: {
    width: 300,
    backgroundColor: "rgba(20,20,20,0.95)",
    borderLeftWidth: 1,
    borderColor: "#333",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalScroll: { flex: 1 },
  modalOptionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  modalOptionText: { color: "#ccc", fontSize: 15, fontWeight: "500" },
  modalOptionActive: { color: "#E50914", fontWeight: "700" },
});