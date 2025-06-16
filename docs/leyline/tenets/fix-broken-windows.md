---
id: fix-broken-windows
last_modified: '2025-06-02'
version: '0.1.0'
---
# Tenet: Don't Live with Broken Windows

Address quality problems immediately when they're discovered. Small defects, poor
design decisions, and technical shortcuts create an environment where larger problems
feel acceptable. Maintaining high standards consistently prevents the gradual decay
that makes codebases unmaintainable over time.

## Core Belief

The broken windows theory, originally from criminology, applies powerfully to software
development. Just as a building with broken windows invites further vandalism and
decay, code with unfixed problems creates an environment where additional problems
feel normal and acceptable. One small compromise in quality standards signals that
quality isn't really important, leading to a cascade of larger compromises that can
make a codebase unmaintainable.

Think of quality maintenance like tending a garden. A few weeds aren't a major
problem, but if you ignore them, they spread and make the garden look neglected.
Once a garden looks neglected, people stop caring about adding more weeds, dropping
litter, or trampling plants. Soon you have a wasteland instead of a garden. The same
psychology applies to code—visible problems that aren't fixed create a culture where
new problems feel acceptable.

The power of fixing broken windows lies in the psychological and cultural impact it
has on development teams. When quality problems are addressed immediately, it
reinforces that quality matters. Team members internalize high standards and
naturally resist introducing new problems. When problems are allowed to accumulate,
the opposite happens—quality becomes optional, and each new problem feels less
significant against the backdrop of existing issues.

This principle goes beyond simple cleanliness or aesthetics. Broken windows in code
create cognitive overhead for every developer who encounters them. Each unfixed
problem requires mental energy to work around, understand, or explain to others.
These small taxes on attention accumulate over time and can significantly impact
productivity and morale. Fixing problems immediately eliminates this ongoing tax.

The broken windows tenet differs from maintainability and simplicity in its focus on
prevention and culture. While maintainability focuses on making code easy to
understand and modify, and simplicity focuses on reducing complexity, the broken
windows principle specifically addresses the psychology of quality decay and the
importance of immediate action to prevent normalization of problems.

## Practical Guidelines

1. **Fix Problems When You Find Them**: When you encounter a quality issue—whether
   it's a bug, poor naming, code duplication, or architectural smell—fix it
   immediately if possible, or create a plan to fix it soon. Don't rationalize
   leaving it for later unless there's a genuine emergency. The cost of fixing
   problems grows over time, and each unfixed problem makes the next one easier to
   ignore.

1. **Establish and Enforce Quality Gates**: Implement automated checks that prevent
   new problems from entering the codebase. This includes comprehensive test suites,
   linting rules, code formatting, security scans, and performance benchmarks. Make
   these gates non-optional—failing quality checks should block merges. Prevention
   is much more effective than reactive fixes.

1. **Make Quality Visible**: Ensure that quality problems are obvious and impossible
   to ignore. Use dashboards, metrics, and alerts that highlight technical debt,
   test coverage gaps, performance regressions, and other quality indicators. When
   problems are visible, they're more likely to be addressed quickly. Hidden
   problems become normalized problems.

1. **Create a Culture of Shared Ownership**: Everyone on the team should feel
   responsible for overall code quality, not just their own contributions. When
   someone sees a problem, they should feel empowered and expected to fix it,
   regardless of who originally created it. This collective ownership prevents
   problems from falling through the cracks and reinforces quality standards.

1. **Address Root Causes, Not Just Symptoms**: When fixing problems, take time to
   understand why they occurred and implement preventive measures. If you find a
   bug, consider what process or design changes could prevent similar bugs. If you
   find code duplication, think about what abstraction or tool could prevent future
   duplication. Treating symptoms without addressing causes leads to recurring
   problems.

1. **Budget Time for Quality Maintenance**: Explicitly allocate development time for
   addressing technical debt, refactoring, and quality improvements. Don't treat
   quality work as something that happens "if there's time left over." Quality
   maintenance is an investment that pays dividends in reduced bug rates, faster
   development velocity, and improved team morale.

