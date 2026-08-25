import {
  buildPanicChecklist,
  calculateWorkloadRisk,
  canTransitionOperationStatus,
  isOperationSeverity,
  isOperationStatus,
} from '@ori-os/core';

describe('Operations Core policy', () => {
  it('recognizes only explicit states and severities', () => {
    expect(isOperationStatus('blocked')).toBe(true);
    expect(isOperationStatus('done')).toBe(false);
    expect(isOperationSeverity('critical')).toBe(true);
    expect(isOperationSeverity('urgent')).toBe(false);
  });

  it('enforces the incident transition policy', () => {
    expect(canTransitionOperationStatus('pending', 'in_progress')).toBe(true);
    expect(canTransitionOperationStatus('resolved', 'pending')).toBe(false);
    expect(canTransitionOperationStatus('cancelled', 'pending')).toBe(true);
  });

  it('raises workload risk using hours, after-hours work and operational pressure', () => {
    expect(
      calculateWorkloadRisk({
        workedMinutes: 60 * 45,
        outsideHoursMinutes: 60 * 5,
        criticalIncidents: 2,
        overdueCommitments: 3,
      }),
    ).toEqual({ score: 78, level: 'critical' });
  });

  it('builds a guided panic checklist without external actions', () => {
    const checklist = buildPanicChecklist('safety');
    expect(checklist).toContain('Pause and confirm immediate safety risks.');
    expect(checklist).toContain('Contact emergency services if required.');
    expect(checklist.join(' ')).toContain('do not send it without approval');
  });
});
