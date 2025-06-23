---
id: adaptability-and-reversibility
last_modified: '2025-06-16'
version: '0.1.0'
---
# Tenet: There Are No Final Decisions

Design your systems and make your decisions with the understanding that requirements
will change, technologies will evolve, and new information will emerge. Build
flexibility into your architecture and processes so that adapting to change becomes
natural rather than catastrophic.

## Core Belief

The only constant in software development is change. Requirements evolve as users
discover what they actually need. Technologies advance and create new possibilities.
Business contexts shift and create new priorities. Teams learn and develop better
understanding of the problem domain. The most successful software systems are those
that embrace this reality and design for adaptation from the beginning.

Think of your software decisions like choosing a route for a road trip. You can plan
the optimal path based on current information, but traffic jams, road closures, or
discovering an interesting detour might require you to adapt. Flexible planning with
alternative routes turns changes into opportunities rather than disasters.

Adaptability and reversibility are about designing systems with evolution in mind.
This means making architectural choices that don't lock you into specific
technologies, implementation patterns, or business rules. It means building systems
that can grow, change direction, and incorporate new learnings without requiring
complete rewrites. It's about treating today's decisions as the best choice given
current information, while acknowledging that better information may emerge tomorrow.

The power of adaptable systems lies in their ability to evolve gracefully with
changing requirements. When change is anticipated and designed for, new features can
be added naturally, performance bottlenecks addressed surgically, and technological
advances incorporated incrementally.

## Practical Guidelines

1. **Design for Reversibility**: When making architectural decisions, explicitly
   consider how difficult they would be to reverse. Avoid choices that create
   irreversible dependencies or lock you into specific vendors, technologies, or
   patterns. Ask yourself: "If we discovered this decision was wrong in six months,
   how hard would it be to change?" Favor approaches that leave options open over
   those that commit you permanently to a particular path.

1. **Use Tracer Bullets for Rapid Feedback**: When facing uncertainty about
   requirements or technical approaches, build small, end-to-end implementations that
   touch all parts of the system. These "tracer bullets" help you learn quickly
   about what works and what doesn't, allowing you to adjust course based on real
   feedback rather than theoretical assumptions. They provide concrete information
   that reduces uncertainty and guides better decisions.

1. **Prototype to Learn, Then Discard**: Use prototypes specifically to explore
   unknowns and validate assumptions, not as foundations for production systems.
   Prototypes should be built quickly and thrown away once they've provided the
   learning you need. This reduces the temptation to build on shaky foundations and
   keeps you free to implement better solutions based on what you've learned.

1. **Externalize Configuration and Policies**: Keep business rules, configuration
   parameters, and policy decisions outside of your core code where they can be
   modified without requiring system changes. This allows the system to adapt to new
   business requirements without code modifications. Design clear interfaces between
   the stable core logic and the variable configuration that's likely to change.

1. **Favor Composition Over Inheritance**: Build systems from composable parts that
   can be recombined in new ways rather than rigid hierarchies that are difficult to
   modify. Composition allows you to adapt system behavior by changing how components
   are combined rather than by modifying the components themselves. This provides
   much more flexibility as requirements evolve.

1. **Build in Monitoring and Observability**: Design systems that provide visibility
   into their behavior so you can understand how they're actually being used and
   where improvements are needed. Good observability helps you identify when and
   where changes are needed, and provides feedback on whether adaptations are
   working as intended. You can't adapt effectively to changes you can't see or
   measure.

## Warning Signs

- **Technology Lock-in**: When your system is tightly coupled to specific vendors,
  frameworks, or technologies that would be expensive or difficult to replace, you've
  sacrificed adaptability for short-term convenience.

- **Hardcoded Business Rules**: When business logic is embedded directly in code
  rather than externalized through configuration, simple business changes require
  development cycles and reduce competitive agility.

- **Monolithic Data Models**: When all system data is forced into a single, rigid
  schema that's difficult to evolve, schema changes become expensive and risky.

- **Integration Tight Coupling**: When systems are integrated through mechanisms that
  require coordinated changes across multiple systems, you've created dependencies
  that make adaptation expensive. Changes that should be localized to one system
  ripple through multiple systems, increasing cost and risk.

- **Fear of Refactoring**: When teams avoid improving code structure because changes
  are too risky or expensive, the system becomes increasingly difficult to adapt.
  Good adaptability requires the ability to safely refactor and restructure code as
  understanding improves and requirements evolve.

- **Premature Optimization**: When performance optimizations are built in before
  they're proven necessary, you often sacrifice flexibility for premature gains.
  These optimizations can make later changes much more difficult and expensive,
  reducing the system's ability to adapt to new performance requirements.

- **All-or-Nothing Deployments**: When changes can only be deployed as large,
  coordinated releases, you've reduced your ability to adapt quickly to new
  information. Good adaptability requires the ability to make incremental changes
  and get rapid feedback on their effectiveness.

- **Irreversible Data Migrations**: When data structure changes can't be rolled back
  or when old and new formats can't coexist temporarily, you've created deployment
  risks that discourage adaptation. Good adaptability requires migration strategies
  that allow safe rollback and gradual transition.

## Related Tenets

- [Simplicity](simplicity.md): Adaptability and simplicity reinforce each other—
  simple systems are generally easier to modify and evolve, while designing for
  adaptability often leads to simpler, more focused solutions. However, there can be
  tension when adaptability requires additional abstraction layers that increase
  complexity. The key is finding the right balance for your context.

- [Modularity](modularity.md): Modular design supports adaptability by creating
  clear boundaries where changes can be contained. Well-designed modules can be
  replaced, enhanced, or recombined without affecting the entire system.
  Adaptability provides the temporal perspective that makes modularity more
  effective—modules should be designed not just for current needs but for future
  evolution.

- [Explicit over Implicit](explicit-over-implicit.md): Making dependencies and
  assumptions explicit supports adaptability by making it clear what would need to
  change when requirements evolve. Hidden dependencies and implicit assumptions make
  systems fragile and difficult to adapt safely. Explicit design makes the impact
  of changes more predictable.

- [Testability](testability.md): Good test coverage is essential for adaptability
  because it provides the safety net that makes changes less risky. Without
  comprehensive tests, teams become afraid to modify systems, reducing adaptability
  over time. Tests also document current behavior, making it easier to understand
  what changes when adapting to new requirements.

- [Deliver Value Continuously](deliver-value-continuously.md): Continuous delivery
  directly enables adaptability by making course corrections quick and low-risk.
  When you can deploy changes rapidly, you can experiment, learn, and adapt much
  more effectively based on real user feedback. The ability to roll back changes
  quickly makes decisions more reversible and encourages the kind of learning-based
  adaptation that keeps software aligned with evolving needs.
