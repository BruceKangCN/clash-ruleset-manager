import SQLite3 from "better-sqlite3";

export const db = new SQLite3(":memory:");
