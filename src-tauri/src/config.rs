use std::{fs::File, io::BufReader};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct AppState {
    pub config: Config,
    pub pool: sqlx::SqlitePool,
}

#[derive(Serialize, Deserialize, Default, Clone, Debug)]
pub struct Config {
    #[serde(default)]
    pub rules_dir: String,
    #[serde(default)]
    pub out_dir: String,
    #[serde(default)]
    pub groups: Vec<String>,
}

#[tracing::instrument]
pub fn load_config() -> crate::error::Result<Config> {
    let file = File::open("config.json")?;

    let state = serde_json::from_reader(BufReader::new(file))?;

    Ok(state)
}
