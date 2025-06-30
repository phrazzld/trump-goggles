---
id: git-automation-assistance
last_modified: '2025-06-24'
version: '0.1.0'
derived_from: joyful-version-control
enforced_by: 'git aliases, automated scripts, CI/CD pipelines, git hooks, workflow tools'
---

# Binding: Implement Assistive Git Automation

Create Git automation that acts as a helpful assistant rather than a rigid enforcer. Automation should guide developers toward best practices while respecting their autonomy and working style, making the right thing to do also the easiest thing to do.

## Rationale

This binding implements our joyful version control tenet by ensuring automation enhances rather than constrains developer workflows. When automation feels like a helpful colleague rather than a bureaucratic gatekeeper, developers embrace it enthusiastically and work more effectively.

Think of good Git automation like a skilled sous chef in a kitchen. The sous chef doesn't tell the head chef how to cook or prevent creative experimentation. Instead, they handle repetitive prep work, ensure ingredients are ready when needed, and catch potential problems before they become disasters. They make suggestions without being pushy and step back when the chef needs to work directly. This assistive approach makes cooking more enjoyable and productive.

Bad automation, by contrast, feels like a micromanaging supervisor—constantly interrupting, enforcing rigid rules without context, and preventing legitimate work with inflexible checks. This kind of automation breeds resentment and workarounds. Developers spend energy fighting the automation rather than benefiting from it, ultimately making everyone less productive and less happy.

## Rule Definition

Assistive Git automation follows these principles:

- **Suggest, Don't Force**: Automation should guide developers toward best practices while allowing informed decisions to override suggestions when appropriate.

- **Provide Context**: When automation intervenes, it should explain why and offer alternatives, not just say "no."

- **Respect Developer Time**: Automation should be fast, reliable, and unobtrusive. Long-running checks should be asynchronous where possible.

- **Learn and Adapt**: Automation should recognize patterns and adapt to team workflows rather than forcing teams to adapt to it.

- **Fail Gracefully**: When automation fails, it should do so in ways that don't block work and provide clear paths forward.

- **Enhance, Don't Replace**: Automation should enhance human judgment, not attempt to replace it. Keep humans in the loop for decisions requiring context.

## Practical Implementation

1. **Create Intelligent Git Aliases**: Build aliases that provide helpful guidance:

   ```bash
   # ~/.gitconfig - Assistive aliases that guide rather than force
   [alias]
     # Smart commit that suggests improvements
     ci = "!f() { \
       msg=\"$1\"; \
       if [ ${#msg} -gt 72 ]; then \
         echo \"📏 Commit message is ${#msg} chars (recommended: 50-72)\"; \
         echo \"💡 Consider a shorter summary with details in the body\"; \
         read -p \"Continue anyway? [y/N] \" -n 1 -r; \
         echo; \
         [[ ! $REPLY =~ ^[Yy]$ ]] && return 1; \
       fi; \
       if ! echo \"$msg\" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)'; then \
         echo \"💡 Consider using conventional commit format:\"; \
         echo \"   feat: add new feature\"; \
         echo \"   fix: resolve bug\"; \
         echo \"   docs: update documentation\"; \
         read -p \"Continue with current message? [y/N] \" -n 1 -r; \
         echo; \
         [[ ! $REPLY =~ ^[Yy]$ ]] && return 1; \
       fi; \
       git commit -m \"$msg\"; \
     }; f"

     # Helpful PR creation with template
     pr-create = "!f() { \
       echo \"🚀 Creating pull request...\"; \
       current=$(git branch --show-current); \
       echo \"Branch: $current\"; \
       if [[ ! \"$current\" =~ ^(feature|bugfix|hotfix)/ ]]; then \
         echo \"⚠️  Non-standard branch name detected\"; \
         echo \"💡 Consider using feature/, bugfix/, or hotfix/ prefixes\"; \
       fi; \
       echo \"\"; \
       echo \"Recent commits:\"; \
       git log origin/main..HEAD --oneline | head -5; \
       echo \"\"; \
       echo \"📝 Opening PR template in editor...\"; \
       gh pr create --draft; \
     }; f"
   ```

