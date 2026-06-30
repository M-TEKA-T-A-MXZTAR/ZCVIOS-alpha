import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState, type FormEvent } from "react";
import type { ActiveProfile } from "../../src/application/identity";
import {
  localProfileProvider,
  type DesktopBootstrapStatus,
  type OperatorBaseline,
  type OperatorBaselineInput,
} from "./adapters/local-profile-provider";

type View = "dashboard" | "baseline" | "system";
type FolderState = {
  status: "idle" | "opening" | "opened" | "error";
  message: string;
};
type SaveState = {
  status: "idle" | "saving" | "saved" | "error";
  message: string;
};
type BaselineDraft = {
  displayName: string;
  focusedHoursPerWeek: string;
  weeklyRevenue: string;
  primaryChannel: string;
  activeOffer: string;
};

const navigation: Array<{ id: View; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "baseline", label: "Operator baseline" },
  { id: "system", label: "System" },
];

const emptyDraft: BaselineDraft = {
  displayName: "",
  focusedHoursPerWeek: "",
  weeklyRevenue: "0.00",
  primaryChannel: "",
  activeOffer: "",
};

const persistenceErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return `Could not initialize local persistence: ${message}`;
};

const draftFromBaseline = (baseline: OperatorBaseline): BaselineDraft => ({
  displayName: baseline.displayName,
  focusedHoursPerWeek:
    baseline.focusedHoursPerWeek > 0 ? String(baseline.focusedHoursPerWeek) : "",
  weeklyRevenue: (baseline.weeklyRevenueCents / 100).toFixed(2),
  primaryChannel: baseline.primaryChannel,
  activeOffer: baseline.activeOffer,
});

const formatRevenue = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

