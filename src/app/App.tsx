import { useEffect, useState } from "react";
import { ArchiveErrorBoundary } from "../components/ArchiveErrorBoundary";
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
import { selectCurrentTrack, useArchiveStore } from "../store/useArchiveStore";

let stoneIntroStartedAt = 0;

export function App() {
  const [tab, setTab] = useState<TabId>("home");
  const connectStone = useArchiveStore((state) => state.connectStone);
  const wrappedOpen = useArchiveStore((state) => state.wrappedOpen);
  const requestTab = useArchiveStore((state) => state.requestTab);
  const clearRequestTab = useArchiveStore((state) => state.clearRequestTab);
  const resetArchiveScreen = useArchiveStore((state) => state.resetArchiveScreen);
  const current = useArchiveStore(selectCurrentTrack);
  const playing = useArchiveStore((state) => state.playing);
  const togglePlay = useArchiveStore((state) => state.togglePlay);
  const skipTrack = useArchiveStore((state) => state.skipTrack);
  const openSongDetails = useArchiveStore((state) => state.openSongDetails);
  const isBreath = tab === "breath";
  const showMiniPlayer = !isBreath && !wrappedOpen;

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

  function changeTab(next: TabId) {
    if (tab === "archive" && next !== "archive") resetArchiveScreen();
    setTab(next);
  }

  return (
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
                  track={current}
                  playing={playing}
                  onTogglePlay={togglePlay}
                  onSkip={skipTrack}
                  onAdd={() => openSongDetails(current.id)}
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
  );
}
