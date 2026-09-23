import { useRef } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { useArchiveStore, type SheetId } from "../store/useArchiveStore";
import { AddSongSheet } from "./AddSongSheet";
import { EchoHubSheet } from "./EchoHubSheet";
import { RecordChoiceSheet } from "./RecordChoiceSheet";
import { VoiceNoteSheet } from "./VoiceNoteSheet";

const titleIds: Record<SheetId, string> = {
  choice: "record-choice-title",
  voice: "voice-sheet-title",
  song: "song-sheet-title",
  echo: "echo-sheet-title",
};

export function SheetHost() {
  const sheet = useArchiveStore((state) => state.sheet);
  const openSheet = useArchiveStore((state) => state.openSheet);
  const closeSheet = useArchiveStore((state) => state.closeSheet);
  const last = useRef<SheetId | null>(null);
  if (sheet) last.current = sheet;
  const shown = sheet ?? last.current;

  return (
    <BottomSheet open={sheet !== null} onClose={closeSheet} labelledBy={shown ? titleIds[shown] : undefined}>
      {shown === "choice" ? (
        <RecordChoiceSheet
          titleId={titleIds.choice}
          onVoice={() => openSheet("voice")}
          onSong={() => openSheet("song")}
          onEcho={() => openSheet("echo")}
        />
      ) : null}
      {shown === "voice" ? <VoiceNoteSheet titleId={titleIds.voice} /> : null}
      {shown === "song" ? <AddSongSheet titleId={titleIds.song} /> : null}
      {shown === "echo" ? <EchoHubSheet titleId={titleIds.echo} /> : null}
    </BottomSheet>
  );
}