const parseBaselineDraft = (draft: BaselineDraft): OperatorBaselineInput => {
  const displayName = draft.displayName.trim();
  const primaryChannel = draft.primaryChannel.trim();
  const activeOffer = draft.activeOffer.trim();

  if (!displayName) throw new Error("Enter an operator or business name.");
  if (!/^\d+$/.test(draft.focusedHoursPerWeek.trim())) {
    throw new Error("Focused work hours must be a whole number between 1 and 168.");
  }

  const focusedHoursPerWeek = Number.parseInt(draft.focusedHoursPerWeek, 10);
  if (focusedHoursPerWeek < 1 || focusedHoursPerWeek > 168) {
    throw new Error("Focused work hours must be between 1 and 168.");
  }

  const revenueText = draft.weeklyRevenue.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(revenueText)) {
    throw new Error("Weekly revenue must be zero or a positive amount with up to two decimals.");
  }

  const weeklyRevenueCents = Math.round(Number(revenueText) * 100);
  if (!Number.isSafeInteger(weeklyRevenueCents) || weeklyRevenueCents < 0) {
    throw new Error("Weekly revenue is outside the supported range.");
  }
  if (!primaryChannel) throw new Error("Enter the primary sales channel.");
  if (!activeOffer) throw new Error("Enter the active offer or product focus.");

  return {
    displayName,
    focusedHoursPerWeek,
    weeklyRevenueCents,
    primaryChannel,
    activeOffer,
  };
};

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [bootstrap, setBootstrap] = useState<DesktopBootstrapStatus | null>(null);
  const [startupError, setStartupError] = useState("");
  const [draft, setDraft] = useState<BaselineDraft>(emptyDraft);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle", message: "" });
  const [folderState, setFolderState] = useState<FolderState>({
    status: "idle",
    message: "",
  });

  const profile: ActiveProfile | null = bootstrap?.profile ?? null;
  const baseline = bootstrap?.baseline ?? null;

  useEffect(() => {
    let cancelled = false;

    void localProfileProvider
      .initialize()
      .then((result) => {
        if (!cancelled) {
          setBootstrap(result);
          setDraft(draftFromBaseline(result.baseline));
          setStartupError("");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBootstrap(null);
          setStartupError(persistenceErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const retryPersistence = async () => {
    setStartupError("");

    try {
      const result = await localProfileProvider.initialize();
      setBootstrap(result);
      setDraft(draftFromBaseline(result.baseline));
    } catch (error) {
      setBootstrap(null);
      setStartupError(persistenceErrorMessage(error));
    }
  };

  const saveBaseline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveState({ status: "saving", message: "Saving the local operator baseline…" });

    try {
      const input = parseBaselineDraft(draft);
      const result = await localProfileProvider.saveBaseline(input);
      setBootstrap(result);
      setDraft(draftFromBaseline(result.baseline));
      setSaveState({
        status: "saved",
        message: "Operator baseline saved locally and reloaded from SQLite.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveState({ status: "error", message });
    }
  };

  const reloadBaseline = () => {
    if (!baseline) return;
    setDraft(draftFromBaseline(baseline));
    setSaveState({ status: "idle", message: "Saved values restored." });
  };

  const openDataFolder = async () => {
    setFolderState({
      status: "opening",
      message: "Opening local application-data folder…",
    });

    try {
      const path = await invoke<string>("open_data_folder");
      setFolderState({ status: "opened", message: `Opened ${path}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFolderState({
        status: "error",
        message: `Could not open the data folder: ${message}`,
      });
    }
  };

  const viewTitle =
    view === "dashboard"
      ? "Operator starting point"
      : view === "baseline"
        ? "Local operator baseline"
        : "System boundary";

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-mark" aria-hidden="true">
          ZC
        </div>
        <div>
          <p className="eyebrow">Local decision console</p>
          <h1>ZCVIOS</h1>
        </div>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "nav-button active" : "nav-button"}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <strong>One lever · one mission</strong>
          <span>
            M8.1 records the operator starting point only. Recommendations and missions remain
            deliberately disconnected.
          </span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Desktop product loop · M8.1</p>
            <h2>{viewTitle}</h2>
          </div>
          <div className="profile-chip" aria-label="Active local profile">
            <span className="status-dot" aria-hidden="true" />
            <span>
              {profile?.displayName ?? (startupError ? "Persistence unavailable" : "Starting SQLite")}
            </span>
          </div>
        </header>

        <main className="content">
          {startupError ? (
            <section className="panel" role="alert">
              <p className="eyebrow">Recoverable startup error</p>
              <h3>Local persistence could not start.</h3>
              <p className="action-message error">{startupError}</p>
              <button type="button" onClick={() => void retryPersistence()}>
                Retry persistence
              </button>
            </section>
          ) : view === "dashboard" ? (
            <section aria-labelledby="dashboard-title">
              <div className="hero-panel">
                <p className="eyebrow">One lever · one mission · measured progress</p>
                <h3 id="dashboard-title">
                  {baseline?.isComplete
                    ? "The operator baseline is ready for the next decision-support slice."
                    : "Set the starting point ZCVIOS will measure from."}
                </h3>
                <p>
                  {baseline?.isComplete
                    ? "These values describe current capacity, revenue and commercial focus. ZCVIOS is not selecting a lever yet."
                    : "Record a small, honest baseline before connecting work logs, revenue history, weekly levers or daily missions."}
                </p>
                <button type="button" onClick={() => setView("baseline")}>
                  {baseline?.isComplete ? "Review operator baseline" : "Set operator baseline"}
                </button>
              </div>

              <div className="metric-grid" aria-label="Operator baseline status">
                <article>
                  <span>Focused capacity</span>
                  <strong>
                    {baseline?.focusedHoursPerWeek
                      ? `${baseline.focusedHoursPerWeek} hours / week`
                      : "Not set"}
                  </strong>
                  <small>Available focused work, not total waking time</small>
                </article>
                <article>
                  <span>Weekly revenue baseline</span>
                  <strong>
                    {baseline ? formatRevenue(baseline.weeklyRevenueCents) : "Starting"}
                  </strong>
                  <small>Stored as integer cents in your usual currency</small>
                </article>
                <article>
                  <span>Primary channel</span>
                  <strong>{baseline?.primaryChannel || "Not set"}</strong>
                  <small>The current main route to a buyer</small>
                </article>
              </div>

              <article className="panel next-boundary">
                <p className="eyebrow">Active commercial focus</p>
                <h3>{baseline?.activeOffer || "No active offer recorded"}</h3>
                <p>
                  Next, ZCVIOS will connect focused work logs and weekly revenue records before it
                  is allowed to recommend a business lever.
                </p>
              </article>
            </section>
          ) : view === "baseline" ? (
            <section className="baseline-layout" aria-labelledby="baseline-title">
              <article className="panel baseline-intro">
                <p className="eyebrow">Local onboarding</p>
                <h3 id="baseline-title">Describe the present operating position.</h3>
                <p>
                  These values stay in the local SQLite database. Do not enter passwords, payment
                  credentials, API keys or private marketplace tokens.
                </p>
                <ul>
                  <li>Use a realistic weekly capacity.</li>
                  <li>Revenue may be zero.</li>
                  <li>Name one main channel and one current offer.</li>
                </ul>
              </article>

              <form className="panel baseline-form" onSubmit={(event) => void saveBaseline(event)}>
                <div className="field-group">
                  <label htmlFor="display-name">Operator or business name</label>
                  <input
                    id="display-name"
                    value={draft.displayName}
                    maxLength={80}
                    autoComplete="organization"
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, displayName: event.target.value }))
                    }
                    disabled={!bootstrap || saveState.status === "saving"}
                  />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label htmlFor="focused-hours">Focused hours available per week</label>
                    <input
                      id="focused-hours"
                      type="number"
                      min="1"
                      max="168"
                      step="1"
                      value={draft.focusedHoursPerWeek}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          focusedHoursPerWeek: event.target.value,
                        }))
                      }
                      disabled={!bootstrap || saveState.status === "saving"}
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="weekly-revenue">Weekly revenue baseline</label>
                    <input
                      id="weekly-revenue"
                      inputMode="decimal"
                      value={draft.weeklyRevenue}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, weeklyRevenue: event.target.value }))
                      }
                      disabled={!bootstrap || saveState.status === "saving"}
                    />
                    <small>Use your usual currency, with up to two decimals.</small>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="primary-channel">Primary sales channel</label>
                  <input
                    id="primary-channel"
                    value={draft.primaryChannel}
                    maxLength={120}
                    placeholder="Example: Payhip, Etsy, direct clients"
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, primaryChannel: event.target.value }))
                    }
                    disabled={!bootstrap || saveState.status === "saving"}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="active-offer">Active offer or product focus</label>
                  <textarea
                    id="active-offer"
                    value={draft.activeOffer}
                    maxLength={160}
                    rows={3}
                    placeholder="Example: Vector pattern packs for print-on-demand creators"
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, activeOffer: event.target.value }))
                    }
                    disabled={!bootstrap || saveState.status === "saving"}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={!bootstrap || saveState.status === "saving"}>
                    {saveState.status === "saving" ? "Saving…" : "Save operator baseline"}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={reloadBaseline}
                    disabled={!baseline || saveState.status === "saving"}
                  >
                    Reload saved values
                  </button>
                </div>

                {saveState.message ? (
                  <p
                    className={
                      saveState.status === "error" ? "action-message error" : "action-message"
                    }
                    role={saveState.status === "error" ? "alert" : "status"}
                  >
                    {saveState.message}
                  </p>
                ) : null}
              </form>
            </section>
          ) : (
            <section className="system-grid" aria-labelledby="system-title">
              <article className="panel">
                <p className="eyebrow">Identity and baseline</p>
                <h3 id="system-title">Durable local owner record</h3>
                <dl>
                  <div>
                    <dt>Profile ID</dt>
                    <dd>{profile?.id ?? "Starting"}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{profile?.source ?? "Starting"}</dd>
                  </div>
                  <div>
                    <dt>Operator baseline</dt>
                    <dd>{baseline?.isComplete ? "Complete" : "Incomplete"}</dd>
                  </div>
                  <div>
                    <dt>Schema</dt>
                    <dd>{bootstrap ? `Version ${bootstrap.schemaVersion}` : "Starting"}</dd>
                  </div>
                  <div>
                    <dt>Migration history</dt>
                    <dd>{bootstrap ? `${bootstrap.migrationCount} applied` : "Starting"}</dd>
                  </div>
                </dl>
              </article>

              <article className="panel">
                <p className="eyebrow">Data ownership</p>
                <h3>Inspect the SQLite data location</h3>
                <p>
                  The application-data folder contains the versioned zcvios.sqlite3 file, including
                  the local profile and operator baseline.
                </p>
                {bootstrap ? <p className="action-message">{bootstrap.databasePath}</p> : null}
                <button
                  type="button"
                  onClick={openDataFolder}
                  disabled={folderState.status === "opening"}
                >
                  {folderState.status === "opening" ? "Opening…" : "Open data folder"}
                </button>
                {folderState.message ? (
                  <p
                    className={
                      folderState.status === "error" ? "action-message error" : "action-message"
                    }
                    role="status"
                  >
                    {folderState.message}
                  </p>
                ) : null}
              </article>
            </section>
          )}
        </main>

        <footer className="status-footer">
          <span>
            <span className="status-dot" aria-hidden="true" />
            {bootstrap ? "SQLite persistence ready" : "Starting local persistence"}
          </span>
          <span>{bootstrap ? `Schema v${bootstrap.schemaVersion}` : "Schema pending"}</span>
          <span>{baseline?.isComplete ? "Operator baseline complete" : "Baseline setup required"}</span>
          <span>No listening application server</span>
        </footer>
      </section>
    </div>
  );
}
