---
id: explicit-over-implicit
last_modified: '2025-06-02'
version: '0.1.0'
---
# Tenet: Explicit is Better than Implicit

Make code behavior obvious by clearly expressing dependencies, data flow, control flow,
contracts, and side effects. Favor code that states its intentions directly over
"magical" solutions, even when explicitness requires more code or initial effort.

## Core Belief

Software development is fundamentally about managing complexity, and explicitness is one
of our most powerful tools for doing so. When code is explicit, its behavior,
assumptions, and dependencies are visible on the surface rather than hidden beneath
layers of abstraction or convention. This transparency makes code dramatically easier to
understand, reason about, debug, and safely modify over time.

Think of explicit code like a well-labeled map with clear directions, compared to
implicit code which is like navigating by memory and intuition. The map might take
longer to create initially, but it prevents wrong turns, reduces the learning curve for
newcomers, and remains valuable even as the landscape changes. Similarly, explicit code
might require a few extra lines or more upfront thought, but it prevents bugs,
accelerates onboarding, and maintains its clarity even as the codebase evolves.

Implicit behavior—whether through global state, hidden side effects, or "magical"
conventions—creates cognitive debt that compounds over time. Each implicit relationship
or behavior becomes an unwritten rule that developers must discover, remember, and
navigate around. This hidden complexity becomes particularly problematic as systems
grow, teams change, and the original authors move on to other projects. What seems like
convenient shorthand today becomes an obscure puzzle for future maintainers.

Explicitness doesn't mean verbosity or redundancy. Rather, it means that code should
communicate its intentions and behaviors clearly, without requiring readers to
understand hidden contexts or make assumptions. The goal is to minimize the gap between
what the code does and what it appears to do, creating systems whose behavior can be
understood by reading rather than debugging.

## Practical Guidelines

1. **Make Dependencies Explicit**: Express dependencies directly rather than accessing
   them through global state, ambient context, or hidden singletons. Ask yourself: "Can
   someone understand what this component needs by reading its interface?" Prefer
   passing dependencies as parameters or using explicit dependency injection rather than
   allowing components to reach out and grab what they need from the environment. This
   makes component requirements visible, simplifies testing, and prevents subtle
   coupling between supposedly independent parts of your system.

1. **Reveal Control Flow**: Structure code so the path of execution is clear and
   obvious. Ask yourself: "Can a reader easily trace the flow of control through this
   code?" Avoid techniques that hide control flow, such as excessive event-based
   programming, complex decorator chains, or aspect-oriented programming without clear
   documentation. While these techniques have their place, they should be used
   judiciously and with clear signposts to help readers understand the non-linear flow
   of execution.

1. **Signal Side Effects**: Make it obvious when a function or method does more than
   compute a return value. Ask yourself: "Are all the effects of calling this function
   clear from its interface?" Functions that update state, make network calls, write to
   files, or have other side effects should communicate these behaviors through their
   names, return types, documentation, or parameter structure. Pure functions (those
   without side effects) should be the default, with side effects clearly marked as
   exceptional.

1. **Express Contracts Clearly**: Define the expectations and guarantees of each
   component explicitly. Ask yourself: "What assumptions does this code make about its
   inputs, environment, or usage?" Document preconditions, postconditions, and
   invariants to make contracts clear. Use strong typing to enforce as many constraints
   as possible at compile time. For dynamic languages or constraints that can't be
   expressed in the type system, add runtime validation with informative error messages
   when contracts are violated.

1. **Choose Clarity Over Convenience**: Prioritize code that clearly communicates its
   intent over code that saves a few keystrokes. Ask yourself: "Does this abstraction
   make the code more understandable, or just shorter?" Resist the temptation to create
   abstractions that hide too much or rely on subtle, implicit conventions. The time
   saved by typing less code is quickly overwhelmed by the time spent understanding,
   debugging, and explaining unclear code. Remember that most code is read many more
   times than it is written.

1. **Leverage Plain Text Power**: Prefer plain text formats for configuration, data
   exchange, and documentation whenever possible. Ask yourself: "Can this data be
   represented in a human-readable format?" Plain text is explicit about its contents,
   can be version-controlled effectively, inspected without special tools, and remains
   accessible across different systems and time periods. Use formats like JSON, YAML,
   CSV, or Markdown rather than binary formats or proprietary schemas unless there's a
   compelling technical reason. When you must use binary formats, provide plain text
   alternatives for inspection and debugging.

1. **Separate Commands from Queries**: Distinguish clearly between functions that
   change state (commands) and functions that return information (queries). Ask
   yourself: "Does this function both retrieve data and modify state?" Functions should
   either perform an action and return no meaningful data, or return data without
   causing side effects—avoid mixing both responsibilities. This separation makes code
   behavior more predictable and easier to reason about. Name functions to reflect
   their purpose: `getUser()` should only retrieve data, while `createUser()` should
   only perform the creation. When you need both operations, make two explicit calls
   rather than one ambiguous one.

1. **Crash Early When Preconditions Fail**: Validate inputs and assumptions
   immediately when they're violated, rather than allowing problems to propagate
   through the system. Ask yourself: "What assumptions does this code make, and what
   happens if they're false?" Check preconditions at function entry points and fail
   fast with clear error messages when expectations aren't met. This approach makes
   problems visible at their source rather than manifesting as mysterious failures
   later in execution. Dead programs tell no lies—a program that crashes immediately
   when something is wrong is more reliable than one that continues with invalid data
   and produces corrupt results.

