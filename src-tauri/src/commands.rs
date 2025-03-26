use std::path::PathBuf;

use tauri::State;
use tokio::io::AsyncWriteExt;

use crate::{
    config::AppState,
    create_missing_files, create_rule_map,
    error::Result,
    init_tmp_dir, parse_node_file, sort_rule_files,
    types::{Node, Nodes, Rule, UpdateInfo},
};

#[tauri::command]
pub async fn get_rules(state: State<'_, AppState>) -> Result<Vec<Rule>> {
    let mut rule_map = create_rule_map(&state.rules_dir).await?;
    create_missing_files(&mut rule_map, &state.rules_dir).await?;

    let mut rule_vec: Vec<Rule> = rule_map.into_values().collect();
    rule_vec.sort_by(|a, b| a.id.cmp(&b.id));

    Ok(rule_vec)
}

#[tauri::command]
pub async fn sort_rules(state: State<'_, AppState>, updates: Vec<UpdateInfo>) -> Result<()> {
    let tmp_dir = init_tmp_dir(&state.rules_dir, &updates).await?;
    sort_rule_files(&state.rules_dir, tmp_dir, &updates).await
}

#[tauri::command]
pub async fn get_rule(state: State<'_, AppState>, filename: String) -> Result<String> {
    let path = PathBuf::from(&state.rules_dir).join(&filename);
    tokio::fs::read_to_string(path)
        .await
        .map_err(|err| err.into())
}

#[tauri::command]
pub async fn add_rule(state: State<'_, AppState>, filename: String, content: String) -> Result<()> {
    let path = PathBuf::from(&state.rules_dir).join(&filename);
    tokio::fs::write(path, &content)
        .await
        .map_err(|err| err.into())
}

#[tauri::command]
pub async fn get_nodes(state: State<'_, AppState>) -> Result<Nodes> {
    let sub = parse_node_file(PathBuf::from(&state.out_dir).join("sub.txt")).await?;
    let zj = parse_node_file(PathBuf::from(&state.out_dir).join("zj.txt")).await?;

    let nodes = Nodes { sub, zj };

    Ok(nodes)
}

#[tauri::command]
pub async fn append_nodes(state: State<'_, AppState>, node: Node) -> Result<()> {
    let path = PathBuf::from(&state.out_dir).join(format!(
        "{}.txt",
        node.r#type.to_owned().unwrap_or_default()
    ));
    let mut file = tokio::fs::OpenOptions::new()
        .append(true)
        .open(path)
        .await?;
    file.write(format!("\n{}", &node.to_string()).as_bytes())
        .await?;

    Ok(())
}
