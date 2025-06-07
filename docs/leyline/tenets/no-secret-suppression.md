---
id: no-secret-suppression
last_modified: '2025-05-08'
---

# Tenet: Confront Issues, Don't Suppress Warnings

Never disable or bypass quality safeguards without clear, documented justification.
Treat linter warnings, type errors, and test failures as valuable signals pointing to
potential problems that deserve proper resolution, not inconvenient noise to be
silenced.

## Core Belief

Software quality tools—linters, type checkers, test suites, security scanners—represent
your first and most reliable line of defense against defects. These automated guardians
work tirelessly to catch issues early, when they're least expensive to fix. Every time
you disable or bypass them without addressing the underlying issue, you're not just
ignoring a minor inconvenience; you're consciously choosing to introduce risk into your
system.

Think of code quality warnings like warning lights on a car's dashboard. When your car's
check engine light comes on, covering it with tape doesn't fix the engine—it just
ensures you won't know when the problem gets worse. Similarly, suppressing a linter
warning or type error doesn't resolve the underlying issue; it merely hides the symptom
while allowing the root cause to persist or even worsen over time. Just as experienced
drivers know to address warning lights promptly, experienced developers recognize that
warnings are valuable signals that deserve attention, not annoyances to be suppressed.

The temptation to suppress warnings often comes from immediate pressure: a looming
deadline, a complex legacy system, or the frustration of fighting with a tool that seems
too strict. However, these momentary conveniences accrue as hidden technical debt that
compounds over time. Each suppressed warning potentially represents a future bug,
security vulnerability, or maintenance obstacle that will cost far more to address later
than it would to fix now. What begins as a single suppression can gradually become a
culture where bypassing safeguards is the default response to warnings.

This principle isn't about blind adherence to tools or treating every warning as
critical. There are legitimate cases where suppressions are appropriate—for instance,
when a rule has false positives in specific contexts or when integrating with
third-party code you can't modify. The key distinction is transparency and
justification: secret suppressions hide problems, while properly documented exceptions
acknowledge the risk with clear rationale that helps future developers understand the
reasoning behind the exception.

## Practical Guidelines

1. **Address Root Causes, Not Symptoms**: When faced with a warning or error, focus on
   resolving the underlying issue rather than suppressing the message. Ask yourself:
   "What is this warning trying to tell me about my code?" Quality tools rarely flag
   issues without reason—they're identifying patterns that have historically led to
   problems. Understand why the rule exists before considering whether an exception is
   truly warranted. Remember that the quickest solution (suppression) is rarely the best
   solution for long-term code health.

1. **Document Any Necessary Exceptions**: In the rare cases where suppressions are
   genuinely needed, document them thoroughly. Ask yourself: "Will someone who finds
   this suppression understand exactly why it's here?" Include a clear explanation of
   why the rule doesn't apply in this specific case, what alternative measures ensure
   safety, who made the decision, and ideally, a ticket reference for future
   reconsideration. This transforms a dangerous "secret suppression" into a transparent,
   justified exception that future maintainers can evaluate.

1. **Make Suppressions Visible During Review**: Ensure that any quality tool
   suppressions are explicitly highlighted during code review. Ask yourself: "Would I be
   comfortable explaining this suppression to the most senior engineer on the team?"
   Normalizing the discussion of suppressions helps maintain a culture where they're
   treated as significant exceptions requiring justification rather than routine
   shortcuts. This visibility also spreads knowledge about when exceptions are
   appropriate and when they're not.

1. **Regularly Audit Existing Suppressions**: Set up a practice of periodically
   reviewing existing suppressions to determine if they're still necessary. Ask
   yourself: "Has the context changed since this suppression was added?" Codebases
   evolve, and suppressions that were once necessary might no longer be needed.
   Similarly, temporary suppressions added during crunch times often become permanent by
   default unless they're explicitly revisited. Create a process or schedule for
   reevaluating suppressions, treating them as technical debt to be addressed when
   possible.

1. **Adapt Global Rules When Patterns Emerge**: If you find your team repeatedly
   suppressing the same rule across the codebase, consider whether the rule itself
   should be modified globally. Ask yourself: "Is this rule providing value in our
   specific context, or is it generating more noise than signal?" Not all default rules
   in quality tools will align perfectly with your project's needs. It's better to
   thoughtfully adjust a global rule configuration than to accumulate dozens of
   individual suppressions. However, be cautious about weakening rules without careful
   consideration of the security or quality implications.