## Warning Signs

- **"Magic" behavior** that happens automatically without clear indication in the code.
  When operations occur behind the scenes based on conventions, naming patterns, or
  hidden rules, it becomes difficult to understand or predict system behavior. These
  magical features often seem convenient at first, but they create significant friction
  as codebases grow and evolve. Be especially wary of frameworks or libraries that do
  too much for you "automagically" without clear documentation of their behavior.

- **Global state or hidden singletons** that components access implicitly. When code
  depends on state that isn't explicitly passed to it, those dependencies become
  invisible in interfaces and method signatures. This creates hidden coupling between
  components that should be independent and makes testing and refactoring significantly
  more difficult. Listen for explanations like "it works because the global
  configuration has already been initialized" as indicators of problematic implicit
  dependencies.

- **Undocumented assumptions about execution context** or environment. Code that assumes
  it will run in a particular environment or with certain resources available creates
  invisible requirements that can cause subtle, hard-to-diagnose bugs when those
  assumptions are violated. These assumptions often manifest as mysterious failures in
  new environments or when components are reused in different contexts than originally
  intended.

- **Complex inheritance hierarchies or mixins** that make behavior difficult to trace.
  When functionality is spread across multiple inheritance levels or mixed in from
  various sources, it becomes challenging to understand what code will actually execute
  in response to a method call. This complexity grows exponentially as the inheritance
  graph expands, leading to the aptly named "inheritance hell" where behavior becomes
  nearly impossible to predict or modify safely.

- **Methods with misleading names** that don't accurately reflect their behavior. Names
  create expectations about what code will do. When those expectations are violated—such
  as methods that have side effects not implied by their names—it leads to confusion and
  bugs. Methods named `getUser()` shouldn't update the database, methods named
  `validateInput()` shouldn't transform the data, and methods named `isEnabled()`
  shouldn't enable features as a side effect.

- **Overloaded operators or methods** whose behavior isn't immediately obvious. While
  operator overloading and method overloading can make code more concise, they can also
  make it less explicit when the overloaded behavior isn't intuitive. Overloaded
  operators should behave consistently with their standard meanings, and overloaded
  methods should perform fundamentally the same operation with different parameter
  types, not completely different operations.

- **Implicit type conversions** that happen automatically without the developer's
  knowledge. When data is silently converted between types, it can lead to subtle bugs
  and unexpected behavior. Be especially cautious with languages or libraries that
  perform aggressive type coercion, as these often create bugs that are difficult to
  diagnose and fix. Explicit type conversions make the developer's intentions clear and
  prevent accidental transformations.

- **"Clever" code that obscures what's actually happening** for the sake of brevity or
  performance. While clever optimizations or short, cryptic expressions might seem
  impressive, they often sacrifice readability and maintainability. If code requires
  deep knowledge of language quirks or tricky algorithms to understand, it's likely too
  clever for production use. Remember that showing off programming skills by writing
  complex code is actually less impressive than showing discipline by writing clear,
  maintainable code.

## Related Tenets

- [Simplicity](simplicity.md): Explicit code supports simplicity by making behavior
  obvious rather than hidden. When code is explicit, there are fewer hidden interactions
  and emergent behaviors that add accidental complexity. However, there can be tension
  between these tenets when explicitness requires more code. The key is finding the
  right balance—being explicit about important behaviors and constraints while avoiding
  redundancy and noise.

- [Modularity](modularity.md): Explicit code with clear interfaces and well-defined
  dependencies creates stronger module boundaries. When dependencies are explicit,
  modules are more truly independent and can be understood in isolation. Explicitness
  acts as a forcing function for good modularity by making coupling visible and
  therefore easier to manage.

- [Testability](testability.md): Explicit dependencies and side effects are essential
  for testable code. When all inputs and effects are visible, tests can properly isolate
  components and verify their behavior. Implicit behavior, on the other hand, creates
  testing challenges by making it difficult to set up test conditions and verify
  outcomes. Making code more explicit often makes it more testable as a direct
  consequence.

- [Maintainability](maintainability.md): Explicit code is more maintainable because it
  minimizes the "hidden knowledge" required to work with it effectively. New team
  members can understand explicit code more quickly, and even original authors benefit
  from explicitness when returning to code after months away. By making important
  behaviors and constraints visible, explicitness reduces the likelihood of accidental
  breakage during maintenance.

## Related Bindings

- [secure-by-design-principles](../bindings/categories/security/secure-by-design-principles.md): Security architecture implements explicit-over-implicit by making security assumptions, boundaries, and requirements visible rather than hidden in implementation details. Both approaches ensure that important system behaviors are transparent and can be verified rather than discovered through debugging.

- [input-validation-standards](../bindings/categories/security/input-validation-standards.md): Security input validation makes data validation requirements explicit through clear validation rules, security boundaries, and threat prevention measures. Both approaches ensure that security assumptions are visible and testable rather than hidden in implementation details.

- [authentication-authorization-patterns](../bindings/categories/security/authentication-authorization-patterns.md): Authentication and authorization patterns implement explicit-over-implicit by requiring that all security decisions be visible, documented, and auditable rather than relying on hidden assumptions or implicit trust relationships. Both approaches make system behavior clear and predictable.
