---
id: document-decisions
last_modified: '2025-05-08'
version: '0.1.0'
---
# Tenet: Document Decisions, Not Mechanics

Document the "why" behind your code—the context, constraints, and reasoning that drove
key decisions—rather than the "how" of implementation details. Strive for
self-documenting code through clear naming, structure, and types that explain how things
work, while reserving explicit documentation for preserving critical context that future
developers couldn't otherwise rediscover.

## Core Belief

Software development is fundamentally a decision-making process. Each line of code
represents a series of choices—about algorithms, data structures, patterns, trade-offs,
and constraints. While the code itself captures what was decided, it often fails to
preserve why those decisions were made. This missing context is the most valuable form
of knowledge in a codebase and the most likely to be lost as teams evolve and time
passes.

Think of code like an archaeological artifact and documentation like the historical
record explaining it. When archaeologists discover ancient tools, they can analyze their
physical properties to understand how they were used, but can only guess at why they
were created or what cultural significance they held. Similarly, when you encounter code
without proper documentation, you can analyze its mechanics but may never fully grasp
the business constraints, performance requirements, or alternative approaches that
shaped it.

The most insidious type of technical debt isn't buggy code—which is relatively easy to
identify—but rather code whose original context and rationale have been lost. When you
don't understand why something was implemented in a particular way, you're more likely
to introduce regressions by "fixing" code that was actually addressing an important edge
case or constraint. Many complete rewrites happen not because the original solution was
wrong, but because its underlying rationale became obscured, making it appear
unnecessarily complex or arbitrary.

However, there's an important distinction between documenting decisions and documenting
mechanics. Commenting on how code works is often redundant or even harmful, as it
creates a maintenance burden and tends to drift out of sync with the actual
implementation. Well-written code—with clear naming, thoughtful structure, and
appropriate abstraction—should be largely self-documenting in terms of its mechanics.
Reserve your documentation efforts for preserving the context, constraints, and
reasoning that can't be derived from the code itself, no matter how well-written it is.

## Practical Guidelines

1. **Capture Context, Not Mechanics**: Focus your documentation on information that
   can't be easily recovered by reading the code. Ask yourself: "If someone reads this
   code a year from now, what essential context might they be missing?" Record business
   requirements, performance constraints, security considerations, and historical
   factors that influenced your design. Avoid explaining how the code works—that's what
   the code itself should communicate through clear structure and naming.

1. **Make the Code Self-Documenting**: Invest in making your code legible without
   relying on comments. Ask yourself: "Does this code clearly communicate its intent and
   behavior?" Use descriptive variable and function names, follow consistent patterns,
   leverage type systems, and create well-structured abstractions. When you feel the
   need to add a comment explaining what code does, consider whether you could instead
   refactor the code to make its purpose more obvious. Remember that unlike comments,
   self-documenting code can't become outdated or incorrect.

1. **Document at the Right Level**: Different types of documentation serve different
   purposes and should be maintained at different granularities. Ask yourself: "What's
   the appropriate scope for this information?" Function-level documentation should
   focus on contracts, side effects, and non-obvious constraints. Module-level
   documentation should explain responsibilities and interaction patterns. Project-level
   documentation should cover architecture decisions, development workflows, and
   cross-cutting concerns. Inline comments should be reserved primarily for explaining
   the rationale behind particularly complex or unintuitive solutions.

1. **Adopt Structured Documentation Formats**: Use formal documentation approaches for
   significant decisions. Ask yourself: "Is this decision important enough that future
   developers will need its full context?" For architectural decisions, consider using
   Architecture Decision Records (ADRs)—short documents that capture the context,
   options considered, decision made, and consequences. For complex algorithms or domain
   models, create diagrams with explanations of key concepts and relationships. These
   structured formats provide a single source of truth that won't be lost in comment
   blocks buried deep in the code.

1. **Update Documentation with Code**: Treat documentation as a first-class citizen in
   your development process. Ask yourself: "Does this code change invalidate any
   existing documentation?" When you modify code, review related documentation to ensure
   it remains accurate. When making significant design changes, update architectural
   documentation to reflect the new approach and the reasons for changing it. Remember
   that outdated documentation is often worse than no documentation, as it can actively
   mislead developers and undermine trust in all documentation.

