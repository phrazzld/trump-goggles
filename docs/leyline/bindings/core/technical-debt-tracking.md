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

Think of technical debt management like maintaining a detailed maintenance log for a complex machine. Every shortcut taken, every temporary fix applied, and every compromise made is documented with its impact and cost. Without this visibility, operators don't know which components are fragile, which systems are overdue for maintenance, or where the next failure is likely to occur. Eventually, the accumulation of undocumented problems leads to cascading failures that could have been prevented with systematic maintenance.

Untracked technical debt creates a vicious cycle where teams repeatedly choose short-term solutions because they don't understand the full cost of their technical choices. Each compromise makes the next one easier to justify, leading to systems that become increasingly difficult to modify, test, or operate reliably. Systematic debt tracking breaks this cycle by making the true cost of technical decisions visible and actionable.

## Rule Definition

Technical debt tracking must establish these management principles:

- **Comprehensive Identification**: Systematically identify technical debt through code reviews, architectural assessments, performance analysis, and team feedback. Don't rely on ad-hoc discovery of problems.

- **Structured Documentation**: Document each piece of technical debt with consistent metadata including impact assessment, effort estimation, business consequences, and remediation strategies.

- **Prioritization Framework**: Establish clear criteria for prioritizing technical debt based on business impact, system risk, maintenance cost, and team productivity effects.

- **Progress Tracking**: Monitor technical debt accumulation and reduction over time, ensuring that debt paydown keeps pace with new debt creation.

- **Integration with Planning**: Include technical debt work in regular development planning processes, not as an afterthought or emergency response.

- **Team Accountability**: Create clear ownership and accountability for technical debt management across development teams and product stakeholders.

**Debt Categories:**
- Code quality debt (duplication, complexity, poor structure)
- Design debt (architectural compromises, pattern violations)
- Documentation debt (missing or outdated documentation)
- Test debt (insufficient coverage, brittle tests)
- Infrastructure debt (outdated dependencies, configuration drift)
- Performance debt (scalability limitations, inefficient algorithms)

**Management Processes:**
- Regular debt assessment and cataloging
- Impact analysis and business case development
- Debt reduction planning and scheduling
- Progress monitoring and reporting
- Team education and debt awareness

## Practical Implementation

1. **Establish Debt Identification Processes**: Create systematic ways to discover technical debt through automated analysis, code reviews, and team retrospectives. Make debt identification a regular part of development workflows.

2. **Implement Debt Tracking Systems**: Use structured tools and processes to document, categorize, and track technical debt. Ensure debt information is accessible to both technical teams and business stakeholders.

3. **Develop Business Impact Models**: Translate technical debt into business terms including maintenance costs, feature velocity impact, reliability risks, and opportunity costs.

4. **Create Debt Budgets**: Allocate specific time and resources for technical debt reduction in each development cycle, treating debt paydown as a first-class work category.

5. **Monitor Debt Trends**: Track technical debt accumulation and reduction over time to ensure the system's technical health is improving or at least not degrading.

## Examples

```typescript
// ❌ BAD: No systematic technical debt tracking
class OrderService {
  // TODO: Fix this hack later
  async processOrder(order: Order): Promise<void> {
    // HACK: Quick fix for deadline - refactor later
    if (order.type === 'premium') {
      // Copy-paste from RegularOrderService - consolidate later
      await this.validatePremiumOrder(order);
      await this.processPremiumPayment(order);
      await this.sendPremiumNotification(order);
    } else {
      // FIXME: This doesn't handle edge cases properly
      await this.processRegularOrder(order);
    }

    // NOTE: Performance issue here - optimize later
    await this.updateAnalytics(order);
  }

  // TODO: Extract to separate service
  private async validatePremiumOrder(order: Order): Promise<void> {
    // Duplicated validation logic - needs refactoring
    // This is the 3rd copy of similar validation code
  }
}

// Problems:
// 1. Technical debt is documented only in comments
// 2. No tracking of debt accumulation or impact
// 3. No prioritization or planning for debt reduction
// 4. No visibility to stakeholders about technical health
// 5. No systematic approach to preventing debt accumulation
```

