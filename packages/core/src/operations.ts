export const OPERATION_STATUSES = [
  'pending',
  'in_progress',
  'blocked',
  'resolved',
  'cancelled',
] as const;

export const OPERATION_SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type OperationStatus = (typeof OPERATION_STATUSES)[number];
export type OperationSeverity = (typeof OPERATION_SEVERITIES)[number];

const ALLOWED_TRANSITIONS: Record<OperationStatus, OperationStatus[]> = {
  pending: ['in_progress', 'blocked', 'resolved', 'cancelled'],
  in_progress: ['blocked', 'resolved', 'cancelled'],
  blocked: ['in_progress', 'resolved', 'cancelled'],
  resolved: ['in_progress'],
  cancelled: ['pending'],
};

export function isOperationStatus(value: unknown): value is OperationStatus {
  return typeof value === 'string' && OPERATION_STATUSES.includes(value as OperationStatus);
}

export function isOperationSeverity(value: unknown): value is OperationSeverity {
  return typeof value === 'string' && OPERATION_SEVERITIES.includes(value as OperationSeverity);
}

export function canTransitionOperationStatus(
  current: OperationStatus,
  next: OperationStatus,
): boolean {
  return current === next || ALLOWED_TRANSITIONS[current].includes(next);
}

export function calculateWorkloadRisk(input: {
  workedMinutes: number;
  outsideHoursMinutes: number;
  criticalIncidents: number;
  overdueCommitments: number;
}): { score: number; level: OperationSeverity } {
  const weeklyHoursScore = Math.min(40, Math.round(input.workedMinutes / 60));
  const outsideHoursScore = Math.min(20, Math.round(input.outsideHoursMinutes / 30));
  const incidentScore = Math.min(24, input.criticalIncidents * 8);
  const commitmentScore = Math.min(16, input.overdueCommitments * 4);
  const score = Math.min(
    100,
    weeklyHoursScore + outsideHoursScore + incidentScore + commitmentScore,
  );

  if (score >= 75) return { score, level: 'critical' };
  if (score >= 50) return { score, level: 'high' };
  if (score >= 25) return { score, level: 'medium' };
  return { score, level: 'low' };
}

export type PanicCategory =
  | 'safety'
  | 'missing_worker'
  | 'serious_conflict'
  | 'accommodation_transport'
  | 'documentation'
  | 'client_escalation'
  | 'payroll'
  | 'personal_overload'
  | 'operational';

export function buildPanicChecklist(category: PanicCategory): string[] {
  const common = [
    'Pause and confirm immediate safety risks.',
    'Write down confirmed facts and separate them from assumptions.',
    'Identify the responsible internal owner and the next decision deadline.',
    'Prepare a neutral acknowledgement; do not send it without approval.',
  ];

  const categorySteps: Record<PanicCategory, string[]> = {
    safety: ['Contact emergency services if required.', 'Preserve the incident timeline and witnesses.'],
    missing_worker: ['Check the last confirmed contact and location.', 'Contact the agreed escalation person.'],
    serious_conflict: ['Separate the parties if safe to do so.', 'Record statements without assigning blame.'],
    accommodation_transport: ['Confirm who is affected and for how long.', 'Identify a safe temporary alternative.'],
    documentation: ['Identify the missing or expired document.', 'Escalate to the legalisation owner.'],
    client_escalation: ['Confirm the client impact and deadline.', 'Prepare two practical resolution options.'],
    payroll: ['Confirm the disputed period and amount.', 'Escalate to payroll without promising an outcome.'],
    personal_overload: ['Stop accepting new non-critical work.', 'List what can be delegated or postponed.'],
    operational: ['Identify the blocked process.', 'Choose the smallest safe next action.'],
  };

  return [...common, ...categorySteps[category]];
}

