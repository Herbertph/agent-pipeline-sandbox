---
name: feature
description: Run the full feature pipeline (requirements, development, testing) and open a pull request for human review.
argument-hint: [describe the feature in your own words]
disable-model-invocation: true
---

# Feature pipeline

Feature request from the user:

$ARGUMENTS

You are the orchestrator. Delegate each stage to its subagent. Do not write specs, production code or tests yourself: your job is to route work between agents, enforce the gates below, and open the pull request.

## 0. Branch

- Derive a short kebab-case slug from the request, for example `password-reset`.
- Check the current branch. If it is `main` or `master`, create and switch to `feature/<slug>`. Otherwise (for example in a `claude --worktree` session) stay on the current branch.
- If the working tree has uncommitted changes unrelated to this feature, stop and ask the user.
- Every stage works on this one branch. Never commit to `main` or `master`.

## 1. Requirements → `requirements-analyst`

- Pass the user's request verbatim, plus the slug. Ask for `docs/specs/<slug>.md`.
- **Gate:** if it returns blocking questions, ask the user all of them in one message, send the answers back to the analyst to update the spec, and repeat until no blocking questions remain.
- Commit the spec with `docs(spec): <slug>`.

## 2. Development → `developer`

- Pass the spec path and ask it to implement every acceptance criterion and commit its work.
- **Gate:** it must report that the existing build, lint, type-check and test commands pass, or that the project has none.

## 3. Testing → `tester`

- Pass the spec path and the list of files the developer changed. Do not pass the developer's reasoning: the tester judges the result against the spec, not against the developer's intent.
- The tester returns PASS or FAIL, with bug reports.

## 4. Fix loop

- On FAIL, send the bug reports verbatim to the developer, then run the tester again on the new commits.
- At most 3 fix rounds. If bugs remain after the third, stop looping and go to step 5 with a draft PR.
- If the tester reports a problem with the spec itself rather than the code, go back to step 1 for that part.

## 5. Pull request

- Push the branch with `git push -u origin <branch>`.
- Open the PR with `gh pr create`, using the body template below. Add `--draft` if any critical or major bug is unresolved.
- Never merge, approve or close the PR. The user is the only approver.
- Finish by giving the user the PR link and a two-line summary.

## PR body template

```markdown
## Summary
What changed and why, in 2-4 lines.

## Spec
`docs/specs/<slug>.md`

## Acceptance criteria
| AC | Test(s) | Result |
|----|---------|--------|
| AC-1 | `test name` | ✅ / ❌ |

## Test report
`docs/test-reports/<slug>.md`: <n> tests, <n> passed, <n> failed

## Assumptions
Assumptions from the spec that the reviewer should confirm.

## Known issues
Unresolved bugs with severity, or "None".

## How to verify manually
2-5 steps the reviewer can follow.
```
