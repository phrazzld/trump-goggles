---
id: git-repository-integrity
last_modified: '2025-06-24'
version: '0.1.0'
derived_from: maintainability
enforced_by: 'git configuration, automated validation, pre-receive hooks, CI checks'
---
# Binding: Maintain Git Repository Integrity at Scale

Protect repository integrity through disciplined history management, intelligent garbage collection, and pragmatic strategies for handling large files. A healthy repository that performs well after years of development is not an accident—it's the result of consistent practices that prevent degradation.

## Rationale

This binding implements our maintainability tenet specifically for Git repositories, recognizing that repository health directly impacts developer productivity. A repository is like a shared workspace—when it's well-organized and performant, everyone works efficiently. When it becomes cluttered with large files, tangled history, and accumulated cruft, every operation slows down and developers waste time fighting the tool instead of solving problems.

Git was designed to be fast and efficient, but it assumes certain usage patterns. When teams violate these assumptions—checking in large binary files, creating massive numbers of tiny commits, or maintaining thousands of stale branches—Git's performance degrades dramatically. What starts as a quick clone becomes a multi-gigabyte download. Simple operations like `git status` start taking seconds instead of milliseconds. Eventually, the repository becomes so unwieldy that teams consider starting fresh, losing valuable history in the process.

The solution isn't to baby Git or restrict its use—it's to understand its design constraints and work within them. Just as you wouldn't use a database without indexes or let log files grow indefinitely, you shouldn't use Git without considering repository health. By establishing clear practices around file size limits, history maintenance, and branch hygiene, you ensure the repository remains a productive tool rather than a burden.

## Rule Definition

**Repository Health Requirements:**

- **Binary and Large File Management**:
  - Files over 10MB must use Git LFS or external storage
  - Binary assets should be versioned separately from code
  - Build artifacts must never be committed
  - Generated files belong in .gitignore, not the repository

- **History Hygiene**:
  - Squash merge for feature branches to maintain linear history
  - No merge commits from long-lived branches into feature branches
  - Force pushes only allowed on personal branches, never shared ones
  - Commit messages must be meaningful and follow conventions

- **Branch Lifecycle Management**:
  - Delete merged branches immediately (automated via platforms)
  - Stale branches (>30 days) should be archived or deleted
  - Branch names must follow consistent patterns
  - No branches from ancient commits (>6 months old)

- **Repository Size Control**:
  - Total repository size should stay under 1GB
  - Individual pack files should stay under 100MB
  - Regular garbage collection for active repositories
  - Aggressive GC after large file removals

- **Performance Standards**:
  - Fresh clone should complete in under 2 minutes
  - Git status should respond in under 1 second
  - Branch switching should be near-instantaneous
  - Common operations shouldn't require excessive memory

## Practical Implementation

1. **Configure Git LFS for Large Files**: Prevent large files from bloating the repository:

   ```bash
   # Initialize Git LFS in repository
   git lfs install

   # Track common large file patterns
   git lfs track "*.psd"
   git lfs track "*.zip"
   git lfs track "*.mp4"
   git lfs track "*.jpg"
   git lfs track "*.png"

   # Add attributes file to repository
   git add .gitattributes
   git commit -m "chore: configure Git LFS for large files"

   # Migrate existing large files
   git lfs migrate import --include="*.psd,*.zip" --everything
   ```

2. **Implement Branch Protection Rules**: Enforce history hygiene automatically:

   ```yaml
   # GitHub branch protection (via API or UI)
   protection_rules:
     - pattern: main
       required_status_checks:
         strict: true
         contexts: ["ci/build", "ci/test"]
       enforce_admins: true
       required_pull_request_reviews:
         dismiss_stale_reviews: true
         require_code_owner_reviews: true
       restrictions:
         users: []
         teams: ["maintainers"]
       allow_force_pushes: false
       allow_deletions: false
       required_linear_history: true  # Enforce squash/rebase
       delete_branch_on_merge: true   # Auto-cleanup
   ```

3. **Automate Repository Maintenance**: Keep the repository healthy with automation:

   ```bash
   #!/bin/bash
   # maintenance.sh - Run weekly via CI

   # Remove stale remote tracking branches
   git remote prune origin

   # Garbage collect with aggressive settings
   git gc --aggressive --prune=now

   # Check repository size
   SIZE=$(du -sh .git | cut -f1)
   echo "Repository size: $SIZE"

   # Find and report large objects
   git rev-list --objects --all |
     git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' |
     sed -n 's/^blob //p' |
     sort --numeric-sort --key=2 |
     tail -20 |
     cut -c 1-12,41- |
     $(command -v gnumfmt || echo numfmt) --field=2 --to=iec-i --suffix=B --padding=7 --round=nearest
   ```