```typescript
// ✅ GOOD: Systematic technical debt management
interface TechnicalDebtItem {
  id: string;
  title: string;
  description: string;
  category: 'code-quality' | 'design' | 'documentation' | 'testing' | 'infrastructure' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    maintenanceCost: number; // Hours per month
    velocityImpact: number; // Percentage reduction in team velocity
    reliabilityRisk: number; // 1-10 scale
    businessConsequences: string[];
  };
  location: {
    files: string[];
    components: string[];
    systems: string[];
  };
  createdDate: Date;
  discoveredBy: string;
  estimatedEffort: {
    investigationHours: number;
    implementationHours: number;
    testingHours: number;
    migrationHours: number;
  };
  prerequisites: string[];
  remediationPlan: {
    approach: string;
    risks: string[];
    milestones: string[];
  };
  businessJustification: string;
  status: 'identified' | 'planned' | 'in-progress' | 'resolved' | 'accepted';
  assignedTo?: string;
  targetResolution?: Date;
}

class TechnicalDebtTracker {
  private debtItems = new Map<string, TechnicalDebtItem>();
  private debtHistory: TechnicalDebtHistoryEntry[] = [];

  constructor(
    private storage: DebtStorage,
    private prioritizer: DebtPrioritizer,
    private notificationService: NotificationService
  ) {}

  async identifyDebt(debtData: Partial<TechnicalDebtItem>): Promise<string> {
    const debtItem: TechnicalDebtItem = {
      id: this.generateDebtId(),
      title: debtData.title || 'Untitled Debt',
      description: debtData.description || '',
      category: debtData.category || 'code-quality',
      severity: debtData.severity || 'medium',
      impact: debtData.impact || this.calculateDefaultImpact(),
      location: debtData.location || { files: [], components: [], systems: [] },
      createdDate: new Date(),
      discoveredBy: debtData.discoveredBy || 'automated',
      estimatedEffort: debtData.estimatedEffort || this.estimateDefaultEffort(),
      prerequisites: debtData.prerequisites || [],
      remediationPlan: debtData.remediationPlan || { approach: '', risks: [], milestones: [] },
      businessJustification: debtData.businessJustification || '',
      status: 'identified'
    };

    // Validate debt item
    this.validateDebtItem(debtItem);

    // Store debt item
    this.debtItems.set(debtItem.id, debtItem);
    await this.storage.save(debtItem);

    // Record in history
    this.recordDebtEvent(debtItem.id, 'identified', { discoveredBy: debtItem.discoveredBy });

    // Notify stakeholders if high severity
    if (debtItem.severity === 'high' || debtItem.severity === 'critical') {
      await this.notificationService.notifyHighSeverityDebt(debtItem);
    }

    console.log(`Technical debt identified: ${debtItem.title} (${debtItem.id})`);
    return debtItem.id;
  }

  async prioritizeDebt(): Promise<TechnicalDebtItem[]> {
    const allDebt = Array.from(this.debtItems.values())
      .filter(item => item.status === 'identified' || item.status === 'planned');

    // Use prioritization framework
    const prioritizedDebt = await this.prioritizer.prioritize(allDebt);

    // Update priority scores
    for (const item of prioritizedDebt) {
      item.businessJustification = this.prioritizer.generateBusinessJustification(item);
    }

    return prioritizedDebt;
  }

  async planDebtReduction(sprintCapacity: number): Promise<DebtReductionPlan> {
    const prioritizedDebt = await this.prioritizeDebt();
    const plan: DebtReductionPlan = {
      sprintCapacity,
      selectedItems: [],
      totalEffort: 0,
      expectedBenefits: {
        velocityImprovement: 0,
        riskReduction: 0,
        maintenanceSavings: 0
      }
    };

    // Select debt items that fit within capacity
    for (const debtItem of prioritizedDebt) {
      const totalEffort = this.calculateTotalEffort(debtItem);

      if (plan.totalEffort + totalEffort <= sprintCapacity) {
        plan.selectedItems.push(debtItem);
        plan.totalEffort += totalEffort;

        // Accumulate expected benefits
        plan.expectedBenefits.velocityImprovement += debtItem.impact.velocityImpact;
        plan.expectedBenefits.riskReduction += debtItem.impact.reliabilityRisk;
        plan.expectedBenefits.maintenanceSavings += debtItem.impact.maintenanceCost * 12; // Annual savings

        // Mark as planned
        debtItem.status = 'planned';
        await this.storage.save(debtItem);
      }
    }

    this.recordDebtEvent('plan', 'created', {
      itemCount: plan.selectedItems.length,
      totalEffort: plan.totalEffort
    });

    return plan;
  }

  async resolveDebt(debtId: string, resolutionDetails: DebtResolution): Promise<void> {
    const debtItem = this.debtItems.get(debtId);
    if (!debtItem) {
      throw new Error(`Technical debt item not found: ${debtId}`);
    }

    // Update status
    debtItem.status = 'resolved';

    // Record resolution details
    this.recordDebtEvent(debtId, 'resolved', {
      approach: resolutionDetails.approach,
      actualEffort: resolutionDetails.actualEffort,
      measuredImpact: resolutionDetails.measuredImpact
    });

    // Update storage
    await this.storage.save(debtItem);

    // Calculate and report impact
    const impactReport = this.calculateResolutionImpact(debtItem, resolutionDetails);
    await this.notificationService.notifyDebtResolution(debtItem, impactReport);

    console.log(`Technical debt resolved: ${debtItem.title}`);
  }

  generateDebtReport(): TechnicalDebtReport {
    const allDebt = Array.from(this.debtItems.values());

    const report: TechnicalDebtReport = {
      summary: {
        totalItems: allDebt.length,
        byStatus: this.groupByStatus(allDebt),
        bySeverity: this.groupBySeverity(allDebt),
        byCategory: this.groupByCategory(allDebt)
      },
      trends: this.calculateTrends(),
      topPriorities: this.getTopPriorities(5),
      recommendations: this.generateRecommendations(),
      businessImpact: this.calculateBusinessImpact(allDebt)
    };

    return report;
  }

  private calculateDefaultImpact() {
    return {
      maintenanceCost: 2, // 2 hours per month default
      velocityImpact: 5, // 5% velocity reduction default
      reliabilityRisk: 3, // Medium reliability risk default
      businessConsequences: ['Increased maintenance overhead']
    };
  }

  private estimateDefaultEffort() {
    return {
      investigationHours: 4,
      implementationHours: 16,
      testingHours: 8,
      migrationHours: 4
    };
  }

  private calculateTotalEffort(debtItem: TechnicalDebtItem): number {
    const effort = debtItem.estimatedEffort;
    return effort.investigationHours + effort.implementationHours +
           effort.testingHours + effort.migrationHours;
  }

  private calculateTrends(): DebtTrends {
    const last30Days = this.debtHistory.filter(
      entry => entry.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const identified = last30Days.filter(entry => entry.action === 'identified').length;
    const resolved = last30Days.filter(entry => entry.action === 'resolved').length;

    return {
      newDebtRate: identified / 30, // Per day
      resolutionRate: resolved / 30, // Per day
      netChange: identified - resolved,
      trend: identified > resolved ? 'increasing' : 'decreasing'
    };
  }

  private recordDebtEvent(debtId: string, action: string, metadata: any): void {
    this.debtHistory.push({
      timestamp: new Date(),
      debtId,
      action,
      metadata
    });
  }
}

// Business impact calculation
class DebtPrioritizer {
  prioritize(debtItems: TechnicalDebtItem[]): TechnicalDebtItem[] {
    return debtItems.sort((a, b) => {
      const scoreA = this.calculatePriorityScore(a);
      const scoreB = this.calculatePriorityScore(b);
      return scoreB - scoreA; // Higher scores first
    });
  }

  private calculatePriorityScore(debt: TechnicalDebtItem): number {
    // Weighted scoring algorithm
    const severityWeight = { low: 1, medium: 2, high: 4, critical: 8 }[debt.severity];
    const impactScore = (debt.impact.maintenanceCost * 2) +
                       (debt.impact.velocityImpact * 3) +
                       (debt.impact.reliabilityRisk * 4);
    const effortPenalty = this.calculateEffortPenalty(debt);

    return (severityWeight * impactScore) / effortPenalty;
  }

  private calculateEffortPenalty(debt: TechnicalDebtItem): number {
    const totalEffort = debt.estimatedEffort.investigationHours +
                       debt.estimatedEffort.implementationHours +
                       debt.estimatedEffort.testingHours +
                       debt.estimatedEffort.migrationHours;

    // Logarithmic penalty for effort - prefer smaller tasks
    return Math.log(Math.max(1, totalEffort));
  }

  generateBusinessJustification(debt: TechnicalDebtItem): string {
    const annualCost = debt.impact.maintenanceCost * 12 * 50; // $50/hour assumption
    const velocityImpact = debt.impact.velocityImpact;
    const reliabilityRisk = debt.impact.reliabilityRisk;

    return `Annual cost: $${annualCost}, Velocity impact: ${velocityImpact}%, Reliability risk: ${reliabilityRisk}/10`;
  }
}

// Usage in development workflow
class OrderServiceWithDebtTracking {
  constructor(
    private debtTracker: TechnicalDebtTracker,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  async processOrder(order: Order): Promise<void> {
    // Well-structured code with systematic debt management

    if (order.type === 'premium') {
      await this.processPremiumOrder(order);
    } else {
      await this.processRegularOrder(order);
    }

    // Performance optimization scheduled as tracked debt
    await this.updateAnalytics(order);
  }

  private async processPremiumOrder(order: Order): Promise<void> {
    // Consolidated premium order logic
    await this.validatePremiumOrder(order);
    await this.paymentService.processPremiumPayment(order);
    await this.notificationService.sendPremiumNotification(order);
  }

  // When identifying technical debt
  async identifyValidationDuplication(): Promise<void> {
    await this.debtTracker.identifyDebt({
      title: 'Duplicated Order Validation Logic',
      description: 'Order validation logic is duplicated across OrderService, PremiumOrderService, and BulkOrderService',
      category: 'code-quality',
      severity: 'medium',
      impact: {
        maintenanceCost: 8, // 8 hours per month maintaining 3 copies
        velocityImpact: 15, // 15% slower feature development
        reliabilityRisk: 6, // Medium-high risk of inconsistent validation
        businessConsequences: [
          'Inconsistent validation between order types',
          'Increased bug fixing overhead',
          'Slower feature development'
        ]
      },
      location: {
        files: [
          'src/services/OrderService.ts',
          'src/services/PremiumOrderService.ts',
          'src/services/BulkOrderService.ts'
        ],
        components: ['OrderProcessing'],
        systems: ['OrderManagement']
      },
      estimatedEffort: {
        investigationHours: 4,
        implementationHours: 12,
        testingHours: 8,
        migrationHours: 2
      },
      remediationPlan: {
        approach: 'Extract common validation logic into shared OrderValidator service',
        risks: ['Potential behavior changes during consolidation'],
        milestones: [
          'Create OrderValidator interface',
          'Implement consolidated validation logic',
          'Migrate existing services',
          'Remove duplicated code'
        ]
      },
      businessJustification: 'Reduces maintenance overhead and improves consistency'
    });
  }
}

interface TechnicalDebtReport {
  summary: {
    totalItems: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  };
  trends: DebtTrends;
  topPriorities: TechnicalDebtItem[];
  recommendations: string[];
  businessImpact: {
    totalAnnualCost: number;
    velocityImpact: number;
    riskScore: number;
  };
}

interface DebtTrends {
  newDebtRate: number;
  resolutionRate: number;
  netChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface DebtReductionPlan {
  sprintCapacity: number;
  selectedItems: TechnicalDebtItem[];
  totalEffort: number;
  expectedBenefits: {
    velocityImprovement: number;
    riskReduction: number;
    maintenanceSavings: number;
  };
}

interface DebtResolution {
  approach: string;
  actualEffort: number;
  measuredImpact: {
    velocityImprovement?: number;
    performanceGain?: number;
    maintenanceReduction?: number;
  };
}

interface TechnicalDebtHistoryEntry {
  timestamp: Date;
  debtId: string;
  action: string;
  metadata: any;
}
```

