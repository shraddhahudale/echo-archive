type PlaceholderScreenProps = {
  label: string;
};

export function PlaceholderScreen({ label }: PlaceholderScreenProps) {
  return (
    <section className="flex h-full items-center justify-center px-5" aria-label={label}>
      <p className="text-[15px] leading-5 font-normal text-[var(--text-400)]">Coming soon</p>
    </section>
  );
}
