mod persistence;

use std::fs;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

use persistence::{
    database_path, DesktopBootstrapStatus, OperatorBaselineInput,
};

fn resolve_database_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let data_directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve the application-data directory: {error}"))?;

    Ok(database_path(&data_directory))
}

#[tauri::command]
fn initialize_local_profile(app: tauri::AppHandle) -> Result<DesktopBootstrapStatus, String> {
    persistence::bootstrap_database(&resolve_database_path(&app)?)
}

#[tauri::command]
fn save_operator_baseline(
    app: tauri::AppHandle,
    input: OperatorBaselineInput,
) -> Result<DesktopBootstrapStatus, String> {
    persistence::save_operator_baseline(&resolve_database_path(&app)?, input)
}

#[tauri::command]
fn open_data_folder(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve the application-data directory: {error}"))?;

    fs::create_dir_all(&data_dir)
        .map_err(|error| format!("Could not create the application-data directory: {error}"))?;

    let data_dir_display = data_dir.to_string_lossy().into_owned();
    app.opener()
        .open_path(data_dir_display.clone(), None::<&str>)
        .map_err(|error| format!("Could not open the application-data directory: {error}"))?;

    Ok(data_dir_display)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            initialize_local_profile,
            save_operator_baseline,
            open_data_folder
        ])
        .run(tauri::generate_context!())
        .expect("ZCVIOS desktop application failed to start");
}
