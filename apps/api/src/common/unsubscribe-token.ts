import { BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export type UnsubscribeTokenPayload = {
  contactId: string;
  organizationId: string;
  campaignId?: string;
};

export function createUnsubscribeToken(
  payload: UnsubscribeTokenPayload,
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

export function decodeUnsubscribeToken(
  token: string,
  secret: string,
): UnsubscribeTokenPayload {
  if (!token) {
    throw new BadRequestException('Unsubscribe token is required');
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    throw new BadRequestException('Invalid unsubscribe token');
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
    throw new BadRequestException('Invalid unsubscribe token');
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString('utf8'),
  ) as Partial<UnsubscribeTokenPayload>;

  if (!payload.contactId || !payload.organizationId) {
    throw new BadRequestException('Invalid unsubscribe token');
  }

  return {
    contactId: payload.contactId,
    organizationId: payload.organizationId,
    campaignId: payload.campaignId,
  };
}
