import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(private readonly cls: ClsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // In production, organizationId MUST come from the authenticated user context (JWT/Session)
        // We only allow the 'x-organization-id' header for development/testing purposes
        const isProduction = process.env.NODE_ENV === 'production';
        const headerOrgId = request.headers['x-organization-id'];
        const userOrgId = request.user?.organizationId;

        let organizationId = userOrgId;

        if (!isProduction && headerOrgId) {
            organizationId = headerOrgId;
        }

        if (organizationId) {
            this.cls.set('organizationId', organizationId);
        }

        return next.handle();
    }
}