## Warning Signs

- **Comments that merely restate the code** without adding context or explaining
  rationale. These comments create maintenance overhead without providing value, as they
  duplicate information already expressed in the code. Watch for comments like
  `// Set user to null` directly above `user = null`, or function descriptions that
  simply list the parameters without explaining the purpose or constraints of the
  function.

- **"Comment-first" development** where extensive comments are used instead of clear
  code. If code requires extensive explanation of what it's doing (rather than why),
  it's often a sign that the code itself needs refactoring to be more self-explanatory.
  Be particularly wary of comments that apologize for or try to justify confusing code
  instead of improving it, like "This looks strange but..." or "This is a hack that..."

- **Outdated documentation that contradicts the code**, creating confusion about which
  to trust. This happens when documentation is treated as a separate, secondary artifact
  rather than an integral part of the codebase. Listen for phrases like "Don't trust the
  comments" or "The documentation is probably outdated"—these indicate a broken
  documentation culture where written guidance can't be relied upon.

- **Missing rationale for complex or unusual approaches** that would otherwise appear
  arbitrary or overly complicated. When code takes non-obvious approaches without
  documented reasoning, future developers may "simplify" it without understanding the
  constraints or edge cases it was addressing. This is particularly problematic for
  performance optimizations, security measures, or workarounds for external system
  limitations.

- **Implementation details leaking into public documentation**, creating coupling
  between internal mechanics and external expectations. API documentation should focus
  on what clients can do and expect, not how the functionality is implemented
  internally. When implementation details are documented as part of the public contract,
  it becomes much harder to refactor or optimize internal code without breaking API
  users' expectations.

- **Absent architectural documentation** that would help new team members understand
  system structure and philosophy. Without clear documentation of the overall system
  architecture, component responsibilities, and design principles, new developers must
  piece together this understanding gradually and incompletely through code exploration.
  This leads to inconsistent mental models, violated architectural constraints, and
  slower onboarding.

- **Documentation silos** where important context is scattered across wikis, ticket
  systems, emails, chat logs, and code comments. When documentation exists in many
  disconnected places, it becomes nearly impossible to find relevant information when
  needed. The most important decisions often get lost in ephemeral discussions, leaving
  only their implementation without the surrounding context that explains them.

## Related Tenets

- [Explicit over Implicit](explicit-over-implicit.md): Both tenets focus on making
  information obvious and accessible. While "Explicit over Implicit" emphasizes
  expressing behavior and dependencies directly in code, "Document Decisions"
  complements this by ensuring that information which cannot be expressed in code (like
  rationales and constraints) is explicitly documented. Together, they ensure that both
  the "what" and the "why" of your system are clear to future developers.

- [Maintainability](maintainability.md): Documenting decisions significantly enhances
  maintainability by preserving critical context that future developers will need. When
  the rationales behind code decisions are well-documented, maintenance becomes less
  risky and more efficient—developers can confidently modify code while respecting its
  original constraints and purposes. While maintainable code is essential, even the most
  maintainable implementation benefits from documentation of the decisions that shaped
  it.

- [Simplicity](simplicity.md): Proper documentation of decisions supports simplicity by
  distinguishing between essential and accidental complexity. When the reasoning behind
  complex code is documented, developers can better determine whether that complexity is
  necessary (addressing genuine constraints) or can be simplified. Documentation also
  helps maintain simplicity over time by preventing the accumulation of defensive code
  whose original purpose has been forgotten.

- [Testability](testability.md): Documenting decisions enhances testability by capturing
  the intent, constraints, and edge cases that tests should verify. While tests
  themselves can serve as a form of documentation, they benefit from explicit
  documentation of the decisions that shaped the functionality they're testing.
  Understanding why code works a certain way helps in creating more targeted,
  comprehensive tests that verify the true requirements rather than just the current
  implementation.

- [Build Trust Through Collaboration](build-trust-through-collaboration.md):
  Documenting decisions is an act of collaboration that shares context with current
  and future team members. When teams document their reasoning, they enable others
  to understand and build upon their work, creating continuity that outlasts any
  individual contributor. Documentation becomes a tool for knowledge sharing that
  strengthens team trust and collective ownership.