2. **Implement Smart Pre-commit Hooks**: Create hooks that assist rather than block:

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit - Assistive pre-commit hook

   echo "🔍 Running pre-commit checks..."

   # Check for common issues but allow override
   issues_found=false

   # Large file check with helpful message
   large_files=$(git diff --cached --name-only | xargs -I {} find {} -size +1M 2>/dev/null)
   if [ -n "$large_files" ]; then
     echo "📦 Large files detected:"
     echo "$large_files" | while read file; do
       size=$(du -h "$file" | cut -f1)
       echo "   - $file ($size)"
     done
     echo "💡 Consider using Git LFS for large files"
     echo "   Documentation: https://git-lfs.github.com"
     issues_found=true
   fi

   # Debugging code check with suggestions
   if git diff --cached | grep -E "(console\.log|debugger|TODO:|FIXME:)" > /dev/null; then
     echo "🔍 Found debugging/temporary code:"
     git diff --cached --name-only | xargs grep -n -E "(console\.log|debugger|TODO:|FIXME:)" | head -5
     echo "💡 Consider removing or addressing these before committing"
     issues_found=true
   fi

   # If issues found, ask for confirmation
   if [ "$issues_found" = true ]; then
     echo ""
     read -p "Issues detected. Continue with commit? [y/N] " -n 1 -r
     echo ""
     if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       echo "✅ Commit cancelled. Address issues and try again."
       exit 1
     fi
     echo "⚠️  Proceeding with commit despite warnings..."
   else
     echo "✅ All checks passed!"
   fi
   ```

3. **Build Workflow Assistants**: Create scripts that guide complex operations:

   ```bash
   #!/bin/bash
   # git-release-assistant - Interactive release helper

   echo "🎉 Release Assistant"
   echo "==================="

   # Check current branch
   current_branch=$(git branch --show-current)
   if [[ "$current_branch" != "main" ]]; then
     echo "📍 You're on branch: $current_branch"
     echo "💡 Releases are typically created from 'main'"
     read -p "Continue from current branch? [y/N] " -n 1 -r
     echo
     [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
   fi

   # Check for uncommitted changes
   if ! git diff-index --quiet HEAD --; then
     echo "⚠️  You have uncommitted changes"
     echo "💡 Consider committing or stashing before release"
     git status --short
     read -p "Continue anyway? [y/N] " -n 1 -r
     echo
     [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
   fi

   # Suggest version based on commits
   echo "📊 Recent commits since last tag:"
   last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
   if [ "$last_tag" != "none" ]; then
     git log "$last_tag..HEAD" --oneline | head -10

     # Analyze commits for version suggestion
     if git log "$last_tag..HEAD" --oneline | grep -q "BREAKING CHANGE"; then
       echo "💡 Found breaking changes - suggest MAJOR version bump"
     elif git log "$last_tag..HEAD" --oneline | grep -qE "^feat"; then
       echo "💡 Found new features - suggest MINOR version bump"
     else
       echo "💡 Only fixes/chores - suggest PATCH version bump"
     fi
   fi

   # Interactive version selection
   read -p "Version number for this release: " version

   # Create release with assistance
   echo "📝 Creating release $version..."
   echo "💡 I'll generate a changelog from your commits"

   # ... rest of release process with helpful guidance
   ```

4. **Implement Adaptive Automation**: Create automation that learns from patterns:

   ```bash
   # git-smart-merge - Learns from merge conflict patterns
   #!/bin/bash

   # Track merge conflict patterns
   conflict_log=~/.git-conflict-patterns

   # Before merge, check for known problematic file combinations
   echo "🔮 Checking for potential conflicts..."

   target_branch=$1
   conflicting_files=$(git diff --name-only HEAD.."$target_branch")

   # Check history for these files
   while IFS= read -r file; do
     if grep -q "$file" "$conflict_log" 2>/dev/null; then
       echo "⚠️  $file has caused conflicts before"
       echo "💡 Recent resolution:"
       grep "$file" "$conflict_log" | tail -1 | cut -d'|' -f3
     fi
   done <<< "$conflicting_files"

   # Proceed with merge
   git merge "$target_branch"

   # If conflicts occurred, learn from resolution
   if [ $? -ne 0 ]; then
     echo "📝 Recording conflict pattern for future assistance..."
     # Record pattern after resolution
   fi
   ```

5. **Provide Non-Blocking CI Integration**: Set up CI that informs without blocking:

   ```yaml
   # .github/workflows/assistive-checks.yml
   name: Assistive Code Quality Checks

   on:
     pull_request:
       types: [opened, synchronize]

   jobs:
     quality-suggestions:
       runs-on: ubuntu-latest
       # Non-blocking job
       continue-on-error: true

       steps:
         - uses: actions/checkout@v3

         - name: Code Quality Suggestions
           run: |
             echo "## 💡 Code Quality Suggestions" >> $GITHUB_STEP_SUMMARY
             echo "" >> $GITHUB_STEP_SUMMARY

             # Check for opportunities, not problems
             echo "### Performance Opportunities:" >> $GITHUB_STEP_SUMMARY
             # ... run performance analysis ...

             echo "### Refactoring Suggestions:" >> $GITHUB_STEP_SUMMARY
             # ... run complexity analysis ...

         - name: Post Helpful Comment
           uses: actions/github-script@v6
           with:
             script: |
               const suggestions = core.getInput('suggestions');
               if (suggestions) {
                 github.rest.issues.createComment({
                   issue_number: context.issue.number,
                   owner: context.repo.owner,
                   repo: context.repo.repo,
                   body: `## 🤖 Automation Assistant\n\n${suggestions}\n\n_These are suggestions to help improve your code. Feel free to address them or explain why they don't apply._`
                 });
               }
   ```

6. **Create Helpful Error Recovery**: Make error messages assistive:

   ```bash
   # Wrap Git commands with helpful error handling
   git() {
     command git "$@"
     status=$?

     if [ $status -ne 0 ]; then
       case "$1" in
         push)
           if [[ "$*" == *"--force"* ]]; then
             echo "💡 Force push failed. Try: git push --force-with-lease"
           elif [[ "$*" == *"rejected"* ]]; then
             echo "💡 Push rejected. Try: git pull --rebase origin $(git branch --show-current)"
           fi
           ;;
         merge)
           echo "💡 Merge failed. Options:"
           echo "   - Fix conflicts and: git add . && git merge --continue"
           echo "   - Abort merge: git merge --abort"
           echo "   - See conflict details: git diff"
           ;;
         rebase)
           echo "💡 Rebase failed. Options:"
           echo "   - Fix conflicts and: git add . && git rebase --continue"
           echo "   - Skip this commit: git rebase --skip"
           echo "   - Abort rebase: git rebase --abort"
           ;;
       esac
     fi

     return $status
   }
   ```

## Examples

```bash
# ❌ BAD: Rigid automation that blocks work
Error: Commit message does not match pattern /^[A-Z]{2,4}-[0-9]+: .+$/
Commit rejected.

