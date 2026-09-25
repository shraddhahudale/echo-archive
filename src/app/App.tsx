import { useEffect, useRef, useState } from "react";
import { ArchiveErrorBoundary } from "../components/ArchiveErrorBoundary";
import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { MiniPlayer, miniPlayerBottomGap } from "../components/MiniPlayer";
import { PhoneFrame } from "../components/PhoneFrame";
import { StatusBar } from "../components/StatusBar";
import { TabBar, tabBarHeight, type TabId } from "../components/TabBar";
import { Archive } from "../screens/Archive";
import { Breath } from "../screens/Breath/index";
import { Home } from "../screens/Home";
import { Timeline } from "../screens/Timeline";
import { Wrapped } from "../screens/Wrapped";
import { SheetHost } from "../sheets/SheetHost";
import { useArchiveStore } from "../store/useArchiveStore";

let stoneIntroStartedAt = 0;

export function App() {
  const [tab, setTab] = useState<TabId>("home");
  const connectStone = useArchiveStore((state) => state.connectStone);
  const wrappedOpen = useArchiveStore((state) => state.wrappedOpen);
  const requestTab = useArchiveStore((state) => state.requestTab);
  const clearRequestTab = useArchiveStore((state) => state.clearRequestTab);
  const resetArchiveScreen = useArchiveStore((state) => state.resetArchiveScreen);
  const resetHomeScreen = useArchiveStore((state) => state.resetHomeScreen);
  const nowPlaying = useArchiveStore((state) => state.nowPlaying);
  const playing = useArchiveStore((state) => state.playing);
  const togglePlay = useArchiveStore((state) => state.togglePlay);
  const skipTrack = useArchiveStore((state) => state.skipTrack);
  const openSongDetails = useArchiveStore((state) => state.openSongDetails);
  const isBreath = tab === "breath";
  const showMiniPlayer = !isBreath && !wrappedOpen;

  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);
  const playingId = nowPlaying.id;
  const durationSec = nowPlaying.durationSec;

  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
  }, [playingId]);

  useEffect(() => {
    if (useArchiveStore.getState().stoneConnected) return;
    if (!stoneIntroStartedAt) stoneIntroStartedAt = Date.now();
    const remaining = Math.max(0, 2000 - (Date.now() - stoneIntroStartedAt));
    const id = window.setTimeout(connectStone, remaining);
    return () => window.clearTimeout(id);
  }, [connectStone]);

  useEffect(() => {
    if (!requestTab) return;
    setTab(requestTab);
    clearRequestTab();
  }, [requestTab, clearRequestTab]);

  useEffect(() => {
    if (!playing || !showMiniPlayer) return;
    let raf = 0;
    let last = performance.now();
    let lastCommit = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (dt > 0) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= durationSec) {
          elapsedRef.current = 0;
          setProgress(0);
          useArchiveStore.setState({ elapsedSec: 0 });
          useArchiveStore.getState().skipTrack();
          return;
        }
        if (now - lastCommit >= 250) {
          lastCommit = now;
          const next = elapsedRef.current;
          setProgress(durationSec > 0 ? next / durationSec : 0);
          useArchiveStore.setState({ elapsedSec: next });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, showMiniPlayer, playingId, durationSec]);

  function changeTab(next: TabId) {
    if (tab === "archive" && next !== "archive") resetArchiveScreen();
    if (tab === "home" && next !== "home") resetHomeScreen();
    setTab(next);
  }

  const songId = nowPlaying.songId;

  return (
    <AppErrorBoundary>
      <PhoneFrame>
        <div className="relative flex h-full flex-col">
          <StatusBar tone={isBreath ? "light" : "dark"} />
          {!isBreath && (
            <>
              <main className="min-h-0 flex-1 overflow-hidden" data-screen={tab}>
                {tab === "home" && <Home />}
                {tab === "timeline" && <Timeline />}
                {tab === "archive" && (
                  <ArchiveErrorBoundary
                    onBack={() => {
                      resetArchiveScreen();
                      changeTab("home");
                    }}
                  >
                    <Archive />
                  </ArchiveErrorBoundary>
                )}
              </main>
              {showMiniPlayer ? (
                <div className="absolute inset-x-5 z-10" style={{ bottom: tabBarHeight + miniPlayerBottomGap }}>
                  <MiniPlayer
                    item={nowPlaying}
                    playing={playing}
                    progress={progress}
                    onTogglePlay={togglePlay}
                    onSkip={skipTrack}
                    onAdd={nowPlaying.kind === "song" && songId ? () => openSongDetails(songId) : undefined}
                  />
                </div>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 z-10">
                <TabBar active={tab} onChange={changeTab} />
              </div>
            </>
          )}
          {isBreath && <Breath onBackHome={() => changeTab("home")} />}
          <SheetHost />
          {wrappedOpen ? <Wrapped /> : null}
        </div>
      </PhoneFrame>
    </AppErrorBoundary>
  );
}
