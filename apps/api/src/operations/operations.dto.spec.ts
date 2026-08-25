import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateIncidentDto, UpdateIncidentDto } from './operations.dto';

describe('Operations Core API validation', () => {
  it('rejects empty incident titles and unknown severities', async () => {
    const dto = plainToInstance(CreateIncidentDto, {
      title: '',
      severity: 'urgent',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['title', 'severity']),
    );
  });

  it('accepts the explicit status vocabulary', async () => {
    const dto = plainToInstance(UpdateIncidentDto, {
      status: 'in_progress',
      severity: 'high',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
