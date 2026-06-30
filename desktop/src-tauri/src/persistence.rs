use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

pub const DATABASE_FILENAME: &str = "zcvios.sqlite3";
pub const LOCAL_OWNER_PROFILE_ID: &str = "local-owner";
const CURRENT_SCHEMA_VERSION: i64 = 1;

struct Migration {
    version: i64,
    description: &'static str,
    sql: &'static str,
}

const MIGRATIONS: &[Migration] = &[Migration {
    version: 1,
    description: "create_local_profile_and_application_settings",
    sql: r#"
        CREATE TABLE IF NOT EXISTS local_profiles (
            id TEXT PRIMARY KEY NOT NULL,
            display_name TEXT,
            email TEXT,
            created_at_unix INTEGER NOT NULL,
            updated_at_unix INTEGER NOT NULL,
            CHECK (length(trim(id)) > 0)
        );

        CREATE TABLE IF NOT EXISTS application_settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            updated_at_unix INTEGER NOT NULL
        );
    "#,
}];

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalProfile {
    pub id: String,
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub source: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopBootstrapStatus {
    pub profile: LocalProfile,
    pub database_path: String,
    pub schema_version: i64,
    pub migration_count: i64,
}

fn unix_timestamp() -> Result<i64, String> {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("System clock is before the Unix epoch: {error}"))?
        .as_secs();

    i64::try_from(seconds).map_err(|_| "System timestamp exceeds SQLite integer range".to_string())
}

fn prepare_parent_directory(path: &Path) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "Desktop database path has no parent directory".to_string())?;

    fs::create_dir_all(parent)
        .map_err(|error| format!("Could not create the desktop data directory: {error}"))
}

fn apply_migrations(connection: &mut Connection) -> Result<(), String> {
    connection
        .execute_batch(
            r#"
                PRAGMA foreign_keys = ON;
                CREATE TABLE IF NOT EXISTS migration_history (
                    version INTEGER PRIMARY KEY NOT NULL,
                    description TEXT NOT NULL,
                    applied_at_unix INTEGER NOT NULL
                );
            "#,
        )
        .map_err(|error| format!("Could not initialize migration history: {error}"))?;

    let transaction = connection
        .transaction()
        .map_err(|error| format!("Could not begin the migration transaction: {error}"))?;

    for migration in MIGRATIONS {
        let already_applied: bool = transaction
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM migration_history WHERE version = ?1)",
                params![migration.version],
                |row| row.get(0),
            )
            .map_err(|error| format!("Could not inspect migration history: {error}"))?;

        if already_applied {
            continue;
        }

        transaction
            .execute_batch(migration.sql)
            .map_err(|error| {
                format!(
                    "Migration {} ({}) failed: {error}",
                    migration.version, migration.description
                )
            })?;

        transaction
            .execute(
                "INSERT INTO migration_history (version, description, applied_at_unix) VALUES (?1, ?2, ?3)",
                params![migration.version, migration.description, unix_timestamp()?],
            )
            .map_err(|error| format!("Could not record migration history: {error}"))?;
    }

    transaction
        .commit()
        .map_err(|error| format!("Could not commit desktop migrations: {error}"))
}

fn ensure_local_owner_profile(connection: &Connection) -> Result<(), String> {
    let now = unix_timestamp()?;

    connection
        .execute(
            r#"
                INSERT OR IGNORE INTO local_profiles (
                    id,
                    display_name,
                    email,
                    created_at_unix,
                    updated_at_unix
                ) VALUES (?1, ?2, NULL, ?3, ?3)
            "#,
            params![LOCAL_OWNER_PROFILE_ID, "Local Operator", now],
        )
        .map_err(|error| format!("Could not create the local owner profile: {error}"))?;

    connection
        .execute(
            r#"
                INSERT INTO application_settings (key, value, updated_at_unix)
                VALUES ('active_profile_id', ?1, ?2)
                ON CONFLICT(key) DO UPDATE SET
                    value = excluded.value,
                    updated_at_unix = excluded.updated_at_unix
            "#,
            params![LOCAL_OWNER_PROFILE_ID, now],
        )
        .map_err(|error| format!("Could not activate the local owner profile: {error}"))?;

    Ok(())
}

