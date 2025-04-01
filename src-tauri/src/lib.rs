use std::{fmt::Debug, path::Path};

use cfg_if::cfg_if;
use config::{AppState, load_config};
use error::Result;
use regex::Regex;
use schema::{Rule, RuleSet};
use sqlx::{Pool, Sqlite, SqlitePool, sqlite::SqliteConnectOptions};
use tokio::fs::read_dir;
use tracing_subscriber::EnvFilter;
use types::Node;

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
    let pool = setup_db(&config.rules_dir).await.unwrap();
    let state = AppState { config, pool };

    tauri::Builder::default()
        .manage(state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_sets,
            commands::remove_set,
            commands::sort_sets,
            commands::create_set,
            commands::get_set_group,
            commands::update_set_group,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tracing::instrument]
async fn setup_db(rules_dir: impl AsRef<Path> + Debug) -> Result<Pool<Sqlite>> {
    cfg_if! {
        if #[cfg(debug_assertions)] {
            let options = SqliteConnectOptions::new().filename("app.db").create_if_missing(true);
        } else {
            let options = SqliteConnectOptions::new().filename(":memory:");
        }
    }
    let pool = SqlitePool::connect_with(options).await?;
    sqlx::migrate!().run(&pool).await?;

    let re = Regex::new(r"^(\d+)_(.*?)_(zz|gs|ym|ip)\.txt$").unwrap();

    let tx = pool.begin().await?;

    let mut entries = read_dir(rules_dir).await?;
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
async fn create_ruleset_record(pool: &Pool<Sqlite>, order: u32, name: &str) -> Result<RuleSet> {
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
    pool: &Pool<Sqlite>,
    ruleset_id: u32,
    group: &str,
    path: impl AsRef<Path> + Debug,
) -> Result<Rule> {
    let ruleset_content = tokio::fs::read_to_string(path).await?;

    let sql = "insert into rules (ruleset_id, group_type, content) values (?, ?, ?) returning *;";
    let rule = sqlx::query_as(sql)
        .bind(ruleset_id)
        .bind(group)
        .bind(&ruleset_content)
        .fetch_one(pool)
        .await?;

    Ok(rule)
}

#[tracing::instrument]
pub async fn parse_node_file(path: impl AsRef<Path> + Debug) -> Result<Vec<Node>> {
    let nodes = tokio::fs::read_to_string(path)
        .await?
        .lines()
        .map(|line| line.trim())
        .map(|line| Node::from_str(line))
        .collect();

    Ok(nodes)
}
