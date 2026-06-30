use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

pub const DATABASE_FILENAME: &str = "zcvios.sqlite3";
pub const LOCAL_OWNER_PROFILE_ID: &str = "local-owner";
const CURRENT_SCHEMA_VERSION: i64 = 2;
const MAX_REVENUE_CENTS: i64 = 100_000_000_000;

struct Migration {
    version: i64,
    description: &'static str,
    sql: &'static str,
}

const MIGRATIONS: &[Migration] = &[
    Migration {
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
    },
    Migration {
        version: 2,
        description: "create_operator_baseline",
        sql: r#"
            CREATE TABLE IF NOT EXISTS operator_baselines (
                profile_id TEXT PRIMARY KEY NOT NULL,
                focused_hours_per_week INTEGER NOT NULL DEFAULT 0,
                weekly_revenue_cents INTEGER NOT NULL DEFAULT 0,
                primary_channel TEXT NOT NULL DEFAULT '',
                active_offer TEXT NOT NULL DEFAULT '',
                created_at_unix INTEGER NOT NULL,
                updated_at_unix INTEGER NOT NULL,
                FOREIGN KEY (profile_id) REFERENCES local_profiles(id) ON DELETE CASCADE,
                CHECK (focused_hours_per_week BETWEEN 0 AND 168),
                CHECK (weekly_revenue_cents BETWEEN 0 AND 100000000000),
                CHECK (length(primary_channel) <= 120),
                CHECK (length(active_offer) <= 160)
            );
        "#,
    },
];

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
pub struct OperatorBaseline {
    pub display_name: String,
    pub focused_hours_per_week: i64,
    pub weekly_revenue_cents: i64,
    pub primary_channel: String,
    pub active_offer: String,
    pub is_complete: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OperatorBaselineInput {
    pub display_name: String,
    pub focused_hours_per_week: i64,
    pub weekly_revenue_cents: i64,
    pub primary_channel: String,
    pub active_offer: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopBootstrapStatus {
    pub profile: LocalProfile,
    pub baseline: OperatorBaseline,
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

fn configure_connection(connection: &Connection) -> Result<(), String> {
    connection
        .busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|error| format!("Could not configure the SQLite busy timeout: {error}"))?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| format!("Could not enable SQLite foreign keys: {error}"))
}

fn apply_migrations(connection: &mut Connection) -> Result<(), String> {
    connection
        .execute_batch(
            r#"
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

    connection
        .execute(
            r#"
                INSERT OR IGNORE INTO operator_baselines (
                    profile_id,
                    focused_hours_per_week,
                    weekly_revenue_cents,
                    primary_channel,
                    active_offer,
                    created_at_unix,
                    updated_at_unix
                ) VALUES (?1, 0, 0, '', '', ?2, ?2)
            "#,
            params![LOCAL_OWNER_PROFILE_ID, now],
        )
        .map_err(|error| format!("Could not create the local operator baseline: {error}"))?;

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

fn load_operator_baseline(connection: &Connection) -> Result<OperatorBaseline, String> {
    connection
        .query_row(
            r#"
                SELECT
                    COALESCE(p.display_name, ''),
                    b.focused_hours_per_week,
                    b.weekly_revenue_cents,
                    b.primary_channel,
                    b.active_offer
                FROM operator_baselines b
                JOIN local_profiles p ON p.id = b.profile_id
                WHERE b.profile_id = ?1
            "#,
            params![LOCAL_OWNER_PROFILE_ID],
            |row| {
                let display_name: String = row.get(0)?;
                let focused_hours_per_week: i64 = row.get(1)?;
                let weekly_revenue_cents: i64 = row.get(2)?;
                let primary_channel: String = row.get(3)?;
                let active_offer: String = row.get(4)?;
                let is_complete = !display_name.trim().is_empty()
                    && focused_hours_per_week > 0
                    && !primary_channel.trim().is_empty()
                    && !active_offer.trim().is_empty();

                Ok(OperatorBaseline {
                    display_name,
                    focused_hours_per_week,
                    weekly_revenue_cents,
                    primary_channel,
                    active_offer,
                    is_complete,
                })
            },
        )
        .map_err(|error| format!("Could not load the local operator baseline: {error}"))
}

fn load_status(connection: &Connection, path: &Path) -> Result<DesktopBootstrapStatus, String> {
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
        profile: load_active_profile(connection)?,
        baseline: load_operator_baseline(connection)?,
        database_path: path.to_string_lossy().into_owned(),
        schema_version,
        migration_count,
    })
}

fn normalize_required(value: String, label: &str, maximum_characters: usize) -> Result<String, String> {
    let normalized = value.trim().to_string();
    let length = normalized.chars().count();

    if normalized.is_empty() {
        return Err(format!("{label} is required"));
    }
    if length > maximum_characters {
        return Err(format!(
            "{label} must be {maximum_characters} characters or fewer"
        ));
    }

    Ok(normalized)
}

fn validate_baseline(input: OperatorBaselineInput) -> Result<OperatorBaselineInput, String> {
    if !(1..=168).contains(&input.focused_hours_per_week) {
        return Err("Focused work hours must be a whole number between 1 and 168".to_string());
    }
    if !(0..=MAX_REVENUE_CENTS).contains(&input.weekly_revenue_cents) {
        return Err("Weekly revenue must be zero or a positive amount within the supported range".to_string());
    }

    Ok(OperatorBaselineInput {
        display_name: normalize_required(input.display_name, "Operator or business name", 80)?,
        focused_hours_per_week: input.focused_hours_per_week,
        weekly_revenue_cents: input.weekly_revenue_cents,
        primary_channel: normalize_required(input.primary_channel, "Primary sales channel", 120)?,
        active_offer: normalize_required(input.active_offer, "Active offer or product focus", 160)?,
    })
}

pub fn bootstrap_database(path: &Path) -> Result<DesktopBootstrapStatus, String> {
    prepare_parent_directory(path)?;

    let mut connection = Connection::open(path)
        .map_err(|error| format!("Could not open the desktop SQLite database: {error}"))?;
    configure_connection(&connection)?;
    apply_migrations(&mut connection)?;
    ensure_local_owner_profile(&connection)?;
    load_status(&connection, path)
}

pub fn save_operator_baseline(
    path: &Path,
    input: OperatorBaselineInput,
) -> Result<DesktopBootstrapStatus, String> {
    let input = validate_baseline(input)?;
    prepare_parent_directory(path)?;

    let mut connection = Connection::open(path)
        .map_err(|error| format!("Could not open the desktop SQLite database: {error}"))?;
    configure_connection(&connection)?;
    apply_migrations(&mut connection)?;
    ensure_local_owner_profile(&connection)?;

    let now = unix_timestamp()?;
    let transaction = connection
        .transaction()
        .map_err(|error| format!("Could not begin the operator baseline transaction: {error}"))?;

    transaction
        .execute(
            r#"
                UPDATE local_profiles
                SET display_name = ?1, updated_at_unix = ?2
                WHERE id = ?3
            "#,
            params![input.display_name, now, LOCAL_OWNER_PROFILE_ID],
        )
        .map_err(|error| format!("Could not update the local operator name: {error}"))?;

    transaction
        .execute(
            r#"
                INSERT INTO operator_baselines (
                    profile_id,
                    focused_hours_per_week,
                    weekly_revenue_cents,
                    primary_channel,
                    active_offer,
                    created_at_unix,
                    updated_at_unix
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
                ON CONFLICT(profile_id) DO UPDATE SET
                    focused_hours_per_week = excluded.focused_hours_per_week,
                    weekly_revenue_cents = excluded.weekly_revenue_cents,
                    primary_channel = excluded.primary_channel,
                    active_offer = excluded.active_offer,
                    updated_at_unix = excluded.updated_at_unix
            "#,
            params![
                LOCAL_OWNER_PROFILE_ID,
                input.focused_hours_per_week,
                input.weekly_revenue_cents,
                input.primary_channel,
                input.active_offer,
                now
            ],
        )
        .map_err(|error| format!("Could not save the local operator baseline: {error}"))?;

    transaction
        .commit()
        .map_err(|error| format!("Could not commit the operator baseline: {error}"))?;

    load_status(&connection, path)
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
    fn bootstrap_creates_profile_baseline_and_migration_history() {
        let path = unique_database_path("bootstrap");
        let status = bootstrap_database(&path).expect("desktop database should bootstrap");

        assert_eq!(status.profile.id, LOCAL_OWNER_PROFILE_ID);
        assert_eq!(status.profile.display_name.as_deref(), Some("Local Operator"));
        assert_eq!(status.profile.source, "local-profile");
        assert_eq!(status.baseline.display_name, "Local Operator");
        assert_eq!(status.baseline.focused_hours_per_week, 0);
        assert_eq!(status.baseline.weekly_revenue_cents, 0);
        assert!(!status.baseline.is_complete);
        assert_eq!(status.schema_version, 2);
        assert_eq!(status.migration_count, 2);
        assert!(path.exists());

        let connection = Connection::open(&path).expect("test database should reopen");
        let profile_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM local_profiles", [], |row| row.get(0))
            .expect("profile count should be readable");
        let baseline_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM operator_baselines", [], |row| row.get(0))
            .expect("baseline count should be readable");
        let migration_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM migration_history", [], |row| row.get(0))
            .expect("migration count should be readable");

        assert_eq!(profile_count, 1);
        assert_eq!(baseline_count, 1);
        assert_eq!(migration_count, 2);
        drop(connection);
        remove_database_files(&path);
    }

    #[test]
    fn operator_baseline_survives_database_reopen() {
        let path = unique_database_path("restart");
        bootstrap_database(&path).expect("first bootstrap should succeed");

        let saved = save_operator_baseline(
            &path,
            OperatorBaselineInput {
                display_name: "MXZTAR Studio".to_string(),
                focused_hours_per_week: 24,
                weekly_revenue_cents: 12_345,
                primary_channel: "Payhip".to_string(),
                active_offer: "Vector pattern packs".to_string(),
            },
        )
        .expect("operator baseline should save");

        assert!(saved.baseline.is_complete);
        assert_eq!(saved.profile.display_name.as_deref(), Some("MXZTAR Studio"));

        let restarted = bootstrap_database(&path).expect("restart bootstrap should succeed");
        assert_eq!(restarted.baseline.display_name, "MXZTAR Studio");
        assert_eq!(restarted.baseline.focused_hours_per_week, 24);
        assert_eq!(restarted.baseline.weekly_revenue_cents, 12_345);
        assert_eq!(restarted.baseline.primary_channel, "Payhip");
        assert_eq!(restarted.baseline.active_offer, "Vector pattern packs");
        assert!(restarted.baseline.is_complete);
        assert_eq!(restarted.migration_count, 2);

        remove_database_files(&path);
    }

    #[test]
    fn invalid_operator_baseline_is_rejected_without_overwriting_data() {
        let path = unique_database_path("validation");
        bootstrap_database(&path).expect("first bootstrap should succeed");

        let error = save_operator_baseline(
            &path,
            OperatorBaselineInput {
                display_name: "   ".to_string(),
                focused_hours_per_week: 0,
                weekly_revenue_cents: -1,
                primary_channel: "".to_string(),
                active_offer: "".to_string(),
            },
        )
        .expect_err("invalid baseline must be rejected");

        assert!(error.contains("Focused work hours"));
        let restarted = bootstrap_database(&path).expect("database should remain readable");
        assert!(!restarted.baseline.is_complete);
        assert_eq!(restarted.baseline.weekly_revenue_cents, 0);

        remove_database_files(&path);
    }
}
