use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ClashDashboardError {
    #[error("IO error")]
    IO(#[from] std::io::Error),
    #[error("JSON error")]
    Json(#[from] serde_json::Error),
    #[error("unknown error")]
    Unknown,
}

// HACK: return type of commands must be Serializable, but you can't impl foreign
// trait `Serialize` for foreign types like `std::io::Error`, so just Serialize
// inner error as string to bypass this restriction.
impl Serialize for ClashDashboardError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

pub type Result<T> = std::result::Result<T, ClashDashboardError>;
