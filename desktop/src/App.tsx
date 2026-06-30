import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import type { ActiveProfile } from "../../src/application/identity";
import {
  localProfileProvider,
  type DesktopBootstrapStatus,
} from "./adapters/local-profile-provider";

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
  const [bootstrap, setBootstrap] = useState<DesktopBootstrapStatus | null>(null);
  const [startupError, setStartupError] = useState("");
  const [folderState, setFolderState] = useState<FolderState>({
    status: "idle",
    message: "",
  });

  const profile: ActiveProfile | null = bootstrap?.profile ?? null;

  const initializePersistence = async () => {
    setStartupError("");

    try {
      setBootstrap(await localProfileProvider.initialize());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setBootstrap(null);
      setStartupError(`Could not initialize local persistence: ${message}`);
    }
  };

  useEffect(() => {
    void initializePersistence();
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
            Local identity and migration records are stored in SQLite. Business modules remain
            disconnected.
          </span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Desktop migration · M6</p>
            <h2>{view === "dashboard" ? "Persistence foundation" : "System boundary"}</h2>
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
              <button type="button" onClick={() => void initializePersistence()}>
                Retry persistence
              </button>
            </section>
          ) : view === "dashboard" ? (
            <section aria-labelledby="dashboard-title">
              <div className="hero-panel">
                <p className="eyebrow">One lever · one mission · measured progress</p>
                <h3 id="dashboard-title">
                  The local identity and migration foundation is durable.
                </h3>
                <p>
                  ZCVIOS now creates a versioned SQLite database and restores the active local owner
                  profile on startup. No business data is written by this milestone.
                </p>
              </div>

              <div className="metric-grid" aria-label="Persistence foundation status">
                <article>
                  <span>Local profile</span>
                  <strong>{profile ? "Persistent" : "Starting"}</strong>
                  <small>{profile?.id ?? "Waiting for database"}</small>
                </article>
                <article>
                  <span>Schema version</span>
                  <strong>{bootstrap ? `v${bootstrap.schemaVersion}` : "Starting"}</strong>
                  <small>{bootstrap ? `${bootstrap.migrationCount} migration recorded` : ""}</small>
                </article>
                <article>
                  <span>Business workflows</span>
                  <strong>Not connected</strong>
                  <small>Vertical migration begins after packaging</small>
                </article>
              </div>
            </section>
          ) : (
            <section className="system-grid" aria-labelledby="system-title">
              <article className="panel">
                <p className="eyebrow">Identity</p>
                <h3 id="system-title">Durable local owner profile</h3>
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
                    <dt>Persistence</dt>
                    <dd>{bootstrap ? "SQLite ready" : "Starting"}</dd>
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
                  The application-data folder contains the versioned `zcvios.sqlite3` file. Business
                  records are not connected yet.
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
          <span>No listening application server</span>
        </footer>
      </section>
    </div>
  );
}
