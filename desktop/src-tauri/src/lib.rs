use std::fs;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
fn open_data_folder(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve the application-data directory: {error}"))?;

    fs::create_dir_all(&data_dir)
        .map_err(|error| format!("Could not create the application-data directory: {error}"))?;

    app.opener()
        .open_path(data_dir.clone(), None::<&str>)
        .map_err(|error| format!("Could not open the application-data directory: {error}"))?;

    Ok(data_dir.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_data_folder])
        .run(tauri::generate_context!())
        .expect("ZCVIOS desktop shell failed to start");
}