## Warning Signs

- **Empty or vague suppression comments** that fail to explain the justification.
  Comments like `// eslint-disable-line - needed here` or `// noqa` without any
  explanation leave future developers completely in the dark about why a quality rule
  was bypassed. This lack of context makes it impossible to evaluate whether the
  suppression is still necessary or was appropriate in the first place. Over time, these
  unexplained suppressions accumulate, creating an environment where disabling rules
  becomes normalized and unquestioned.

- **Type assertions or casts used to silence the type system** rather than addressing
  type safety issues. Constructs like TypeScript's `as any` or C#'s unsafe casts often
  indicate that developers are fighting against the type system instead of working with
  it. These type suppressions are particularly dangerous because they eliminate one of
  your strongest safeguards against runtime errors, pushing problems from compile time
  to production where they're much more costly to discover and fix.

- **High concentration of suppressions** in specific files or modules, suggesting
  quality problems are being hidden rather than addressed. When a single file contains
  numerous suppressed warnings, it's rarely a coincidence—it's usually a sign of deeper
  architectural issues or technical debt. These suppression clusters act as a form of
  technical debt camouflage, making problematic code appear cleaner than it actually is
  and discouraging the refactoring that would address root causes.

- **Command-line flags that bypass verification steps** in development or deployment
  workflows. Options like `--no-verify` for Git hooks, `--force` for deployments, or
  `--skip-tests` for builds remove entire categories of safeguards at once. When these
  flags become routine parts of workflows rather than rare exceptions, they undermine
  the entire quality infrastructure. Listen for team members sharing these flags as
  "tips" or "shortcuts" without appropriate cautions about their risks.

- **"Implementation detail" justifications** for suppressions that aren't actually
  temporary. Comments like "TODO: Fix this later" or "Temporary workaround" that persist
  for months or years indicate suppressions that were added with good intentions but
  never addressed. These supposedly temporary exceptions often become permanent parts of
  the codebase through inertia. Pay special attention to suppressions with dates or
  sprint references that are long past.

- **Different standards for different team members** regarding quality suppressions. If
  senior developers can suppress warnings freely while junior developers face scrutiny,
  or if suppressions in legacy code are acceptable but not in new features, these double
  standards create confusion and resentment. Inconsistent enforcement leads to
  inconsistent quality and sends mixed messages about the team's actual values versus
  its stated principles.

- **Declining quality metrics despite passing builds** as suppressions hide mounting
  problems. When your build is green but bug reports are increasing, regressions are
  frequent, or onboarding new developers is becoming harder, it may indicate that
  quality issues are being suppressed rather than addressed. This disconnect between
  apparent quality (passing builds) and actual quality (production issues) often points
  to excessive use of suppressions masking real problems.

## Related Tenets

- [Automation](automation.md): The "No Secret Suppressions" tenet strengthens your
  automation practices by ensuring automated checks remain effective and meaningful.
  While automation establishes the quality guardrails, this tenet ensures those
  guardrails aren't bypassed. Together, they create a virtuous cycle where quality tools
  catch issues early and those issues are appropriately addressed rather than
  suppressed, continuously reinforcing the value of the automation.

- [Explicit is Better than Implicit](explicit-over-implicit.md): Properly documenting
  quality suppressions aligns perfectly with making intentions explicit. Secret
  suppressions are implicit decisions hidden in the code, while documented exceptions
  make the reasoning explicit and transparent. These tenets work together to ensure that
  all important decisions—including when to make exceptions to rules—are clearly
  communicated and visible to everyone working with the code.

- [Maintainability](maintainability.md): By addressing issues rather than suppressing
  warnings, you improve long-term maintainability. Secret suppressions create
  maintenance landmines where future developers can't understand why certain patterns
  were allowed or what risks might be associated with them. Both tenets prioritize the
  future health of the codebase over short-term convenience, recognizing that
  investments in quality today pay dividends in reduced maintenance costs tomorrow.

- [Document Decisions](document-decisions.md): When suppressions are necessary, this
  tenet connects directly with documenting the decision properly. The "why" behind a
  suppression is exactly the kind of critical context that Document Decisions emphasizes
  preserving. Together, these tenets ensure that when exceptions to quality rules are
  made, the reasoning is preserved for future developers who will need to understand or
  reevaluate those decisions.