4. **Implement Pre-receive Hooks**: Prevent problems before they enter the repository:

   ```bash
   #!/bin/bash
   # pre-receive hook - Enforce file size limits

   MAX_FILE_SIZE=10485760  # 10MB in bytes

   while read oldrev newrev refname; do
     # Check all new objects
     for file in $(git diff --name-only $oldrev..$newrev); do
       # Get blob SHA for the file in the new commit
       blob_sha=$(git ls-tree -r "$newrev" -- "$file" | awk '{print $3}')
       if [ -n "$blob_sha" ]; then
         size=$(git cat-file -s "$blob_sha" 2>/dev/null || echo 0)
         if [ $size -gt $MAX_FILE_SIZE ]; then
           echo "Error: File $file is too large ($size bytes)"
           echo "Files over 10MB must use Git LFS"
           exit 1
         fi
       fi
     done

     # Check commit messages
     for commit in $(git rev-list $oldrev..$newrev); do
       msg=$(git log -1 --pretty=%B $commit)
       if ! echo "$msg" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+'; then
         echo "Error: Commit $commit does not follow conventional commit format"
         exit 1
       fi
     done
   done
   ```

5. **Monitor Repository Health**: Track metrics and alert on degradation:

   ```yaml
   # .github/workflows/repo-health.yml
   name: Repository Health Check
   on:
     schedule:
       - cron: '0 0 * * 0'  # Weekly

   jobs:
     health-check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
           with:
             fetch-depth: 0

         - name: Check repository size
           run: |
             SIZE=$(du -sh .git | cut -f1)
             echo "Repository size: $SIZE"
             # Alert if over 800MB
             if [ $(du -s .git | cut -f1) -gt 819200 ]; then
               echo "::warning::Repository approaching 1GB limit"
             fi

         - name: Check clone time
           run: |
             TIME=$(time -p git clone --depth 1 . /tmp/test-clone 2>&1 | grep real | awk '{print $2}')
             echo "Shallow clone time: ${TIME}s"

         - name: Find large files not in LFS
           run: |
             git lfs ls-files | cut -d' ' -f3 > lfs-files.txt
             find . -type f -size +10M | grep -vFf lfs-files.txt || true
   ```

## Examples

```bash
# ❌ BAD: Committing large binary files directly
git add design-assets/mockup.psd  # 50MB file
git commit -m "Add design mockup"
git push
# Repository size explodes, clones become slow

# ✅ GOOD: Using Git LFS for large files
git lfs track "*.psd"
git add .gitattributes
git commit -m "chore: track PSD files with Git LFS"
git add design-assets/mockup.psd
git commit -m "feat(design): add homepage mockup"
git push
# Only pointer stored in Git, actual file in LFS
```

```bash
# ❌ BAD: Accumulating thousands of stale branches
git branch -r | wc -l
# 3847
git clone https://github.com/company/project
# Cloning... (10 minutes later still downloading refs)

# ✅ GOOD: Automated branch cleanup
# Configure auto-deletion on merge
git config remote.origin.prune true
# Regular cleanup of stale branches
git remote prune origin
git branch -r | grep -E 'feature/.*-2020' | xargs -n 1 git push --delete origin
```

```bash
# ❌ BAD: Messy history from merge commits
git log --oneline --graph
# *   Fix bug
# |\
# | * WIP
# | * More WIP
# | * Merge branch 'main' into feature
# | |\
# | | * Another fix
# | * | Debugging
# | * | Merge branch 'main' into feature
# Impossible to understand what actually changed

# ✅ GOOD: Clean history from squash merges
git log --oneline
# abc1234 feat(auth): implement OAuth2 integration (#123)
# def5678 fix(api): handle null responses gracefully (#122)
# ghi9012 refactor(db): optimize query performance (#121)
# Clear, linear history with meaningful commits
```

## Related Bindings

- [version-control-workflows.md](version-control-workflows.md): Repository integrity practices support version control workflows by ensuring the repository remains performant and usable. Both bindings work together to create sustainable development practices.

- [automated-quality-gates.md](automated-quality-gates.md): Automated validation of repository health metrics ensures integrity standards are maintained. Quality gates prevent repository degradation before it impacts developer productivity.

- [technical-debt-tracking.md](technical-debt-tracking.md): Repository cruft is a form of technical debt that compounds over time. Both bindings emphasize proactive maintenance to prevent small issues from becoming major problems.

- [performance-testing-standards.md](performance-testing-standards.md): Repository performance directly impacts developer productivity. Monitoring clone times and operation speed ensures the repository remains a productive tool.
