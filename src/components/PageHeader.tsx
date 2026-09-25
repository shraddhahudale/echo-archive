import type { ReactNode } from "react";
import { Display } from "./Display";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Optional right slot (e.g. Home avatar), vertically centred on the header block. */
  right?: ReactNode;
};

/**
 * Shared page header for Home, Timeline and Archive.
 * 32px below the status bar · 4px to title · 6px to subtitle · 24px before content.
 */
export function PageHeader({ eyebrow, title, subtitle, right }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-3 pt-8">
      <div className="min-w-0">
        <p className="text-[15px] leading-5 font-normal text-[var(--text-400)]">{eyebrow}</p>
        <Display as="h1" size={34} className="mt-1">
          {title}
        </Display>
        <p className="mt-1.5 text-[15px] leading-5 font-medium text-[var(--text-400)]">{subtitle}</p>
      </div>
      {right ? <div className="shrink-0 self-center">{right}</div> : null}
    </header>
  );
}