fn load_active_profile(connection: &Connection) -> Result<LocalProfile, String> {
    let active_profile_id: Option<String> = connection
        .query_row(
            "SELECT value FROM application_settings WHERE key = 'active_profile_id'",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| format!("Could not read the active profile setting: {error}"))?;

    let active_profile_id = active_profile_id
        .ok_or_else(|| "The desktop database has no active local profile".to_string())?;

    connection
        .query_row(
            "SELECT id, display_name, email FROM local_profiles WHERE id = ?1",
            params![active_profile_id],
            |row| {
                Ok(LocalProfile {
                    id: row.get(0)?,
                    display_name: row.get(1)?,
                    email: row.get(2)?,
                    source: "local-profile".to_string(),
                })
            },
        )
        .map_err(|error| format!("Could not load the active local profile: {error}"))
}

pub fn bootstrap_database(path: &Path) -> Result<DesktopBootstrapStatus, String> {
    prepare_parent_directory(path)?;

    let mut connection = Connection::open(path)
        .map_err(|error| format!("Could not open the desktop SQLite database: {error}"))?;

    connection
        .busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|error| format!("Could not configure the SQLite busy timeout: {error}"))?;

    apply_migrations(&mut connection)?;
    ensure_local_owner_profile(&connection)?;

    let schema_version: i64 = connection
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM migration_history",
            [],
            |row| row.get(0),
        )
        .map_err(|error| format!("Could not read the desktop schema version: {error}"))?;

    let migration_count: i64 = connection
        .query_row("SELECT COUNT(*) FROM migration_history", [], |row| row.get(0))
        .map_err(|error| format!("Could not count desktop migrations: {error}"))?;

    if schema_version != CURRENT_SCHEMA_VERSION {
        return Err(format!(
            "Desktop schema version {schema_version} does not match expected version {CURRENT_SCHEMA_VERSION}"
        ));
    }

    Ok(DesktopBootstrapStatus {
        profile: load_active_profile(&connection)?,
        database_path: path.to_string_lossy().into_owned(),
        schema_version,
        migration_count,
    })
}

pub fn database_path(data_directory: &Path) -> PathBuf {
    data_directory.join(DATABASE_FILENAME)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::process;

    fn unique_database_path(test_name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("test clock must be valid")
            .as_nanos();

        std::env::temp_dir().join(format!(
            "zcvios-{test_name}-{}-{nanos}.sqlite3",
            process::id()
        ))
    }

    fn remove_database_files(path: &Path) {
        let _ = fs::remove_file(path);
        let _ = fs::remove_file(format!("{}-wal", path.to_string_lossy()));
        let _ = fs::remove_file(format!("{}-shm", path.to_string_lossy()));
    }

    #[test]
    fn bootstrap_creates_profile_and_migration_history() {
        let path = unique_database_path("bootstrap");
        let status = bootstrap_database(&path).expect("desktop database should bootstrap");

        assert_eq!(status.profile.id, LOCAL_OWNER_PROFILE_ID);
        assert_eq!(status.profile.display_name.as_deref(), Some("Local Operator"));
        assert_eq!(status.profile.source, "local-profile");
        assert_eq!(status.schema_version, 1);
        assert_eq!(status.migration_count, 1);
        assert!(path.exists());

        let connection = Connection::open(&path).expect("test database should reopen");
        let profile_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM local_profiles", [], |row| row.get(0))
            .expect("profile count should be readable");
        let migration_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM migration_history", [], |row| row.get(0))
            .expect("migration count should be readable");

        assert_eq!(profile_count, 1);
        assert_eq!(migration_count, 1);
        drop(connection);
        remove_database_files(&path);
    }

    #[test]
    fn profile_changes_survive_database_reopen() {
        let path = unique_database_path("restart");
        bootstrap_database(&path).expect("first bootstrap should succeed");

        {
            let connection = Connection::open(&path).expect("test database should reopen");
            connection
                .execute(
                    "UPDATE local_profiles SET display_name = ?1 WHERE id = ?2",
                    params!["Persisted Operator", LOCAL_OWNER_PROFILE_ID],
                )
                .expect("test profile should update");
        }

        let restarted = bootstrap_database(&path).expect("restart bootstrap should succeed");
        assert_eq!(
            restarted.profile.display_name.as_deref(),
            Some("Persisted Operator")
        );
        assert_eq!(restarted.migration_count, 1);

        remove_database_files(&path);
    }
}
