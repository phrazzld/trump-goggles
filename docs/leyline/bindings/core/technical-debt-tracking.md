---
id: technical-debt-tracking
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: fix-broken-windows
enforced_by: 'Code review, architectural review, technical debt assessment processes'
---

# Binding: Implement Systematic Technical Debt Management

Establish comprehensive processes to identify, document, prioritize, and systematically address technical debt before it degrades system quality. Maintain explicit visibility into technical debt accumulation and create actionable plans for debt reduction.

## Rationale

This binding implements our fix-broken-windows tenet by creating systematic approaches to identify and manage technical shortcuts, compromises, and accumulated problems before they compound into system-wide quality issues. Technical debt, like broken windows, signals that the system tolerates decay and invites further degradation. When technical debt is invisible or unmanaged, teams make decisions without understanding the true cost of additional compromises.

Like maintaining a detailed maintenance log for a complex machine, every shortcut taken, temporary fix applied, and compromise made must be documented with its impact and cost. Without this visibility, operators don't know which components are fragile, which systems are overdue for maintenance, or where the next failure is likely to occur. Eventually, undocumented problems lead to cascading failures that could have been prevented with systematic maintenance.

Untracked technical debt creates a vicious cycle where teams repeatedly choose short-term solutions because they don't understand the full cost of their technical choices. Each compromise makes the next one easier to justify, leading to systems that become increasingly difficult to modify, test, or operate reliably. Systematic debt tracking breaks this cycle by making the true cost of technical decisions visible and actionable.

## Rule Definition

Technical debt tracking must establish these management principles:

- **Comprehensive Identification**: Systematically identify technical debt through code reviews, architectural assessments, performance analysis, and team feedback. Don't rely on ad-hoc discovery of problems.
- **Structured Documentation**: Document each piece of technical debt with consistent metadata including impact assessment, effort estimation, business consequences, and remediation strategies.
- **Prioritization Framework**: Establish clear criteria for prioritizing technical debt based on business impact, system risk, maintenance cost, and team productivity effects.
- **Progress Tracking**: Monitor technical debt accumulation and reduction over time, ensuring that debt paydown keeps pace with new debt creation.

Common patterns this binding requires:

- Technical debt registry with standardized documentation format
- Regular debt assessment processes integrated into development workflows
- Debt prioritization matrix based on impact and effort
- Automated debt detection through code analysis tools
- Debt paydown planning integrated with sprint and release planning

What this explicitly prohibits:

- Technical shortcuts without documentation and tracking
- Debt accumulation without corresponding paydown plans
- Ad-hoc technical debt management without systematic processes
- Ignoring technical debt until it causes production issues
- Technical debt decisions made without team visibility and agreement

## Practical Implementation

