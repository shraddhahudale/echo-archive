import { Archive, Clock, Heart, House, type LucideIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";

export const tabs = [
  { id: "home", label: "Home", icon: House },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "breath", label: "Breath", icon: Heart },
] as const;

export type TabId = (typeof tabs)[number]["id"];

export const tabBarHeight = 83;

type TabBarProps = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export function TabBar({ active, onChange }: TabBarProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const nextIndex =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;

    if (nextIndex === null) return;

    event.preventDefault();
    const next = tabs[nextIndex];
    onChange(next.id);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  }

  return (
    <nav className="shrink-0 bg-[var(--bg)]" aria-label="Primary">
      <div
        ref={listRef}
        role="tablist"
        className="flex border-t border-[var(--line)]"
      >
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            selected={tab.id === active}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          />
        ))}
      </div>
      <div className="flex h-[34px] items-end justify-center pb-2" aria-hidden="true">
        <div className="h-[5px] w-[134px] rounded-[var(--radius-pill)] bg-[var(--text-900)]" />
      </div>
    </nav>
  );
}

type TabButtonProps = {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  tabIndex: number;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

function TabButton({ icon: Icon, label, selected, tabIndex, onClick, onKeyDown }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="flex h-[49px] min-h-11 min-w-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent focus-visible:outline-offset-[-2px]"
      style={{ color: selected ? "var(--text-900)" : "var(--text-400)" }}
    >
      <Icon size={22} strokeWidth={1.75} />
      <span className="text-[11px] leading-[14px] font-medium">{label}</span>
    </button>
  );
}
