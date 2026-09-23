import { useEffect, useState } from "react";
import { PhoneFrame } from "../components/PhoneFrame";
import { StatusBar } from "../components/StatusBar";
import { TabBar, type TabId } from "../components/TabBar";
import { Archive } from "../screens/Archive";
import { Breath } from "../screens/Breath";
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

  useEffect(() => {
    if (useArchiveStore.getState().stoneConnected) return;
    if (!stoneIntroStartedAt) stoneIntroStartedAt = Date.now();
    const remaining = Math.max(0, 2000 - (Date.now() - stoneIntroStartedAt));
    const id = window.setTimeout(connectStone, remaining);
    return () => window.clearTimeout(id);
  }, [connectStone]);

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        <StatusBar />
        <main className="min-h-0 flex-1 overflow-hidden" data-screen={tab}>
          {tab === "home" && <Home />}
          {tab === "timeline" && <Timeline />}
          {tab === "archive" && <Archive />}
          {tab === "breath" && <Breath />}
        </main>
        <div className="absolute inset-x-0 bottom-0 z-10">
          <TabBar active={tab} onChange={setTab} />
        </div>
        <SheetHost />
        {wrappedOpen ? <Wrapped /> : null}
      </div>
    </PhoneFrame>
  );
}
