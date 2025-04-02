use std::fmt::Debug;

use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

#[derive(Serialize, Deserialize, FromRow, Clone, Debug)]
pub struct RuleSet {
    pub id: u32,
    pub ord: u32,
    pub name: String,
}

#[derive(Serialize, Deserialize, FromRow, Clone, Debug)]
pub struct Rule {
    pub id: u32,
    pub ruleset_id: u32,
    pub grp: String,
    pub content: String,
}
