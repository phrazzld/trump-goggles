---
id: modularity
last_modified: '2025-05-08'
version: '0.1.0'
---
# Tenet: Modularity is Mandatory

Construct software from small, well-defined, independent components with clear
responsibilities and explicit interfaces. The complexity of the whole system becomes
manageable when broken down into cohesive modules that do one thing well and compose
together cleanly.

## Core Belief

Modularity is the fundamental approach for taming complexity in software systems. When
you design your code as a collection of well-defined, independent components, you're
creating a system that humans can actually comprehend and maintain over time. Our brains
are limited in how much complexity they can handle at once—modularity works with this
constraint rather than fighting against it.

Think of modularity like building with LEGO bricks instead of carving a sculpture from a
single block of stone. With LEGO, you can build, test, and refine each component
separately. You can replace or upgrade individual pieces without rebuilding the entire
structure. Multiple people can work on different sections simultaneously. When something
breaks, you can isolate and fix just the problematic piece. These same benefits apply to
modular software.

The value of modularity increases with system size and lifespan. A small script might
work fine as a monolith, but as systems grow in scope and complexity, the lack of good
boundaries creates exponential growth in cognitive overhead and maintenance costs.
Modularity creates natural seams in your codebase that allow for independent
development, testing, deployment, reuse, fault isolation, and easier evolution over
time.

Modularity isn't about arbitrarily dividing code into random chunks—it's about finding
the natural boundaries in your problem domain and creating software components that
reflect those boundaries. Each module should have a clear purpose, a well-defined
interface, and hide its implementation details. This encapsulation creates a separation
of concerns that drastically reduces the mental overhead required to work with any
individual part of the system.

## Practical Guidelines

1. **Do One Thing Well**: Each module, package, service, or function should have a
   single, clear responsibility. When evaluating a component, ask yourself: "Can I
   describe what this does in a single sentence without using 'and'?" If not, it's
   likely trying to do too much. Having a clear, focused purpose makes components easier
   to understand, test, and reuse. It also makes your codebase more resilient to change,
   as modifications tend to align with these natural boundaries.

1. **Define Clear Boundaries**: Modules should have well-defined interfaces and hide
   their implementation details. Think of each module as having a contract with the rest
   of the system—clearly stating what it provides and what it requires, but keeping the
   "how" private. Ask yourself: "Could someone use this component correctly without
   understanding how it works internally?" When implementation details are
   well-encapsulated, you can change them without impacting other parts of the system.

1. **Minimize Coupling**: Reduce dependencies between modules; when dependencies exist,
   they should be through abstract interfaces rather than concrete implementations. High
   coupling means changes ripple throughout your codebase, making maintenance
   increasingly difficult. When evaluating dependencies, ask: "Does this module really
   need to know about that other module?" Consider dependency inversion, where both
   modules depend on a shared abstraction rather than directly on each other.

1. **Maximize Cohesion**: Related functionality should be grouped together within a
   module. Cohesive modules are focused and purposeful, making them easier to understand
   and maintain. When assessing cohesion, ask: "Do all parts of this module work
   together to serve a unified purpose?" Low cohesion often manifests as unrelated
   functionality bundled together, or as modules that have pieces that frequently need
   to be used separately from the rest of the module.

1. **Design for Composition**: Smaller modules should combine easily to build more
   complex functionality. This approach allows for tremendous flexibility while keeping
   individual components simple and focused. Consider whether your modules follow the
   Unix philosophy of "doing one thing well" and can be connected through simple, clear
   interfaces. Ask yourself: "Can this functionality be composed from simpler, more
   focused pieces?" This mindset leads to more flexible, reusable components that can be
   recombined in ways you might not initially anticipate.

## Warning Signs

- **Monolithic components that handle multiple concerns** without clear internal
  boundaries. When a module, class, or function handles several distinct
  responsibilities, it becomes difficult to understand, test, and modify. This often
  manifests as files with hundreds or thousands of lines of code. Break these components
  down into smaller, focused parts with clear responsibilities.

- **"God objects" or omniscient classes** that know too much about the system. These
  objects typically have tendrils reaching throughout your codebase, with methods and
  properties addressing many different concerns. When you find yourself constantly
  adding new fields and methods to the same class for different features, it's a sign
  you need better modularization.

- **Tangled dependencies between modules** creating a complex web rather than a clear
  hierarchy or structure. When changing one part of your system requires understanding
  and modifying many others, you're witnessing the effects of high coupling. Listen for
  phrases like "we need to touch five different modules to make this simple change" as
  indicators of poor modular design.

- **Changes in one area frequently breaking others** seemingly unrelated parts of the
  system. This ripple effect of bugs and unexpected behavior across module boundaries
  indicates leaky abstractions or hidden dependencies. Proper modularity should contain
  the impact of changes within well-defined boundaries.

- **Testing requiring complex setup or extensive mocking** of other components. When
  unit testing a module requires recreating large parts of the system, it's a sign of
  excessive coupling. Truly modular components can be tested in isolation with minimal
  dependencies on external systems.

- **Difficulty onboarding new team members** to specific areas of the codebase. When
  understanding one part of the system requires comprehending the whole, modularity is
  lacking. New developers should be able to become productive in a specific module
  without needing to understand everything.

- **Circular dependencies between modules**, where A depends on B which depends on C
  which depends back on A. These cycles create tight coupling and make it impossible to
  understand any component in isolation. They're often a sign that your module
  boundaries don't reflect the natural divisions in your problem domain.

- **Inappropriate information sharing** between modules, such as exposing internal
  implementation details or sharing mutable state. This creates implicit coupling that
  isn't visible in the formal dependencies, making the system unpredictable and fragile.

## Related Tenets

- [Simplicity](simplicity.md): Modularity and simplicity work together—breaking complex
  systems into smaller, focused modules makes each part simpler and more comprehensible.
  However, there can be tension if modularity is taken to an extreme, as too many tiny
  modules can create a different kind of complexity. The key is finding module
  boundaries that maximize internal simplicity while minimizing the complexity of
  interactions between modules.

- [Testability](testability.md): Modular design is a prerequisite for effective testing.
  Well-defined modules with clear boundaries and minimal dependencies are naturally
  easier to test in isolation. Testability provides feedback on the quality of your
  modular design—if a component is difficult to test, it's often a sign that it has poor
  boundaries or excessive coupling.

- [Explicit over Implicit](explicit-over-implicit.md): Modularity works best when the
  interfaces between modules are explicit and clearly defined. Implicit dependencies,
  hidden coupling, and shared state undermine the benefits of modular design. Strong
  module boundaries enforce explicit communication patterns, making the system more
  predictable and easier to reason about.

- [Maintainability](maintainability.md): Modularity directly supports maintainability by
  making it easier to understand, modify, and extend specific parts of a system without
  impacting the whole. Well-modularized systems allow for controlled, incremental
  changes and facilitate dividing maintenance tasks among team members based on module
  boundaries.
