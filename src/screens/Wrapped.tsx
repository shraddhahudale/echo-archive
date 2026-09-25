import { useEffect, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Display } from "../components/Display";
import { Eyebrow } from "../components/Eyebrow";
import {
  StoryBackgroundLayer,
  StoryMotionDots,
  StorySlide,
  StorySlideStatic,
  StoryStaticDots,
  StoryTopScrim,
  useStoryPager,
} from "../components/StoryShell";
import { useArchiveStore, wrappedStats } from "../store/useArchiveStore";

const TOTAL = 6;

type CardModel = {
  gradient: string;
  top: string;
  body: ReactNode;
};

export function Wrapped() {
  const index = useArchiveStore((state) => state.wrappedIndex);
  const setWrappedIndex = useArchiveStore((state) => state.setWrappedIndex);
  const closeWrapped = useArchiveStore((state) => state.closeWrapped);
  const songs = useArchiveStore((state) => state.songs);
  const contributors = useArchiveStore((state) => state.contributors);
  const stats = useMemo(() => wrappedStats(songs, contributors), [songs, contributors]);

  const cards: CardModel[] = useMemo(
    () => [
      {
        gradient: "linear-gradient(135deg, var(--wrap-anxious-from), var(--wrap-anxious-to))",
        top: "Through your second trimester",
        body: (
          <>
            <Display size={40} tone="light">
              {stats.mood}
            </Display>
            <p className="mt-3 text-[16px] leading-5 text-white/90">Mixed with happiness and excitement</p>
          </>
        ),
      },
      {
        gradient: "linear-gradient(135deg, var(--wrap-3am-from), var(--wrap-3am-to))",
        top: "In the quiet hours of night",
        body: (
          <>
            <Display size={40} tone="light">
              {stats.activeHour}
            </Display>
            <p className="mt-3 text-[16px] leading-5 text-white/90">is your most active hour</p>
          </>
        ),
      },
      {
        gradient: "linear-gradient(135deg, var(--wrap-holocene-from), var(--wrap-holocene-to))",
        top: "When one song said it all",
        body: (
          <>
            <Display size={40} tone="light">
              {stats.topSong.title}
            </Display>
            {stats.topSong.art ? (
              <img
                src={stats.topSong.art}
                alt=""
                className="mx-auto mt-4 size-14 rounded-[10px] object-cover shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
              />
            ) : null}
            <p className="mt-3 text-[16px] leading-5 text-white/90 italic">{stats.topSong.artist}</p>
          </>
        ),
      },
      {
        gradient: "linear-gradient(135deg, var(--wrap-times-from), var(--wrap-times-to))",
        top: "You've turned to music",
        body: (
          <>
            <Display size={40} tone="light">
              {stats.songMoments} times
            </Display>
            <p className="mt-3 text-[16px] leading-5 text-white/90">seeking comfort and release</p>
          </>
        ),
      },
      {
        gradient: "linear-gradient(135deg, var(--wrap-echo-from), var(--wrap-echo-to))",
        top: "The voices around you",
        body: (
          <>
            <Display size={40} tone="light">
              {stats.echoes.total} echoes
            </Display>
            <div className="mt-4 flex justify-center pl-2.5" aria-label="Contributors">
              {stats.echoes.people.map((person) => (
                <span
                  key={person.id}
                  title={person.name}
                  className="-ml-2.5 flex size-9 items-center justify-center rounded-full border-2 border-white bg-[var(--amber-50)] text-[14px] font-semibold text-[var(--amber-600)]"
                >
                  {person.name.trim().charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[16px] leading-5 text-white/90">from four people who love you</p>
          </>
        ),
      },
      {
        gradient: "linear-gradient(135deg, var(--wrap-shift-from), var(--wrap-shift-to))",
        top: "Your emotional journey",
        body: (
          <>
            <Display size={40} tone="light">
              {stats.journeyFrom} → {stats.journeyTo}
            </Display>
            <p className="mt-3 text-[16px] leading-5 text-white/90">the shift Echo noticed</p>
          </>
        ),
      },
    ],
    [stats],
  );

  const pager = useStoryPager({
    count: TOTAL,
    index,
    setIndex: setWrappedIndex,
    onPastEnd: closeWrapped,
    onSwipeDown: closeWrapped,
  });

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWrapped();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        pager.tryGo(1, "key");
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pager.tryGo(-1, "key");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (pager.reduce) {
    const card = cards[index];
    return (
      <div
        ref={pager.rootRef}
        role="dialog"
        aria-modal="true"
        aria-label="Echo T2 Insights"
        className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          pager.tryGo(event.clientX - bounds.left > bounds.width / 2 ? 1 : -1, "tap");
        }}
      >
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{ backgroundImage: card.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
        <StoryTopScrim />
        <CloseButton onClose={closeWrapped} />
        <Eyebrow absolute tone="strong">
          ECHO T2 INSIGHTS
        </Eyebrow>
        <StorySlideStatic
          top={<p className="text-[15px] leading-5 text-white/90">{card.top}</p>}
          body={card.body}
        />
        <StoryStaticDots active={index} count={TOTAL} />
      </div>
    );
  }

  return (
    <div
      ref={pager.rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Echo T2 Insights"
      className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
      onPointerDown={pager.onPointerDown}
      onPointerMove={pager.onPointerMove}
      onPointerUp={pager.onPointerUp}
      onPointerCancel={pager.onPointerCancel}
    >
      {cards.map((card, cardIndex) => (
        <StoryBackgroundLayer
          key={card.gradient}
          gradient={card.gradient}
          cardIndex={cardIndex}
          progress={pager.progress}
        />
      ))}

      <StoryTopScrim />
      <CloseButton onClose={closeWrapped} />
      <Eyebrow absolute tone="strong">
        ECHO T2 INSIGHTS
      </Eyebrow>

      <motion.div
        className="absolute inset-y-0 left-0 z-[2] flex"
        style={{ x: pager.trackX, width: Math.max(pager.width, 1) * TOTAL }}
      >
        {cards.map((card, cardIndex) => (
          <StorySlide
            key={card.top}
            cardIndex={cardIndex}
            width={pager.width || 390}
            trackX={pager.trackX}
            settled={pager.settledIndex === cardIndex}
            top={<p className="text-[15px] leading-5 text-white/90">{card.top}</p>}
            body={card.body}
          />
        ))}
      </motion.div>

      <StoryMotionDots progress={pager.progress} count={TOTAL} />
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close insights"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      className="absolute top-3 right-4 z-20 flex size-11 min-h-11 min-w-11 items-center justify-center border-0 bg-transparent p-0"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-white/25 text-white">
        <X size={16} strokeWidth={2.25} />
      </span>
    </button>
  );
}
