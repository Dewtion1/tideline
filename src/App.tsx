import { Shell } from "./components/Shell";
import { useRoute } from "./lib/route";
import { Grow } from "./screens/Grow";
import { Log } from "./screens/Log";
import { Money } from "./screens/Money";
import { Onboarding } from "./screens/Onboarding";
import { Precepts } from "./screens/Precepts";
import { Review } from "./screens/Review";
import { Settings } from "./screens/Settings";
import { Today } from "./screens/Today";
import { Trends } from "./screens/Trends";
import { useStore } from "./store/Store";

export default function App() {
  const { state, ready } = useStore();
  const route = useRoute();

  if (!ready) {
    return (
      <div className="app">
        <p className="loading">Opening the log.</p>
      </div>
    );
  }

  if (!state.meta.seenOnboarding) {
    return <Onboarding />;
  }

  return (
    <Shell>
      {route === "/" && <Today />}
      {route === "/log" && <Log />}
      {route === "/money" && <Money />}
      {route === "/grow" && <Grow />}
      {route === "/trends" && <Trends />}
      {route === "/review" && <Review />}
      {route === "/precepts" && <Precepts />}
      {route === "/settings" && <Settings />}
    </Shell>
  );
}
