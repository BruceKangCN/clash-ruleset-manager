use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};

use config::load_config;
use error::Result;
use futures_util::future::join_all;
use itertools::Itertools;
use regex::Regex;
use tokio::fs::read_dir;
use types::{Files, Node, Rule, RuleMap, UpdateInfo};

pub mod commands;
pub mod config;
pub mod error;
pub mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(load_config().unwrap())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_rules,
            commands::sort_rules,
            commands::get_rule,
            commands::add_rule,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub async fn create_rule_map(rules_dir: impl AsRef<Path>) -> Result<RuleMap> {
    let mut paths = Vec::new();
    let mut visitor = read_dir(rules_dir).await?;
    while let Ok(Some(entry)) = visitor.next_entry().await {
        if entry.file_type().await?.is_file() {
            paths.push(entry.path());
        }
    }

    let mut rule_map = HashMap::<isize, Rule>::new();
    let re = Regex::new(r"^(\d+)_(.*?)_(zz|gs|ym|ip)\.txt$").unwrap();

    paths.into_iter().for_each(|path| {
        let caps = match re.captures(path.to_str().unwrap_or_default()) {
            Some(caps) => caps,
            None => return,
        };

        let id: isize = caps[1].parse().unwrap();
        let name = caps[2].to_owned();

        if !rule_map.contains_key(&id) {
            let files = Files::default();
            rule_map.insert(id, Rule { id, name, files });
        }

        rule_map
            .get_mut(&id)
            .unwrap()
            .fill_file(&caps[3], caps[2].to_owned());
    });

    Ok(rule_map)
}

pub async fn create_missing_files(rule_map: &mut RuleMap, dir: impl AsRef<Path>) -> Result<()> {
    join_all(
        rule_map
            .values_mut()
            .map(|rule| rule.create_missing_file(dir.as_ref())),
    )
    .await
    .into_iter()
    .process_results(|_| ())
}

// HACK: Path is ?Sized, thus cannot be used as return value, so return TempDir
pub async fn init_tmp_dir(
    rules_dir: impl AsRef<Path>,
    updates: &Vec<UpdateInfo>,
) -> Result<tempfile::TempDir> {
    let tmp_dir = tempfile::tempdir()?;

    for info in updates {
        for ty in ["zz", "gs", "ym", "ip"] {
            let filename = format!("{}_{}.txt", &info.original, ty);
            let src = PathBuf::from(rules_dir.as_ref()).join(&filename);
            let dst = tmp_dir.path().join(&filename);
            if src.exists() {
                tokio::fs::rename(src, dst).await?;
            }
        }
    }

    Ok(tmp_dir)
}

pub async fn sort_rule_files(
    rules_dir: impl AsRef<Path>,
    tmp_dir: impl AsRef<Path>,
    updates: &Vec<UpdateInfo>,
) -> Result<()> {
    for UpdateInfo {
        original,
        new_order,
    } in updates
    {
        let name = &original[original.find('_').unwrap_or_default() + 1..];
        for ty in ["zz", "gs", "ym", "ip"] {
            let src = tmp_dir.as_ref().join(format!("{}_{}.txt", &original, ty));
            let dst = rules_dir
                .as_ref()
                .join(format!("{}_{}_{}.txt", &new_order, &name, ty));
            if src.exists() {
                tokio::fs::rename(src, dst).await?;
            }
        }
    }

    Ok(())
}

pub async fn parse_node_file(path: impl AsRef<Path>) -> Result<Vec<Node>> {
    let nodes = tokio::fs::read_to_string(path)
        .await?
        .lines()
        .map(|line| line.trim())
        .map(|line| Node::from_str(line))
        .collect();

    Ok(nodes)
}
