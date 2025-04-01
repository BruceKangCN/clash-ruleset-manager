use std::fmt::Debug;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateInfo {
    pub id: u32,
    pub new_order: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Node {
    /// node type:
    ///     - zz: self-hosted
    ///     - sub: subscription
    pub r#type: Option<String>,

    pub name: String,
    pub url: String,
}

impl Node {
    #[tracing::instrument]
    pub fn from_str(content: &str) -> Self {
        let parts: Vec<&str> = content.split(':').take(2).map(|p| p.trim()).collect();
        let name = parts[0].to_owned();
        let url = parts[1].to_owned();

        Node {
            r#type: None,
            name,
            url,
        }
    }
}

impl ToString for Node {
    fn to_string(&self) -> String {
        format!("{}:{}", self.name, self.url)
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct Nodes {
    pub sub: Vec<Node>,
    pub zj: Vec<Node>,
}
