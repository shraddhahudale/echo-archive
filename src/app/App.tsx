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
import { Onboarding, type OnboardingResult } from "../screens/Onboarding";
import { Timeline } from "../screens/Timeline";
import { Wrapped } from "../screens/Wrapped";
import { SheetHost } from "../sheets/SheetHost";
import { useArchiveStore } from "../store/useArchiveStore";

let stoneIntroStartedAt = 0;

export function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [onboarding, setOnboarding] = useState(true);
  const [onboardingKey, setOnboardingKey] = useState(0);
  const [revealHome, setRevealHome] = useState(false);
  const [guideOrb, setGuideOrb] = useState(false);
  const [homeEntrance, setHomeEntrance] = useState(false);
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
  const showMain = !isBreath && revealHome;
  const showChrome = showMain && !wrappedOpen;
  const showMiniPlayer = showChrome;

  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);
  const playingId = nowPlaying.id;
  const durationSec = nowPlaying.durationSec;

  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
  }, [playingId]);

  // Stone 2s intro — only after onboarding, and only if still disconnected
  useEffect(() => {
    if (onboarding) return;
    if (useArchiveStore.getState().stoneConnected) return;
    if (!stoneIntroStartedAt) stoneIntroStartedAt = Date.now();
    const remaining = Math.max(0, 2000 - (Date.now() - stoneIntroStartedAt));
    const id = window.setTimeout(connectStone, remaining);
    return () => window.clearTimeout(id);
  }, [connectStone, onboarding]);

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

  function handleOnboardingComplete(result: OnboardingResult) {
    if (result.stoneConnected) {
      connectStone();
    } else {
      stoneIntroStartedAt = 0;
      useArchiveStore.setState({ stoneConnected: false });
    }
    setGuideOrb(true);
    setHomeEntrance(true);
    setTab("home");
    resetHomeScreen();
    setRevealHome(true);
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 400;
    window.setTimeout(() => {
      setOnboarding(false);
      setHomeEntrance(false);
    }, ms);
  }

  function replayWalkthrough() {
    useArchiveStore.setState({ stoneConnected: false });
    stoneIntroStartedAt = 0;
    setGuideOrb(false);
    setHomeEntrance(false);
    setRevealHome(false);
    setOnboardingKey((n) => n + 1);
    setOnboarding(true);
  }

  const songId = nowPlaying.songId;

  return (
    <AppErrorBoundary>
      <PhoneFrame>
        <div className="relative flex h-full flex-col">
          <StatusBar tone={isBreath || onboarding ? "light" : "dark"} />
          {showMain && (
            <>
              <main className="min-h-0 flex-1 overflow-hidden" data-screen={tab}>
                {tab === "home" && (
                  <Home
                    guideOrb={guideOrb}
                    onGuideDismiss={() => setGuideOrb(false)}
                    onReplayWalkthrough={replayWalkthrough}
                    entranceFade={homeEntrance}
                  />
                )}
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
              {showChrome ? (
                <div className="absolute inset-x-0 bottom-0 z-10">
                  <TabBar active={tab} onChange={changeTab} />
                </div>
              ) : null}
            </>
          )}
          {isBreath && <Breath onBackHome={() => changeTab("home")} />}
          <SheetHost />
          {wrappedOpen ? <Wrapped /> : null}
          {onboarding ? (
            <Onboarding key={onboardingKey} onComplete={handleOnboardingComplete} />
          ) : null}
        </div>
      </PhoneFrame>
    </AppErrorBoundary>
  );
}
