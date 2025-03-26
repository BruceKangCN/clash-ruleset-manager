use std::{collections::HashMap, path::Path};

use serde::{Deserialize, Serialize};
use tokio::fs::File;

use crate::error::Result;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Rule {
    pub id: isize,
    pub name: String,
    pub files: Files,
}

impl Rule {
    pub fn fill_file(&mut self, ty: &str, name: String) {
        if ty == "zz" {
            self.files.zz = Some(name);
        } else if ty == "gs" {
            self.files.gs = Some(name);
        } else if ty == "ym" {
            self.files.ym = Some(name);
        } else if ty == "ip" {
            self.files.ip = Some(name);
        }
    }

    pub async fn create_missing_file(&mut self, dir: impl AsRef<Path>) -> Result<()> {
        if let None = self.files.zz {
            let filename = format!("{}_{}_{}.txt", self.id, &self.name, "zz");
            File::create(dir.as_ref().join(&filename)).await?;
            self.files.zz = Some(filename);
        }
        if let None = self.files.gs {
            let filename = format!("{}_{}_{}.txt", self.id, &self.name, "gs");
            File::create(dir.as_ref().join(&filename)).await?;
            self.files.zz = Some(filename);
        }
        if let None = self.files.ym {
            let filename = format!("{}_{}_{}.txt", self.id, &self.name, "ym");
            File::create(dir.as_ref().join(&filename)).await?;
            self.files.zz = Some(filename);
        }
        if let None = self.files.ip {
            let filename = format!("{}_{}_{}.txt", self.id, &self.name, "ip");
            File::create(dir.as_ref().join(&filename)).await?;
            self.files.zz = Some(filename);
        }

        Ok(())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct Files {
    pub zz: Option<String>,
    pub gs: Option<String>,
    pub ym: Option<String>,
    pub ip: Option<String>,
}

pub type RuleMap = HashMap<isize, Rule>;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateInfo {
    /// rule name prefix in `{id}_{name}` format
    pub original: String,

    pub new_order: isize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Node {
    pub r#type: Option<String>,
    pub name: String,
    pub url: String,
}

impl Node {
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