# ✅ GOOD: Assistive automation that guides
📝 Commit message: "fix login bug"
💡 This doesn't follow our conventional format. Consider:
   "fix: resolve login timeout issue"
   "fix(auth): prevent login failures on slow connections"

Would you like to:
1) Edit the message
2) Continue with current message
3) See examples
Choice [1-3]:
```

```bash
# ❌ BAD: Blocking pre-push hook with no context
Push rejected: Branch name invalid
Valid format: /^[a-z]+-[A-Z]+-[0-9]+$/

# ✅ GOOD: Helpful pre-push guidance
🌿 Branch name: "fix-login-timeout"
💡 This doesn't include a ticket number. Consider:
   - "bugfix/PROJ-123-fix-login-timeout" (recommended)
   - Link the ticket in your commit message
   - Add ticket to PR description

Push anyway? [y/N] (your choice is logged for pattern analysis)
```

```bash
# ❌ BAD: CI failure with cryptic message
Build failed: Error in module X
See logs for details.

# ✅ GOOD: CI provides helpful context and suggestions
## 🔍 Build Issue Detected

**What happened:** Module 'user-auth' failed to compile
**Likely cause:** Missing dependency after recent package.json change

**Suggested fixes:**
1. Run `npm install` locally and commit the lockfile
2. Check if new environment variables are needed
3. Recent similar issue: #345 (fixed by updating Node version)

**Not blocking merge** - but addressing this will prevent runtime issues.
```

## Related Bindings

- [git-hooks-automation.md](git-hooks-automation.md): Git hooks are a primary vehicle for assistive automation, providing real-time guidance during Git operations while respecting developer autonomy.

- [forgiving-git-workflows.md](forgiving-git-workflows.md): Assistive automation supports forgiving workflows by providing help when things go wrong rather than rigid prevention that frustrates developers.

- [human-readable-commit-history.md](human-readable-commit-history.md): Automation can guide developers toward writing better commit messages through suggestions and templates rather than strict enforcement.

- [automate-changelog.md](automate-changelog.md): Assistive automation can generate changelogs while allowing developers to edit and enhance them, combining automation efficiency with human insight.