## Warning Signs

- **Accumulating TODO Comments**: When code contains numerous TODO, FIXME, or HACK
  comments that never get addressed, you're living with broken windows. These
  comments represent acknowledged problems that the team has decided to ignore,
  creating a culture where known issues are acceptable.

- **Ignored Test Failures**: When tests fail intermittently and the team works
  around them instead of fixing them, you've normalized broken windows. Flaky or
  failing tests undermine confidence in the entire test suite and make real problems
  harder to detect.

- **Suppressed Linting Warnings**: When code contains numerous linting suppressions
  or warning ignore directives instead of fixing the underlying issues, you're
  papering over broken windows. Each suppression makes the next one feel more
  acceptable and reduces the value of the linting tools.

- **Copy-Paste Programming**: When developers regularly copy existing code instead
  of refactoring it into reusable components, you're creating new broken windows
  with each copy. This pattern indicates that improving existing code feels too
  difficult or risky, so people work around it instead.

- **Performance Regressions**: When application performance gradually degrades over
  time without anyone investigating or addressing the root causes, you're allowing
  broken windows to accumulate. Performance problems rarely fix themselves and
  usually compound over time.

- **Inconsistent Code Style**: When different parts of the codebase follow different
  conventions, naming patterns, or architectural approaches without good reason,
  you have style broken windows. Inconsistency makes the codebase harder to
  navigate and signals that standards are optional.

- **Outdated Dependencies**: When libraries and dependencies are allowed to become
  severely outdated, you're creating security and compatibility broken windows.
  The longer you wait to update, the more difficult and risky the updates become,
  creating a vicious cycle of technical debt.

- **Technical Debt Backlog Growth**: When the list of known technical debt items
  grows faster than they're being addressed, you're accumulating broken windows
  systematically. If technical debt isn't being actively managed and reduced, it
  will eventually overwhelm development productivity.

## Related Tenets

- [Maintainability](maintainability.md): While maintainability focuses on making
  code easy to understand and modify, fixing broken windows specifically addresses
  the cultural and psychological aspects of maintaining quality standards. Both
  tenets support each other—maintainable code is easier to keep free of broken
  windows, and consistently fixing problems makes code more maintainable over time.

- [Simplicity](simplicity.md): Broken windows often manifest as unnecessary
  complexity that accumulates over time. By fixing problems immediately, you
  prevent the complexity debt that makes systems harder to understand and modify.
  Simplicity and broken windows prevention work together to keep systems clean and
  understandable.

- [Automation](automation.md): Automated quality gates are one of the most
  effective tools for preventing broken windows. When checks are automated, quality
  problems are caught immediately rather than accumulating over time. Automation
  also removes the human factor that can lead to inconsistent quality enforcement.

- [Testability](testability.md): Comprehensive testing is essential for
  implementing broken windows prevention because tests make quality problems
  visible quickly. Without good test coverage, broken windows can hide for long
  periods before being discovered. Tests also provide the safety net that makes
  fixing problems less risky.

- [Deliver Value Continuously](deliver-value-continuously.md): A broken deployment
  pipeline is a critical "broken window" that must be fixed immediately to maintain
  the flow of value delivery. When the pipeline is unreliable, the entire team
  loses confidence in continuous delivery, leading to batching and delays that
  reduce overall effectiveness. Both tenets demand immediate issue resolution.

- [Empathize With Your User](empathize-with-your-user.md): User-facing broken
  windows—confusing interfaces, poor error messages, or accessibility issues—have
  immediate impact on user experience and should be prioritized for fixing. Users
  encounter these problems directly, making them more urgent than purely internal
  technical debt. User empathy helps identify which broken windows matter most.

- [Build Trust Through Collaboration](build-trust-through-collaboration.md):
  Collective ownership empowers anyone on the team to fix broken windows rather
  than waiting for the "owner" of problematic code. Trust enables team members to
  make necessary improvements without fear of stepping on toes or being blamed for
  changes that reveal existing problems. Team-wide quality ownership prevents
  windows from staying broken.
