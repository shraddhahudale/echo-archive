type AddSongSheetProps = {
  titleId: string;
};

export function AddSongSheet({ titleId }: AddSongSheetProps) {
  return (
    <div className="px-5 pb-8">
      <h2 id={titleId} className="text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
        Add a song
      </h2>
    </div>
  );
}
