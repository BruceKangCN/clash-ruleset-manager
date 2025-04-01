use std::path::PathBuf;

use tauri::State;
use tokio::io::AsyncWriteExt;

use crate::{
    config::AppState,
    error::Result,
    parse_node_file,
    schema::RuleSet,
    types::{Node, Nodes, UpdateInfo},
};

#[tauri::command]
#[tracing::instrument]
pub async fn get_sets(state: State<'_, AppState>) -> Result<Vec<RuleSet>> {
    let sql = "select * from rulesets order by order asc;";
    let sets: Vec<RuleSet> = sqlx::query_as(sql).fetch_all(&state.pool).await?;

    Ok(sets)
}

#[tauri::command]
#[tracing::instrument]
pub async fn remove_set(state: State<'_, AppState>, ruleset_id: u32) -> Result<()> {
    let pool = &state.pool;

    let sql = "delete from rulesets where id = ? returning order;";
    let (deleted_order,): (u32,) = sqlx::query_as(sql).bind(ruleset_id).fetch_one(pool).await?;

    let sql = "select * from rulesets where order > ?;";
    let sets: Vec<RuleSet> = sqlx::query_as(sql)
        .bind(deleted_order)
        .fetch_all(pool)
        .await?;

    let updates = sets
        .into_iter()
        .map(|set| UpdateInfo {
            id: set.id,
            new_order: set.order - 1,
        })
        .collect();
    tracing::debug!(?updates, "create update info");

    sort_sets(state, updates).await
}

#[tauri::command]
#[tracing::instrument]
pub async fn sort_sets(state: State<'_, AppState>, updates: Vec<UpdateInfo>) -> Result<()> {
    let pool = &state.pool;

    let tx = pool.begin().await?;
    let sql = "update rulesets set order = ? where id = ?;";
    for info in updates {
        sqlx::query(sql)
            .bind(info.new_order)
            .bind(info.id)
            .execute(pool)
            .await?;
    }
    tx.commit().await?;

    Ok(())
}

#[tauri::command]
#[tracing::instrument]
pub async fn get_set(state: State<'_, AppState>, id: u32, ty: String) -> Result<String> {
    let sql = "select content from rules where ruleset_id = ? and type = ?;";
    let (content,): (String,) = sqlx::query_as(sql)
        .bind(id)
        .bind(&ty)
        .fetch_one(&state.pool)
        .await?;

    Ok(content)
}

#[tauri::command]
#[tracing::instrument]
pub async fn add_set(
    state: State<'_, AppState>,
    id: u32,
    ty: String,
    content: String,
) -> Result<()> {
    let sql = "insert into rules (ruleset_id, type, content) values (?, ?, ?);";
    sqlx::query(sql)
        .bind(id)
        .bind(&ty)
        .bind(&content)
        .execute(&state.pool)
        .await?;

    Ok(())
}

#[tauri::command]
#[tracing::instrument]
pub async fn get_nodes(state: State<'_, AppState>) -> Result<Nodes> {
    let out_dir = &state.config.out_dir;
    let sub = parse_node_file(PathBuf::from(out_dir).join("sub.txt")).await?;
    let zj = parse_node_file(PathBuf::from(out_dir).join("zj.txt")).await?;

    let nodes = Nodes { sub, zj };

    Ok(nodes)
}

#[tauri::command]
#[tracing::instrument]
pub async fn append_nodes(state: State<'_, AppState>, node: Node) -> Result<()> {
    let ty = node.r#type.to_owned().unwrap_or_default();
    let filename = format!("{}.txt", ty);
    let path = PathBuf::from(&state.config.out_dir).join(filename);

    let mut file = tokio::fs::OpenOptions::new()
        .append(true)
        .open(path)
        .await?;
    file.write(format!("\n{}", &node.to_string()).as_bytes())
        .await?;

    Ok(())
}
