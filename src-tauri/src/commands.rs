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
    let sql = "select * from rulesets order by ord asc;";
    let sets: Vec<RuleSet> = sqlx::query_as(sql).fetch_all(&state.pool).await?;

    Ok(sets)
}

#[tauri::command]
#[tracing::instrument]
pub async fn remove_set(state: State<'_, AppState>, id: u32) -> Result<()> {
    let pool = &state.pool;

    let tx = pool.begin().await?;

    let sql = "delete from rules where ruleset_id = ?;";
    sqlx::query(sql).bind(id).execute(pool).await?;
    let sql = "delete from rulesets where id = ? returning ord;";
    let (deleted_order,): (u32,) = sqlx::query_as(sql).bind(id).fetch_one(pool).await?;
    tracing::info!(id, deleted_order, "delete ruleset");

    let sql = "select * from rulesets where ord > ?;";
    let sets: Vec<RuleSet> = sqlx::query_as(sql)
        .bind(deleted_order)
        .fetch_all(pool)
        .await?;
    tracing::debug!(?sets, "find records to update");

    let updates = sets
        .into_iter()
        .map(|set| UpdateInfo {
            id: set.id,
            new_order: set.ord - 1,
        })
        .collect();
    tracing::debug!(?updates, "create update info");

    sort_sets(state, updates).await?;

    tx.commit().await?;

    Ok(())
}

#[tauri::command]
#[tracing::instrument]
pub async fn sort_sets(state: State<'_, AppState>, updates: Vec<UpdateInfo>) -> Result<()> {
    let pool = &state.pool;

    let tx = pool.begin().await?;
    let sql = "update rulesets set ord = ? where id = ?;";
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
pub async fn get_set_group(state: State<'_, AppState>, id: u32, group: String) -> Result<String> {
    let sql = "select content from rules where ruleset_id = ? and group_type = ?;";
    let (content,): (String,) = sqlx::query_as(sql)
        .bind(id)
        .bind(&group)
        .fetch_one(&state.pool)
        .await?;

    Ok(content)
}

#[tauri::command]
#[tracing::instrument]
pub async fn create_set(state: State<'_, AppState>, name: String) -> Result<RuleSet> {
    let pool = &state.pool;
    let tx = pool.begin().await?;

    let sql = "select count(*) from rulesets;";
    let (count,): (u32,) = sqlx::query_as(sql).fetch_one(pool).await?;
    let ord = count + 1;

    let sql = "insert into rulesets (ord, name) values (?, ?) returning *;";
    let ruleset: RuleSet = sqlx::query_as(sql)
        .bind(ord)
        .bind(&name)
        .fetch_one(pool)
        .await?;

    for group in &state.config.groups {
        let sql = "insert into rules (ruleset_id, group_type) values (?, ?);";
        sqlx::query(sql)
            .bind(ruleset.id)
            .bind(&group)
            .execute(pool)
            .await?;
    }

    tx.commit().await?;

    Ok(ruleset)
}

#[tauri::command]
#[tracing::instrument]
pub async fn update_set_group(
    state: State<'_, AppState>,
    id: u32,
    group: String,
    content: String,
) -> Result<()> {
    let sql = "insert into rules (ruleset_id, group_type, content) values (?, ?, ?);";
    sqlx::query(sql)
        .bind(id)
        .bind(&group)
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