1. **Establish Technical Debt Registry**: Create a centralized system for
   documenting, categorizing, and tracking all technical debt items.

   ```typescript
   // Technical debt tracking system
   interface TechnicalDebtItem {
     id: string;
     title: string;
     description: string;
     category: DebtCategory;
     severity: DebtSeverity;
     impact: DebtImpact;
     effort: DebtEffort;
     createdAt: Date;
     createdBy: string;
     assignedTo?: string;
     status: DebtStatus;
     dueDate?: Date;
     tags: string[];
     relatedTickets: string[];
     codeLocation?: CodeLocation;
     businessJustification?: string;
     remediationPlan?: string;
   }

   enum DebtCategory {
     CODE_QUALITY = 'code-quality',
     ARCHITECTURE = 'architecture',
     PERFORMANCE = 'performance',
     SECURITY = 'security',
     TESTING = 'testing',
     DOCUMENTATION = 'documentation',
     INFRASTRUCTURE = 'infrastructure'
   }

   enum DebtSeverity {
     CRITICAL = 'critical',    // Blocks development or causes outages
     HIGH = 'high',           // Significantly impacts productivity
     MEDIUM = 'medium',       // Moderate impact on development
     LOW = 'low'              // Minor inconvenience
   }

   interface DebtImpact {
     developmentVelocity: 1 | 2 | 3 | 4 | 5;  // 1 = no impact, 5 = severe
     systemReliability: 1 | 2 | 3 | 4 | 5;
     maintenanceCost: 1 | 2 | 3 | 4 | 5;
     teamMorale: 1 | 2 | 3 | 4 | 5;
   }

   interface DebtEffort {
     estimatedHours: number;
     complexity: 'low' | 'medium' | 'high';
     riskLevel: 'low' | 'medium' | 'high';
     requiredSkills: string[];
   }

   enum DebtStatus {
     IDENTIFIED = 'identified',
     TRIAGED = 'triaged',
     PLANNED = 'planned',
     IN_PROGRESS = 'in-progress',
     RESOLVED = 'resolved',
     DEFERRED = 'deferred',
     OBSOLETE = 'obsolete'
   }

   interface CodeLocation {
     repository: string;
     filePath: string;
     lineNumbers?: number[];
     component?: string;
   }

   // Technical debt service
   class TechnicalDebtService {
     constructor(
       private debtStore: DebtStore,
       private logger: Logger
     ) {}

     async createDebtItem(debt: Omit<TechnicalDebtItem, 'id' | 'createdAt'>): Promise<TechnicalDebtItem> {
       const debtItem: TechnicalDebtItem = {
         ...debt,
         id: this.generateId(),
         createdAt: new Date(),
         status: DebtStatus.IDENTIFIED
       };

       // Validate debt item
       this.validateDebtItem(debtItem);

       // Auto-assign severity based on impact
       debtItem.severity = this.calculateSeverity(debtItem.impact);

       await this.debtStore.save(debtItem);

       this.logger.info('Technical debt item created', {
         debtId: debtItem.id,
         category: debtItem.category,
         severity: debtItem.severity,
         createdBy: debtItem.createdBy
       });

       return debtItem;
     }

     async getPrioritizedDebt(): Promise<TechnicalDebtItem[]> {
       const allDebt = await this.debtStore.findByStatus([
         DebtStatus.IDENTIFIED,
         DebtStatus.TRIAGED,
         DebtStatus.PLANNED
       ]);

       return allDebt.sort((a, b) => this.calculatePriority(b) - this.calculatePriority(a));
     }

     private calculatePriority(debt: TechnicalDebtItem): number {
       const impactScore = (
         debt.impact.developmentVelocity +
         debt.impact.systemReliability +
         debt.impact.maintenanceCost +
         debt.impact.teamMorale
       ) / 4;

       const urgencyScore = debt.severity === DebtSeverity.CRITICAL ? 5 :
                           debt.severity === DebtSeverity.HIGH ? 4 :
                           debt.severity === DebtSeverity.MEDIUM ? 3 : 2;

       const effortPenalty = debt.effort.complexity === 'high' ? 0.5 :
                            debt.effort.complexity === 'medium' ? 0.8 : 1;

       return (impactScore * urgencyScore * effortPenalty);
     }

     private calculateSeverity(impact: DebtImpact): DebtSeverity {
       const maxImpact = Math.max(
         impact.developmentVelocity,
         impact.systemReliability,
         impact.maintenanceCost,
         impact.teamMorale
       );

       if (maxImpact >= 5) return DebtSeverity.CRITICAL;
       if (maxImpact >= 4) return DebtSeverity.HIGH;
       if (maxImpact >= 3) return DebtSeverity.MEDIUM;
       return DebtSeverity.LOW;
     }
   }
   ```

