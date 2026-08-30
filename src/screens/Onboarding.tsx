import { useStore } from "../store/Store";

export function Onboarding() {
  const { dispatch } = useStore();
  return (
    <div className="onboarding">
      <p className="kicker">Harbour almanac</p>
      <h1>Tideline</h1>
      <p>
        A private record of the few daily figures that show how a life is going. Sleep, mood, energy,
        screen, urges, money, competence, obligations, people. Trends, not cheers.
      </p>
      <p>
        There is no account. Nothing you type here is sent to a server except an optional push
        subscription (endpoint, keys, timezone offset, hour). Wellbeing data stays in IndexedDB on
        this device.
      </p>
      <p>
        Install this app to the home screen. Installation is load-bearing for data retention, not
        just for notifications. On iOS, use Share → Add to Home Screen. Without that, notifications
        will not work, and iOS may clear IndexedDB after about seven days idle.
      </p>
      <p className="muted" style={{ color: "#8FA3AA" }}>
        The app records. It does not cheer.
      </p>
      <button type="button" onClick={() => dispatch({ type: "DISMISS_ONBOARDING" })}>
        Continue
      </button>
    </div>
  );
}
