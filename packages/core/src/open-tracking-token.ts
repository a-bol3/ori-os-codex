import { BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export type OpenTrackingTokenPayload = {
  contactId: string;
  organizationId: string;
  campaignId?: string;
};

export function createOpenTrackingToken(
  payload: OpenTrackingTokenPayload,
  secret: string,
): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url',
  );

  const signature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function decodeOpenTrackingToken(
  token: string,
  secret: string,
): OpenTrackingTokenPayload {
  if (!token) {
    throw new BadRequestException('Open tracking token is required');
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    throw new BadRequestException('Invalid open tracking token');
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8'),
    )
  ) {
    throw new BadRequestException('Invalid open tracking token');
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString('utf8'),
  ) as Partial<OpenTrackingTokenPayload>;

  if (!payload.contactId || !payload.organizationId) {
    throw new BadRequestException('Invalid open tracking token');
  }

  return {
    contactId: payload.contactId,
    organizationId: payload.organizationId,
    campaignId: payload.campaignId,
  };
}
