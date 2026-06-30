import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import type { ActiveProfile } from "../../src/application/identity";
import { localProfileProvider } from "./adapters/local-profile-provider";

type View = "dashboard" | "system";
type FolderState = {
  status: "idle" | "opening" | "opened" | "error";
  message: string;
};

const navigation: Array<{ id: View; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "system", label: "System" },
];

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useState<ActiveProfile | null>(null);
  const [folderState, setFolderState] = useState<FolderState>({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    let active = true;
    localProfileProvider.getActiveProfile().then((resolved) => {
      if (active) setProfile(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

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

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-mark" aria-hidden="true">
          ZC
        </div>
        <div>
          <p className="eyebrow">Local planning console</p>
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
          <strong>Deterministic first</strong>
          <span>
            No account, server, database, or AI connection is active in this shell milestone.
          </span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Desktop migration · M5</p>
            <h2>{view === "dashboard" ? "Dashboard shell" : "System boundary"}</h2>
          </div>
          <div className="profile-chip" aria-label="Active local profile">
            <span className="status-dot" aria-hidden="true" />
            <span>{profile?.displayName ?? "Resolving local profile"}</span>
          </div>
        </header>

        <main className="content">
          {view === "dashboard" ? (
            <section aria-labelledby="dashboard-title">
              <div className="hero-panel">
                <p className="eyebrow">One lever · one mission · measured progress</p>
                <h3 id="dashboard-title">
                  The native shell is ready for the first vertical workflow.
                </h3>
                <p>
                  This screen intentionally contains no business records. SQLite persistence and
                  profile onboarding begin in the next controlled milestone.
                </p>
              </div>

              <div className="metric-grid" aria-label="Unconnected dashboard modules">
                <article>
                  <span>Weekly lever</span>
                  <strong>Not connected</strong>
                  <small>Core engine extracted</small>
                </article>
                <article>
                  <span>Daily mission</span>
                  <strong>Not connected</strong>
                  <small>Application service ready</small>
                </article>
                <article>
                  <span>Progress signal</span>
                  <strong>Not connected</strong>
                  <small>Report core ready</small>
                </article>
              </div>
            </section>
          ) : (
            <section className="system-grid" aria-labelledby="system-title">
              <article className="panel">
                <p className="eyebrow">Identity</p>
                <h3 id="system-title">Active local profile stub</h3>
                <dl>
                  <div>
                    <dt>Profile ID</dt>
                    <dd>{profile?.id ?? "Resolving"}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{profile?.source ?? "Resolving"}</dd>
                  </div>
                  <div>
                    <dt>Persistence</dt>
                    <dd>Not enabled</dd>
                  </div>
                </dl>
              </article>

              <article className="panel">
                <p className="eyebrow">Data ownership</p>
                <h3>Inspect the application-data location</h3>
                <p>
                  The folder is created only when this explicit action is used. No business data is
                  written.
                </p>
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
            <span className="status-dot" aria-hidden="true" /> Desktop shell ready
          </span>
          <span>Offline deterministic mode</span>
          <span>No listening application server</span>
        </footer>
      </section>
    </div>
  );
}
