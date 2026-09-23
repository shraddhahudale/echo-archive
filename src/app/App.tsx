import { useState } from "react";
import { PhoneFrame } from "../components/PhoneFrame";
import { StatusBar } from "../components/StatusBar";
import { TabBar, type TabId } from "../components/TabBar";
import { Archive } from "../screens/Archive";
import { Breath } from "../screens/Breath";
import { Home } from "../screens/Home";
import { Timeline } from "../screens/Timeline";

export function App() {
  const [tab, setTab] = useState<TabId>("home");

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col">
        <StatusBar />
        <main className="min-h-0 flex-1" data-screen={tab}>
          {tab === "home" && <Home />}
          {tab === "timeline" && <Timeline />}
          {tab === "archive" && <Archive />}
          {tab === "breath" && <Breath />}
        </main>
        <TabBar active={tab} onChange={setTab} />
      </div>
    </PhoneFrame>
  );
}
