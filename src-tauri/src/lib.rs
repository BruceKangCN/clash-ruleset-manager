use std::{fmt::Debug, path::Path};

use config::{load_config, AppState, Config};
use error::Result;
use regex::Regex;
use schema::{Rule, RuleSet};
use sqlx::SqlitePool;
use tokio::fs::read_dir;
use tracing_subscriber::EnvFilter;

pub mod commands;
pub mod config;
pub mod error;
pub mod schema;
pub mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let subscriber = tracing_subscriber::fmt()
        .pretty()
        .with_env_filter(EnvFilter::from_default_env())
        .finish();
    tracing::subscriber::set_global_default(subscriber).unwrap();

    let config = load_config().unwrap();
    let pool = setup_db(&config).await.unwrap();
    let state = AppState { config, pool };

    tauri::Builder::default()
        .manage(state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_sets,
            commands::get_set,
            commands::rename_set,
            commands::remove_set,
            commands::sort_sets,
            commands::create_set,
            commands::get_set_group,
            commands::update_set_group,
            commands::generate_ruleset_files,
            commands::get_nodes,
            commands::update_nodes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tracing::instrument]
async fn setup_db(config: &Config) -> Result<SqlitePool> {
    let pool = SqlitePool::connect("sqlite::memory:").await?;
    sqlx::migrate!().run(&pool).await?;

    let re = format!(r"^(\d+)_(.*?)_({})\.txt$", config.groups.join("|"));
    let re = Regex::new(&re).unwrap();

    let tx = pool.begin().await?;

    let mut entries = read_dir(&config.rules_dir).await?;
    while let Ok(Some(entry)) = entries.next_entry().await {
        if !entry.file_type().await?.is_file() {
            continue;
        }

        // to make this live long enough, otherwise you'll need to use `to_owned`
        // to obtain a `String` value instead of `&str`
        let filename = entry.file_name();
        let filename = filename.to_str().unwrap_or_default();
        tracing::trace!(filename, "creating record from file");

        let caps = match re.captures(filename) {
            Some(caps) => caps,
            None => continue,
        };

        let order: u32 = caps[1].parse().unwrap();
        let name = &caps[2];
        let group = &caps[3];

        let ruleset = create_ruleset_record(&pool, order, name).await?;
        create_rule_group(&pool, ruleset.id, group, entry.path()).await?;
    }

    tx.commit().await?;

    Ok(pool)
}

#[tracing::instrument]
async fn create_ruleset_record(pool: &SqlitePool, order: u32, name: &str) -> Result<RuleSet> {
    if let Some::<RuleSet>(ruleset) = sqlx::query_as("select * from rulesets where name = ?;")
        .bind(name)
        .fetch_optional(pool)
        .await?
    {
        return Ok(ruleset);
    }

    let sql = "insert into rulesets (ord, name) values (?, ?) returning *;";
    let ruleset = sqlx::query_as(sql)
        .bind(order)
        .bind(name)
        .fetch_one(pool)
        .await?;

    Ok(ruleset)
}

#[tracing::instrument]
async fn create_rule_group(
    pool: &SqlitePool,
    ruleset_id: u32,
    group: &str,
    path: impl AsRef<Path> + Debug,
) -> Result<Rule> {
    let ruleset_content = tokio::fs::read_to_string(path).await?;

    let sql = "insert into rules (ruleset_id, grp, content) values (?, ?, ?) returning *;";
    let rule = sqlx::query_as(sql)
        .bind(ruleset_id)
        .bind(group)
        .bind(&ruleset_content)
        .fetch_one(pool)
        .await?;

    Ok(rule)
}
