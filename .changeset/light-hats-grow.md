---
'@ondrej-langr/bob': minor
---

BREAKING: Workspace of a package can no longer be accessed through static property of a Project instance. Instead please use async method `Workspace.loadNearest()` which tries to find the nearest workspace for current provided directory.
