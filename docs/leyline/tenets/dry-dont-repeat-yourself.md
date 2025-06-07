---
id: dry-dont-repeat-yourself
last_modified: '2025-06-02'
---

# Tenet: Every Piece of Knowledge Must Have a Single Source of Truth

Ensure that every piece of knowledge in your system has a single, unambiguous,
authoritative representation. When knowledge exists in multiple places, changes
become expensive, error-prone, and inconsistent. DRY is about knowledge
management, not just avoiding code duplication.

## Core Belief

The DRY principle is fundamentally about knowledge management and maintaining
consistency across your entire system. When the same piece of knowledge exists in
multiple locations—whether in code, configuration, documentation, or data—you create
a maintenance burden that grows exponentially with each duplication. Every time that
knowledge needs to change, you must remember to update it everywhere, and human
memory is fallible.

Think of knowledge duplication like maintaining multiple copies of an important
document. If you have the same contract stored in five different filing cabinets,
and you need to update a crucial clause, you must remember to change it in all five
locations. Miss one, and you have inconsistent information that can lead to
confusion, errors, and conflicts. The same principle applies to software—when
business rules, algorithms, configuration values, or interface definitions exist in
multiple places, they will inevitably drift apart over time.

DRY goes beyond simple code duplication. While avoiding copy-pasted code blocks is
important, the deeper principle is about ensuring that each piece of knowledge—each
business rule, each algorithmic approach, each configuration parameter—has exactly
one authoritative source. This creates a system where changes ripple through
automatically, where consistency is maintained by design rather than by vigilance.

The power of DRY lies in making change safer and more predictable. When knowledge
has a single source of truth, you can confidently modify that source knowing that
the change will be reflected everywhere it's needed. This reduces the cognitive
overhead of making changes and eliminates a whole class of bugs that arise from
inconsistent updates.

DRY differs from simplicity in its focus: simplicity is about managing complexity
and avoiding unnecessary complications, while DRY is specifically about knowledge
representation and avoiding duplication of information. You can have simple code
that violates DRY, and you can have DRY code that's complex. Both principles work
together to create maintainable systems, but they address different aspects of
software design.

## Practical Guidelines

1. **Identify Knowledge, Not Just Code**: DRY applies to all forms of knowledge in
   your system: business rules, algorithms, configuration values, database schemas,
   API contracts, and documentation. Before copying anything, ask: "What knowledge
   does this represent, and where should that knowledge live?" Often, what appears
   to be similar code actually represents different knowledge that happens to have
   similar implementation.

1. **Establish Authoritative Sources**: For each piece of knowledge, designate a
   single, authoritative location where it's defined. This might be a function, a
   configuration file, a database table, or a documentation section. All other
   references should derive from or point to this authoritative source rather than
   duplicating the knowledge itself.

1. **Abstract at the Right Level**: Create abstractions when you have genuine
   knowledge duplication, but avoid premature abstraction of code that merely looks
   similar. The rule of three is useful here: consider abstracting when you see the
   same knowledge duplicated three times. Before that, you might not understand the
   pattern well enough to create the right abstraction.

1. **Use Configuration for Variability**: When similar code differs only in
   parameter values, extract those values into configuration. This transforms what
   appears to be code duplication into a single implementation with configurable
   behavior. The knowledge of "how to perform this operation" remains in one place,
   while the knowledge of "what parameters to use" is externalized.

1. **Make Dependencies Explicit**: When one piece of knowledge depends on another,
   make that relationship explicit rather than duplicating the derived knowledge.
   Use computed properties, derived tables, or generated code to ensure that
   dependent knowledge stays synchronized with its source automatically.

1. **Document Knowledge Ownership**: Make it clear who owns each piece of knowledge
   and where it should be modified. When team members can't easily identify the
   authoritative source for a piece of knowledge, they're likely to create
   duplicates or modify the wrong location.

## Warning Signs

- **Shotgun Surgery for Simple Changes**: When a small business logic change
  requires modifications in many files, you likely have knowledge duplication. The
  same rule or algorithm is probably implemented in multiple places instead of
  having a single authoritative implementation.

- **Configuration Values Hardcoded in Multiple Places**: When the same magic number,
  string constant, or configuration value appears in multiple files, you've
  duplicated knowledge. Changes to these values require hunting through the codebase
  to find all instances.

- **Identical or Nearly Identical Functions**: When you find functions that do the
  same thing with minor variations, you may have duplicated the underlying
  knowledge. Look for opportunities to extract the common knowledge into a shared
  implementation with parameterized differences.

- **Copy-Paste Programming**: When developers regularly copy existing code and
  modify it slightly for new features, knowledge duplication is being introduced
  systematically. This creates a maintenance nightmare as the original knowledge
  evolves independently in multiple locations.

- **Inconsistent Behavior Across Similar Features**: When similar features behave
  differently for no business reason, it often indicates that the same knowledge
  has been implemented multiple times with slight variations. Users expect
  consistency, and inconsistency usually signals knowledge duplication.

- **Database Schema Duplication**: When the same information is stored in multiple
  tables or when similar tables have slightly different structures for no clear
  reason, you have data knowledge duplication. This leads to synchronization
  problems and data inconsistency.

- **Documentation That Duplicates Code**: When documentation restates what the code
  does rather than explaining why it does it, you've duplicated knowledge in a
  format that will inevitably become outdated. Documentation should focus on
  knowledge that's not expressed in the code itself.

- **Manual Synchronization Processes**: When you have processes that require
  manually keeping multiple systems or data sources in sync, you've likely
  duplicated knowledge across those systems. Look for opportunities to establish a
  single source of truth with automatic propagation.

## Related Tenets

- [Simplicity](simplicity.md): While DRY focuses on eliminating knowledge
  duplication, Simplicity focuses on managing overall complexity. These tenets are
  complementary—DRY helps maintain simplicity by reducing the number of places
  where knowledge must be maintained, and simplicity helps make DRY violations more
  obvious. However, taken to extremes, DRY can actually increase complexity through
  over-abstraction.

- [Explicit over Implicit](explicit-over-implicit.md): Both DRY and explicitness
  are about clarity, but they address different aspects. DRY ensures that knowledge
  has a single, authoritative source, while explicitness ensures that relationships
  and dependencies are clearly stated. Sometimes these principles can tension
  against each other—making something DRY might make dependencies less explicit,
  so balance is required.

- [Maintainability](maintainability.md): DRY directly supports maintainability by
  making changes easier and safer. When knowledge has a single source of truth,
  modifications are localized and consistent. However, remember that maintainability
  also depends on understanding—sometimes a small amount of duplication is better
  than an abstraction that's difficult to comprehend.

- [Modularity](modularity.md): DRY and modularity work together to create
  well-organized systems. Modules provide boundaries for where knowledge should
  live, while DRY ensures that knowledge doesn't leak across those boundaries
  inappropriately. Each module should be the authoritative source for its own
  domain knowledge.
