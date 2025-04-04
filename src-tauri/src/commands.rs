use std::path::PathBuf;

use tauri::State;

use crate::{
    config::AppState,
    error::Result,
    schema::RuleSet,
    types::{NodeGroup, UpdateInfo},
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
pub async fn get_set(state: State<'_, AppState>, id: u32) -> Result<RuleSet> {
    let sql = "select * from rulesets where id = ?;";
    let set: RuleSet = sqlx::query_as(sql).bind(id).fetch_one(&state.pool).await?;

    Ok(set)
}

#[tauri::command]
#[tracing::instrument]
pub async fn rename_set(state: State<'_, AppState>, id: u32, name: String) -> Result<()> {
    let sql = "update rulesets set name = ? where id = ?;";
    sqlx::query(sql)
        .bind(id)
        .bind(&name)
        .execute(&state.pool)
        .await?;

    Ok(())
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
    let sql = "select content from rules where ruleset_id = ? and grp = ?;";
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
        let sql = "insert into rules (ruleset_id, grp) values (?, ?);";
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
    let sql = "insert into rules (ruleset_id, grp, content) values (?, ?, ?);";
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
pub async fn generate_ruleset_files(state: State<'_, AppState>) -> Result<()> {
    let rulesets = get_sets(state.to_owned()).await?;

    // clear ruleset dir
    let dir = PathBuf::from(&state.config.rules_dir);
    tokio::fs::remove_dir_all(dir.to_owned()).await?;
    tokio::fs::create_dir_all(dir.to_owned()).await?;

    for ruleset in rulesets {
        for group in &state.config.groups {
            let filename = format!("{}_{}_{}.txt", ruleset.ord, &ruleset.name, &group);
            let path = dir.join(filename);

            let content = get_set_group(state.to_owned(), ruleset.id, group.to_owned()).await?;

            tokio::fs::write(path, &content).await?;
        }
    }

    Ok(())
}

#[tauri::command]
#[tracing::instrument]
pub async fn get_nodes(state: State<'_, AppState>) -> Result<Vec<NodeGroup>> {
    let out_dir = &state.config.out_dir;

    let mut groups = Vec::new();

    for ty in ["sub", "zj"] {
        let path = PathBuf::from(out_dir).join(&format!("{}.txt", ty));
        let content = tokio::fs::read_to_string(path).await?;
        groups.push(NodeGroup {
            r#type: ty.into(),
            content,
        });
    }

    Ok(groups)
}

#[tauri::command]
#[tracing::instrument]
pub async fn update_nodes(
    state: State<'_, AppState>,
    r#type: String,
    content: String,
) -> Result<()> {
    let filename = format!("{}.txt", r#type);
    let path = PathBuf::from(&state.config.out_dir).join(filename);
    tokio::fs::write(path, &content).await?;

    Ok(())
}
