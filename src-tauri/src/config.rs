use std::{fs::File, io::BufReader};

use cfg_if::cfg_if;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Clone, Debug)]
pub struct AppState {
    #[serde(default)]
    pub rules_dir: String,
    #[serde(default)]
    pub out_dir: String,
}

pub fn load_config() -> crate::error::Result<AppState> {
    cfg_if! {
        if #[cfg(debug_assertions)] {
            let file = File::open("config.json")?;
        } else {
            let file = File::open("/root/clash/config.json")?;
        }
    };

    let state = serde_json::from_reader(BufReader::new(file))?;

    Ok(state)
}
