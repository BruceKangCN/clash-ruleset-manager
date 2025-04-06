# Clash Ruleset Manager

a tauri desktop app to manage clash rulesets.

function:

- add ruleset
- remove ruleset
- modify ruleset name or content
- reorder ruleset with drag and drop support

It read rules from file `{order}_{name}_{group}.txt`, where `order` is a positive integer, `name` and `group` are strings, e.g. `2_proxy_gs.txt`. Then it create a rule group `group` for ruleset `name`.

The rule group file is a line separated text file. Each line is parsed to one rule. e.g. for file `1_DIRECT_ip.txt`:

```text
127.0.0.1
192.168.0.1
```

is parsed to rules

```yaml
rules:
    - IP-CIDR,127.0.0.1,DIRECT
    - IP-CIDR,192.168.0.1,DIRECT
```
