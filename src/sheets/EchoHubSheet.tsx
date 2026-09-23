type EchoHubSheetProps = {
  titleId: string;
};

export function EchoHubSheet({ titleId }: EchoHubSheetProps) {
  return (
    <div className="px-5 pb-8">
      <h2 id={titleId} className="text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
        Add an echo
      </h2>
      <p className="mt-2 text-[15px] leading-5 text-[var(--text-400)]">
        Let the people close to you leave something for this week.
      </p>
    </div>
  );
}
