import { useState, type ReactNode } from "react";

type AlbumTileProps = {
  title: string;
  artist: string;
  art?: string;
  gradient: string;
  bordered?: boolean;
  size?: number;
  titleClassName?: string;
  artistClassName?: string;
  meta?: ReactNode;
  onSelect?: () => void;
};

export function AlbumTile({
  title,
  artist,
  art,
  gradient,
  bordered,
  size = 88,
  titleClassName,
  artistClassName,
  meta,
  onSelect,
}: AlbumTileProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(art) && !failed;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex shrink-0 cursor-pointer flex-col border-0 bg-transparent p-0 text-left transition-transform duration-100 motion-safe:active:scale-[0.96]"
      style={{ width: size }}
    >
      <span className="relative z-0 block" style={{ width: size, height: size }}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[12px] bg-cover bg-center"
          style={{
            backgroundImage: showImage ? `url("${art}")` : gradient,
            filter: "blur(14px)",
            opacity: 0.45,
            transform: "translateY(8px) scale(0.9)",
            zIndex: 0,
          }}
        />
        <span
          className="relative z-[1] block overflow-hidden rounded-[12px] bg-cover bg-center"
          style={{
            width: size,
            height: size,
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
            border: bordered ? "1px solid rgba(0, 0, 0, 0.08)" : undefined,
            backgroundImage: showImage ? undefined : gradient,
            backgroundColor: "var(--purple-100)",
          }}
        >
          {showImage ? (
            <img
              src={art}
              alt=""
              draggable={false}
              className="size-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : null}
        </span>
      </span>
      <span
        className={
          titleClassName ??
          "relative z-[1] mt-2 block truncate text-[13px] leading-4 font-semibold text-[var(--text-900)]"
        }
      >
        {title}
      </span>
      <span
        className={
          artistClassName ?? "relative z-[1] block truncate text-[12px] leading-4 text-[var(--text-400)]"
        }
      >
        {artist}
      </span>
      {meta}
    </button>
  );
}
