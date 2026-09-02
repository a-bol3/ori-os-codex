import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ResendWebhookService } from './resend-webhook.service';

function requireRawBody(req: RawBodyRequest<Request>): Buffer {
  const rawBody = req.rawBody;
  if (!rawBody) {
    throw new Error('Missing raw request body');
  }

  return Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
}

@Controller('webhooks')
export class ResendWebhookController {
  constructor(private readonly service: ResendWebhookService) {}

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async receive(
    @Headers('svix-id') id: string | undefined,
    @Headers('svix-timestamp') timestamp: string | undefined,
    @Headers('svix-signature') signature: string | undefined,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.service.handle(requireRawBody(req), {
      id,
      timestamp,
      signature,
    });
  }
}
