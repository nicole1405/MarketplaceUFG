# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| PR creation, opening, preparing for review | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| PRs over 400 lines, stacked PRs, review slices | chained-pr | ~/.config/opencode/skills/chained-pr/SKILL.md |
| Update changelog, create release notes, prepare release | changelog-maintenance | ~/.config/opencode/skills/changelog-maintenance/SKILL.md |
| Writing guides, READMEs, RFCs, onboarding, architecture docs | cognitive-doc-design | ~/.config/opencode/skills/cognitive-doc-design/SKILL.md |
| PR feedback, issue replies, reviews, Slack messages | comment-writer | ~/.config/opencode/skills/comment-writer/SKILL.md |
| Create README, generate documentation, initialize project docs | create-readme | ~/.config/opencode/skills/create-readme/SKILL.md |
| Commit changes, create git commit, /commit | git-commit | ~/.config/opencode/skills/git-commit/SKILL.md |
| Go tests, go test coverage, Bubbletea teatest, golden files | go-testing | ~/.config/opencode/skills/go-testing/SKILL.md |
| Creating GitHub issues, bug reports, feature requests | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| Writing JUnit tests, creating unit tests, testing best practices | java-junit | ~/.config/opencode/skills/java-junit/SKILL.md |
| Developing Spring Boot applications, need best practices | java-springboot | ~/.config/opencode/skills/java-springboot/SKILL.md |
| Judgment day, dual review, adversarial review, juzgar | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| Implement SDD tasks from specs and design | sdd-apply | ~/.config/opencode/skills/sdd-apply/SKILL.md |
| Archive completed SDD change by syncing delta specs | sdd-archive | ~/.config/opencode/skills/sdd-archive/SKILL.md |
| Create SDD technical design and architecture approach | sdd-design | ~/.config/opencode/skills/sdd-design/SKILL.md |
| Explore SDD ideas before committing to change | sdd-explore | ~/.config/opencode/skills/sdd-explore/SKILL.md |
| Walk users through SDD workflow on real codebase | sdd-onboard | ~/.config/opencode/skills/sdd-onboard/SKILL.md |
| Create SDD change proposal with intent, scope, approach | sdd-propose | ~/.config/opencode/skills/sdd-propose/SKILL.md |
| Write SDD delta specs with requirements and scenarios | sdd-spec | ~/.config/opencode/skills/sdd-spec/SKILL.md |
| Break SDD change into implementation tasks | sdd-tasks | ~/.config/opencode/skills/sdd-tasks/SKILL.md |
| SDD verification phase, verify change | sdd-verify | ~/.config/opencode/skills/sdd-verify/SKILL.md |
| New skills, agent instructions, documenting AI usage patterns | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| Update skills, skill registry, actualizar skills | skill-registry | ~/.config/opencode/skills/skill-registry/SKILL.md |
| Writing Spring Boot tests, need testing patterns | spring-boot-testing | ~/.config/opencode/skills/spring-boot-testing/SKILL.md |
| Update README, detect outdated content, maintain docs | update-readme | ~/.config/opencode/skills/update-readme/SKILL.md |
| Implementation, commit splitting, chained PRs | work-unit-commits | ~/.config/opencode/skills/work-unit-commits/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- Every PR MUST link an approved issue with `status:approved` label
- Every PR MUST have exactly one `type:*` label
- Branch names MUST match: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$`
- Commit messages MUST follow conventional commits format
- Automated checks must pass before merge is possible
- Blank PRs without issue linkage will be blocked by GitHub Actions

### chained-pr
- Split PRs over 400 changed lines unless maintainer accepts `size:exception`
- Keep each PR reviewable in about ≤60 minutes
- Use one deliverable work unit per PR; keep tests/docs with the unit they verify
- State start, end, prior dependencies, follow-up work, and out-of-scope items in every chained PR
- Every child PR must include a dependency diagram marking the current PR with 📍
- Treat polluted diffs as base bugs: retarget or rebase until only current work unit appears

### changelog-maintenance
- Follow Keep a Changelog format with reverse chronological order
- Use semantic versioning: MAJOR.MINOR.PATCH
- Include dates in ISO 8601 format (YYYY-MM-DD)
- Categorize entries: Added, Changed, Fixed, Deprecated, Removed, Security
- Provide migration guides for breaking changes
- No copying Git logs — write from user's perspective

### cognitive-doc-design
- Lead with the answer — put decision, action, or outcome first
- Progressive disclosure — start with happy path, then add details
- Chunking — group related information into small sections
- Signposting — use headings, labels, callouts, and summaries
- Recognition over recall — prefer tables, checklists, examples over prose
- Design docs so reviewers can verify intent without reconstructing the whole story

### comment-writer
- Be useful fast — start with actionable point
- Be warm and direct — sound like thoughtful teammate
- Keep it short — 1 to 3 short paragraphs or tight bullet list
- Explain why — give technical reason when asking for change
- Match thread language — use Rioplatense Spanish/voseo for Spanish
- No em dashes — use commas, periods, or parentheses instead

### create-readme
- Be concise — don't write lengthy prose, use structure
- Working code — all examples must work, no pseudocode
- Use GFM + Admonitions with `> [!NOTE]`, `> [!WARNING]`
- Minimal emojis — use sparingly for visual hierarchy
- Table of Contents for READMEs longer than ~50 lines
- No redundant sections — skip LICENSE, CONTRIBUTING, CHANGELOG (separate files)

### git-commit
- One logical change per commit
- Present tense: "add" not "added"
- Imperative mood: "fix bug" not "fixes bug"
- Description under 72 characters
- Body is MANDATORY with blank line between description and body
- NEVER commit secrets (.env, credentials.json, private keys)
- NEVER update git config or run destructive commands without explicit request

### go-testing
- Prefer table-driven tests for multiple cases; use `t.Run(tt.name, ...)`
- Test behavior and state transitions, not implementation trivia
- Use `t.TempDir()` for filesystem tests; never rely on real home directory
- Keep integration tests skippable with `testing.Short()`
- For Bubbletea, test `Model.Update()` directly for state changes
- Golden files must be deterministic; update only through repo's `-update` path

### issue-creation
- Blank issues are disabled — MUST use template (bug report or feature request)
- Every issue gets `status:needs-review` automatically on creation
- Maintainer MUST add `status:approved` before any PR can be opened
- Questions go to Discussions, not issues
- Search existing issues before creating duplicates

### java-junit
- Use standard Maven/Gradle project structure with tests in `src/test/java`
- Test classes should have `Test` suffix
- Follow Arrange-Act-Assert (AAA) pattern
- Use `@Test` for test methods, `@BeforeEach`/`@AfterEach` for setup/teardown
- Use `@ParameterizedTest` for data-driven tests
- Use AssertJ for fluent assertions: `assertThat(...).is...`

### java-springboot
- Constructor Injection ALWAYS — never field injection
- Never expose JPA entities to API — use DTOs
- Use Bean Validation everywhere
- Keep transactions short and at service layer
- Use parameterized logging with SLF4J
- Never hardcode secrets — externalize everything
- Use appropriate test slice: `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`

### judgment-day
- Resolve project skills before launching agents
- Launch TWO blind judges in parallel with identical target and criteria
- Wait for both judges before synthesis; never accept partial verdict
- Classify warnings as WARNING (real) only if normal intended use can trigger them
- Ask before fixing Round 1 confirmed issues
- Re-judge in parallel after fixes; repeat until approved or escalated
- Terminal states are only `JUDGMENT: APPROVED` or `JUDGMENT: ESCALATED`

### sdd-apply
- ALWAYS read specs before implementing — specs are acceptance criteria
- ALWAYS follow design decisions — don't freelance different approach
- ALWAYS match existing code patterns and conventions
- If Strict TDD Mode is active, produce TDD Cycle Evidence table
- If workload forecast requires decision and none provided, STOP before writing code
- When applying chained/stacked PR slice, keep batch autonomous

### sdd-archive
- NEVER archive change with CRITICAL issues in verification report
- ALWAYS sync delta specs BEFORE moving to archive
- When merging into existing specs, PRESERVE requirements not mentioned in delta
- Use ISO date format (YYYY-MM-DD) for archive folder prefix
- Archive is AUDIT TRAIL — never delete or modify archived changes

### sdd-design
- ALWAYS read actual codebase before designing — never guess
- Every decision MUST have rationale (the "why")
- Include concrete file paths, not abstract descriptions
- Use project's ACTUAL patterns and conventions
- Keep ASCII diagrams simple — clarity over beauty
- Size budget: Design artifact MUST be under 800 words

### sdd-explore
- ONLY create `exploration.md` when tied to named change
- DO NOT modify any existing code or files
- ALWAYS read real code, never guess about codebase
- Keep analysis CONCISE — orchestrator needs summary, not novel
- If request is too vague to explore, say what clarification is needed

### sdd-onboard
- This is REAL change — not demo; artifacts and code must be production-quality
- Keep each phase narration SHORT — 1-3 sentences
- Always ask before continuing past Phase 3 (proposal)
- Validate improvement fits "small and safe" criteria before proceeding
- Follow all format rules from individual SDD skills

### sdd-propose
- ALWAYS fill in Capabilities section — contract with sdd-spec
- Research `openspec/specs/` first to use correct existing capability names
- Every proposal MUST have rollback plan and success criteria
- Use concrete file paths in "Affected Areas"
- Size budget: Proposal artifact MUST be under 450 words

### sdd-spec
- ALWAYS use Given/When/Then format for scenarios
- ALWAYS use RFC 2119 keywords (MUST, SHALL, SHOULD, MAY)
- Read proposal's Capabilities section first — tells which spec files to create
- Every requirement MUST have at least ONE scenario
- Include both happy path AND edge case scenarios
- MODIFIED requirements MUST be FULL block — copy entire requirement + all scenarios

### sdd-tasks
- Each task MUST be: Specific, Actionable, Verifiable, Small
- Tasks MUST be ordered by dependency
- Testing tasks should reference specific scenarios from specs
- NEVER include vague tasks like "implement feature" or "add tests"
- ALWAYS include Review Workload Forecast at top
- Size budget: Tasks artifact MUST be under 530 words

### sdd-verify
- Read proposal, spec, design, and tasks before judging implementation
- Execute relevant tests; static analysis alone is never verification
- Spec scenario is compliant only when covering test passed at runtime
- Compare specs first, design second, task completion third
- Do not fix issues; report them for orchestrator/user
- If Strict TDD active, load `strict-tdd-verify.md`; if inactive, never load it

### skill-creator
- Skill is runtime instruction contract for LLM, not human documentation
- Do not add `Keywords` section; preserve trigger words in `description`
- References must point to local files
- Keep skill body concise: target 180–450 tokens, max 700, hard max 1000
- Use required structure: Activation Contract, Hard Rules, Decision Gates, Execution Steps, Output Contract, References

### skill-registry
- ALWAYS write `.atl/skill-registry.md` regardless of SDD persistence mode
- ALWAYS save to engram if `mem_save` tool is available
- SKIP `sdd-*`, `_shared`, and `skill-registry` when scanning
- Read SKILL.md files to generate accurate compact rules
- Compact rules MUST be 5-15 lines per skill — concise, actionable, no fluff
- Include ALL convention index files found

### spring-boot-testing
- Test Pyramid: Unit (fast) > Slice (focused) > Integration (complete)
- Use narrowest slice that gives confidence
- AssertJ Style: Fluent, readable assertions over verbose matchers
- Modern APIs: Prefer MockMvcTester and RestTestClient over legacy
- 80+% coverage minimum; focus on meaningful assertions
- Test order: Main scenario → Other paths → Exceptions/Errors

### update-readme
- Test installation commands before documenting
- Run code examples to verify they work
- Verify API matches implementation
- Check badge URLs are valid
- Update version numbers with releases
- Set up automation for continuous maintenance

### work-unit-commits
- Commit by work unit — deliverable behavior, fix, migration, or docs
- Do not commit by file type
- Keep tests with code they verify
- Keep docs with user-visible change they explain
- Each commit should be candidate chained PR when change grows
- SDD workload guard: If >400-line change forecast, group commits into chained PR slices

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/vekzz-dev/Projects/MarketplaceUFG/AGENTS.md | Index — references project conventions |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