2. **Implement Automated Debt Detection**: Create automated systems to
   identify and track technical debt through code analysis and metrics.

   ```typescript
   // Automated debt detection system
   interface DebtDetectionRule {
     id: string;
     name: string;
     description: string;
     category: DebtCategory;
     pattern: string | RegExp;
     severity: DebtSeverity;
     autoCreate: boolean;
   }

   class AutomatedDebtDetector {
     private rules: DebtDetectionRule[] = [
       {
         id: 'todo-comments',
         name: 'TODO Comments',
         description: 'TODO comments in code indicating incomplete work',
         category: DebtCategory.CODE_QUALITY,
         pattern: /\/\/\s*TODO|#\s*TODO|\/\*\s*TODO/gi,
         severity: DebtSeverity.LOW,
         autoCreate: true
       },
       {
         id: 'hack-comments',
         name: 'HACK Comments',
         description: 'HACK comments indicating problematic solutions',
         category: DebtCategory.CODE_QUALITY,
         pattern: /\/\/\s*HACK|#\s*HACK|\/\*\s*HACK/gi,
         severity: DebtSeverity.MEDIUM,
         autoCreate: true
       },
       {
         id: 'large-functions',
         name: 'Large Functions',
         description: 'Functions exceeding complexity thresholds',
         category: DebtCategory.CODE_QUALITY,
         pattern: '', // Handled by static analysis tools
         severity: DebtSeverity.MEDIUM,
         autoCreate: false
       }
     ];

     constructor(
       private debtService: TechnicalDebtService,
       private codeAnalyzer: CodeAnalyzer
     ) {}

     async scanRepository(repositoryPath: string): Promise<TechnicalDebtItem[]> {
       const detectedDebt: TechnicalDebtItem[] = [];

       // Scan for pattern-based debt
       for (const rule of this.rules) {
         if (rule.pattern instanceof RegExp) {
           const matches = await this.scanForPattern(repositoryPath, rule);
           detectedDebt.push(...matches);
         }
       }

       // Scan for complexity-based debt
       const complexityDebt = await this.scanComplexity(repositoryPath);
       detectedDebt.push(...complexityDebt);

       // Auto-create debt items if enabled
       for (const debt of detectedDebt) {
         const rule = this.rules.find(r => r.id === debt.tags[0]);
         if (rule?.autoCreate) {
           await this.debtService.createDebtItem(debt);
         }
       }

       return detectedDebt;
     }

     private async scanForPattern(repositoryPath: string, rule: DebtDetectionRule): Promise<TechnicalDebtItem[]> {
       const files = await this.getSourceFiles(repositoryPath);
       const debt: TechnicalDebtItem[] = [];

       for (const file of files) {
         const content = await this.readFile(file);
         const lines = content.split('\n');

         for (let i = 0; i < lines.length; i++) {
           if (rule.pattern instanceof RegExp && rule.pattern.test(lines[i])) {
             debt.push({
               title: `${rule.name} in ${file}`,
               description: `Found: ${lines[i].trim()}`,
               category: rule.category,
               severity: rule.severity,
               impact: this.getDefaultImpact(rule.severity),
               effort: this.estimateEffort(rule),
               status: DebtStatus.IDENTIFIED,
               tags: [rule.id],
               codeLocation: {
                 repository: repositoryPath,
                 filePath: file,
                 lineNumbers: [i + 1]
               },
               createdBy: 'automated-scanner'
             });
           }
         }
       }

       return debt;
     }

     private async scanComplexity(repositoryPath: string): Promise<TechnicalDebtItem[]> {
       const complexityReport = await this.codeAnalyzer.analyzeComplexity(repositoryPath);
       const debt: TechnicalDebtItem[] = [];

       for (const file of complexityReport.files) {
         for (const func of file.functions) {
           if (func.complexity > 10) {
             debt.push({
               title: `High complexity function: ${func.name}`,
               description: `Function has cyclomatic complexity of ${func.complexity}`,
               category: DebtCategory.CODE_QUALITY,
               severity: func.complexity > 20 ? DebtSeverity.HIGH : DebtSeverity.MEDIUM,
               impact: this.getComplexityImpact(func.complexity),
               effort: this.estimateRefactoringEffort(func.complexity),
               status: DebtStatus.IDENTIFIED,
               tags: ['high-complexity'],
               codeLocation: {
                 repository: repositoryPath,
                 filePath: file.path,
                 lineNumbers: [func.startLine, func.endLine]
               },
               createdBy: 'complexity-analyzer'
             });
           }
         }
       }

       return debt;
     }

     private getDefaultImpact(severity: DebtSeverity): DebtImpact {
       switch (severity) {
         case DebtSeverity.CRITICAL:
           return { developmentVelocity: 4, systemReliability: 4, maintenanceCost: 4, teamMorale: 3 };
         case DebtSeverity.HIGH:
           return { developmentVelocity: 3, systemReliability: 3, maintenanceCost: 3, teamMorale: 2 };
         case DebtSeverity.MEDIUM:
           return { developmentVelocity: 2, systemReliability: 2, maintenanceCost: 2, teamMorale: 2 };
         default:
           return { developmentVelocity: 1, systemReliability: 1, maintenanceCost: 1, teamMorale: 1 };
       }
     }
   }
   ```

3. **Create Debt Paydown Planning**: Implement systematic planning processes
   that integrate debt reduction with regular development work.

   ```typescript
   // Debt paydown planning system
   interface DebtPaydownPlan {
     sprintId: string;
     plannedDebt: TechnicalDebtItem[];
     capacity: number; // Hours allocated to debt
     actualEffort: number;
     completedDebt: string[];
     deferredDebt: string[];
     newDebtCreated: string[];
   }

   class DebtPaydownPlanner {
     constructor(
       private debtService: TechnicalDebtService,
       private sprintService: SprintService
     ) {}

     async createPaydownPlan(sprintId: string, capacity: number): Promise<DebtPaydownPlan> {
       const prioritizedDebt = await this.debtService.getPrioritizedDebt();
       const plannedDebt = this.selectDebtForSprint(prioritizedDebt, capacity);

       const plan: DebtPaydownPlan = {
         sprintId,
         plannedDebt,
         capacity,
         actualEffort: 0,
         completedDebt: [],
         deferredDebt: [],
         newDebtCreated: []
       };

       await this.sprintService.addDebtTasks(sprintId, plannedDebt);

       return plan;
     }

     private selectDebtForSprint(debt: TechnicalDebtItem[], capacity: number): TechnicalDebtItem[] {
       const selected: TechnicalDebtItem[] = [];
       let remainingCapacity = capacity;

       for (const item of debt) {
         if (item.effort.estimatedHours <= remainingCapacity) {
           selected.push(item);
           remainingCapacity -= item.effort.estimatedHours;
