type VoiceNoteSheetProps = {
  titleId: string;
};

export function VoiceNoteSheet({ titleId }: VoiceNoteSheetProps) {
  return (
    <div className="px-5 pb-8">
      <h2 id={titleId} className="text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
        Recording a voice note
      </h2>
    </div>
  );
}
