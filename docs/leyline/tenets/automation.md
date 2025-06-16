---
id: automation
last_modified: '2025-05-08'
version: '0.1.0'
---
# Tenet: Automation as a Force Multiplier

Treat manual, repetitive tasks as bugs in your process. Invest in automating every
feasible recurring activity to eliminate human error, ensure consistency, and free your
most valuable resource—developer focus and creativity—for solving meaningful problems
rather than performing mechanical tasks.

## Core Belief

Automation is fundamentally about respecting the scarcity of human attention and
creativity. When you automate repetitive tasks, you're making a strategic decision to
let machines do what they excel at—consistent, reliable execution of well-defined
processes—freeing humans to do what they excel at: creative problem-solving, critical
thinking, and innovation.

Every time a developer manually performs a repetitive task like formatting code, running
tests, or deploying an application, they're diverting mental energy away from their core
competency. This context-switching has a real cost beyond just the time spent; it
fragments attention and disrupts the deep focus needed for solving complex problems.

Think of automation as an investment with compound returns. The upfront cost of creating
a CI pipeline, a deployment script, or a code generation tool may seem high initially,
but that investment amortizes rapidly across team members and over time. A test
automation suite that takes a week to build might save dozens of developer-hours in just
the first month of use—and continue paying dividends indefinitely.

Automation also serves as a form of executable documentation. When you automate a
process, you're forced to define it explicitly and unambiguously. This clarity benefits
everyone, including future team members who inherit your systems. They can understand
not just what actions are performed, but in what order and under what conditions, simply
by examining your automation artifacts.

## Practical Guidelines

1. **Automate After Second Repetition**: After performing a task manually more than
   twice, invest time in automating it. When you find yourself thinking "I need to
   remember to do this each time," that's a signal that automation is needed. Ask
   yourself: "How often will this be repeated across the team and over time?" This helps
   prioritize automation efforts based on ROI.

1. **Prioritize Developer Experience**: Focus first on automating the daily friction
   points in the development workflow. Build automation that developers actually want to
   use—tools that are intuitive, consistent, and reliable. Consider: "Does this
   automation make a developer's daily experience noticeably better?" If a tool is
   cumbersome or fragile, developers will work around it, defeating its purpose.

1. **Make Automation Visible and Collaborative**: Treat automation code as first-class
   project code with the same quality standards. Store scripts, workflows, and
   configuration in version control alongside application code. Document how automation
   works and invite improvements. Ask: "Can another team member easily understand and
   extend this automation?" This collaborative approach ensures automation evolves with
   your project.

1. **Automate Quality Verification**: Prioritize automation that enforces quality
   standards and catches issues before they reach production. This includes automated
   tests, code linting, security scanning, and performance benchmarking. The question
   isn't "Can we trust developers to follow the standards?" but rather "How can we make
   it impossible to violate the standards?" Build systems that make the right way the
   path of least resistance.

1. **Extend Beyond Code**: Apply automation thinking beyond just code to project
   management, communication, and documentation. Automate issue tracking updates,
   changelog generation, and documentation deployments. Consider: "What non-coding
   activities consume team time that could be automated?" Sometimes the biggest
   productivity gains come from automating the processes around the code, not just the
   code itself.

## Warning Signs

- **Performing the same task manually more than twice** without creating automation. If
  you find yourself repeatedly running the same sequence of commands, creating the same
  directory structures, or executing the same verification steps, you're missing an
  opportunity for automation. The manual effort is a hidden tax on your productivity.

- **Documentation that describes a manual process** with multiple steps. Multi-step
  procedures in documentation often indicate an automation gap. When you see phrases
  like "remember to" or numbered lists of actions, ask whether this process could be
  encapsulated in a script or workflow that ensures consistency and reduces cognitive
  overhead.

- **Inconsistent environments and "works on my machine" problems** that reveal a lack of
  automation around environment setup and dependencies. These issues signal that
  critical aspects of your development or deployment process rely on human memory and
  manual steps rather than reproducible, automated processes.

- **Delayed feedback on code quality issues** that should be caught automatically and
  early. If formatting issues, linting errors, type mismatches, or failing tests are
  discovered late in the development process, it indicates insufficient automation in
  your quality assurance pipeline. Quality verification should be continuous and
  automated.

- **Team members spending time on mechanical tasks** like manually deploying
  applications, copying files between environments, or running build sequences. These
  activities provide little learning value and high risk of error, making them prime
  candidates for automation. Watch for team members spending their creative energy on
  low-value repetitive work.

- **Regular mistakes in routine procedures** that could be eliminated through
  automation. When you notice recurring errors in processes like versioning, releasing,
  or configuration updates, it's a strong indication that these processes should be
  automated to ensure consistency and reliability.

- **Tribal knowledge about processes** that isn't captured in executable form. If
  certain team members are the only ones who know how to perform critical operations,
  those operations should be automated both to reduce the bus factor and to make the
  implicit knowledge explicit.

## Related Tenets

- [Explicit over Implicit](explicit-over-implicit.md): Automation makes processes
  explicit rather than relying on implicit knowledge or manual procedures. By encoding
  workflows in automation scripts and pipelines, you create explicit, executable
  documentation of your processes, complementing the explicitness principle throughout
  your codebase.

- [Testability](testability.md): Automated testing is a cornerstone of both automation
  and testability. A testable system enables effective test automation, and
  comprehensive test automation encourages designs that are inherently more testable.
  Together, they create a virtuous cycle of quality assurance.

- [Simplicity](simplicity.md): Automation and simplicity work together to reduce
  cognitive overhead. When repetitive tasks are automated, developers can focus their
  mental energy on solving core problems rather than remembering complex manual
  procedures. This supports simplicity's goal of reducing cognitive load.

- [Deliver Value Continuously](deliver-value-continuously.md): Effective continuous
  delivery requires a high degree of automation in testing, building, and deployment
  processes. Without automation, frequent releases become prohibitively time-consuming
  and error-prone. Automation is not just helpful for continuous delivery—it's
  absolutely essential for maintaining quality while increasing deployment frequency.
