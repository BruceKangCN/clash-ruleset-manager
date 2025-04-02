drop table if exists rulesets;

create table rulesets
(
    id integer not null primary key,
    ord integer not null, -- apply order (priority) for ruleset
    name text not null default ''
);

drop table if exists rules;

create table rules
(
    id integer not null primary key,
    ruleset_id integer not null,
    grp text not null default '', -- group category name, e.g. gs/zz/ym/ip
    -- TODO: content can be split into multiple expr records, but it's too hard
    -- for flowbite svelte table, which do net have builtin pagination support.
    content text not null default '',
    foreign key(ruleset_id) references rulesets(id)
);
