use std::fmt::Debug;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateInfo {
    pub id: u32,
    pub new_order: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct NodeGroup {
    pub r#type: String,
    pub content: String,
}