```python
# ❌ BAD: Ad-hoc debt management with no visibility
class DataProcessor:
    def process_data(self, data):
        # TODO: This is really slow, fix later
        results = []
        for item in data:
            # HACK: Quick fix for edge case
            if item.get('special_flag'):
                # Copy-pasted logic from another service
                result = self.special_processing(item)
            else:
                result = self.normal_processing(item)
            results.append(result)

        # FIXME: Memory leak here with large datasets
        return results

# ✅ GOOD: Systematic debt tracking with automation
import sqlite3
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from datetime import datetime
import json

@dataclass
class TechnicalDebt:
    id: str
    title: str
    description: str
    category: str
    severity: str
    file_path: str
    line_number: int
    created_date: datetime
    estimated_hours: int
    impact_score: int
    status: str = 'open'
    assigned_to: Optional[str] = None
    resolution_date: Optional[datetime] = None

class TechnicalDebtManager:
    def __init__(self, db_path: str = 'technical_debt.db'):
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS technical_debt (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                severity TEXT,
                file_path TEXT,
                line_number INTEGER,
                created_date TEXT,
                estimated_hours INTEGER,
                impact_score INTEGER,
                status TEXT DEFAULT 'open',
                assigned_to TEXT,
                resolution_date TEXT,
                metadata TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def add_debt(self, debt: TechnicalDebt) -> str:
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            INSERT INTO technical_debt
            (id, title, description, category, severity, file_path, line_number,
             created_date, estimated_hours, impact_score, status, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            debt.id, debt.title, debt.description, debt.category, debt.severity,
            debt.file_path, debt.line_number, debt.created_date.isoformat(),
            debt.estimated_hours, debt.impact_score, debt.status, debt.assigned_to
        ))
        conn.commit()
        conn.close()

        print(f"Technical debt tracked: {debt.title} ({debt.id})")
        return debt.id

    def get_debt_by_priority(self) -> List[TechnicalDebt]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute('''
            SELECT * FROM technical_debt
            WHERE status = 'open'
            ORDER BY
                CASE severity
                    WHEN 'critical' THEN 4
                    WHEN 'high' THEN 3
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 1
                END DESC,
                impact_score DESC,
                estimated_hours ASC
        ''')

        debts = []
        for row in cursor.fetchall():
            debt = TechnicalDebt(
                id=row[0], title=row[1], description=row[2], category=row[3],
                severity=row[4], file_path=row[5], line_number=row[6],
                created_date=datetime.fromisoformat(row[7]),
                estimated_hours=row[8], impact_score=row[9], status=row[10],
                assigned_to=row[11]
            )
            debts.append(debt)

        conn.close()
        return debts

    def generate_report(self) -> Dict:
        conn = sqlite3.connect(self.db_path)

        # Summary statistics
        cursor = conn.execute('SELECT COUNT(*) FROM technical_debt WHERE status = "open"')
        open_count = cursor.fetchone()[0]

        cursor = conn.execute('SELECT severity, COUNT(*) FROM technical_debt WHERE status = "open" GROUP BY severity')
        severity_breakdown = dict(cursor.fetchall())

        cursor = conn.execute('SELECT SUM(estimated_hours) FROM technical_debt WHERE status = "open"')
        total_hours = cursor.fetchone()[0] or 0

        cursor = conn.execute('SELECT AVG(impact_score) FROM technical_debt WHERE status = "open"')
        avg_impact = cursor.fetchone()[0] or 0

        # Trend analysis
        cursor = conn.execute('''
            SELECT DATE(created_date) as date, COUNT(*)
            FROM technical_debt
            WHERE created_date >= date('now', '-30 days')
            GROUP BY DATE(created_date)
            ORDER BY date
        ''')
        daily_creation = dict(cursor.fetchall())

        conn.close()

        return {
            'summary': {
                'total_open_items': open_count,
                'severity_breakdown': severity_breakdown,
                'total_estimated_hours': total_hours,
                'average_impact_score': round(avg_impact, 2)
            },
            'trends': {
                'daily_creation_last_30_days': daily_creation
            },
            'business_impact': {
                'estimated_annual_cost': total_hours * 75,  # $75/hour assumption
                'velocity_impact_percentage': min(avg_impact * 2, 50)  # Cap at 50%
            }
        }

# Automated debt detection
class DebtDetector:
    def __init__(self, debt_manager: TechnicalDebtManager):
        self.debt_manager = debt_manager
        self.debt_patterns = {
            'TODO': {'severity': 'low', 'category': 'documentation'},
            'FIXME': {'severity': 'medium', 'category': 'bug'},
            'HACK': {'severity': 'high', 'category': 'code-quality'},
            'XXX': {'severity': 'high', 'category': 'code-quality'}
        }

    def scan_file(self, file_path: str):
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()

            for line_num, line in enumerate(lines, 1):
                for pattern, config in self.debt_patterns.items():
                    if pattern in line:
                        debt_id = f"{file_path}:{line_num}:{pattern}"

                        debt = TechnicalDebt(
                            id=debt_id,
                            title=f"{pattern} comment in {file_path}",
                            description=line.strip(),
                            category=config['category'],
                            severity=config['severity'],
                            file_path=file_path,
                            line_number=line_num,
                            created_date=datetime.now(),
                            estimated_hours=self.estimate_effort(pattern, line),
                            impact_score=self.calculate_impact(config['severity'])
                        )

                        self.debt_manager.add_debt(debt)

        except Exception as e:
            print(f"Error scanning {file_path}: {e}")

    def estimate_effort(self, pattern: str, line: str) -> int:
        base_hours = {
            'TODO': 2,
            'FIXME': 4,
            'HACK': 8,
            'XXX': 6
        }

        # Adjust based on comment length and complexity indicators
        effort = base_hours.get(pattern, 4)
        if len(line) > 100:
            effort *= 1.5
        if any(word in line.lower() for word in ['complex', 'refactor', 'rewrite']):
            effort *= 2

        return int(effort)

    def calculate_impact(self, severity: str) -> int:
        return {
            'low': 2,
            'medium': 5,
            'high': 8,
            'critical': 10
        }.get(severity, 3)

# Usage example
debt_manager = TechnicalDebtManager()
debt_detector = DebtDetector(debt_manager)

# Scan codebase for debt
debt_detector.scan_file('src/data_processor.py')

# Get prioritized debt list
priority_debt = debt_manager.get_debt_by_priority()
print(f"Top priority debt: {priority_debt[0].title if priority_debt else 'None'}")

# Generate business report
report = debt_manager.generate_report()
print(f"Technical debt report: {json.dumps(report, indent=2)}")
```

## Related Bindings

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): Quality gates help prevent technical debt accumulation by catching problems before they enter the codebase. Both bindings work together to maintain system quality—quality gates prevent new debt while debt tracking manages existing debt.

- [continuous-refactoring.md](../../docs/bindings/core/continuous-refactoring.md): Technical debt tracking identifies refactoring opportunities while continuous refactoring provides the systematic approach to debt reduction. Both bindings create a comprehensive approach to maintaining code quality over time.

- [no-lint-suppression.md](../../docs/bindings/core/no-lint-suppression.md): Lint suppression often indicates technical debt or quality compromises. Technical debt tracking should include lint suppressions as debt items that need systematic resolution rather than accumulation.

- [require-conventional-commits.md](../../docs/bindings/core/require-conventional-commits.md): Conventional commits can be analyzed to track technical debt patterns and identify when debt-creating changes are being made. Both bindings support systematic quality management through better visibility and tracking.
