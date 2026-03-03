import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@ori-os/db';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(private readonly cls: ClsService) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    get tenantClient(): any {
        const organizationId = this.cls.get('organizationId');

        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }: any) {
                        // Models that should be scoped by organizationId
                        const scopedModels = [
                            'Company', 'Contact', 'Deal', 'Activity', 'Task',
                            'Segment', 'Campaign', 'EmailTemplate', 'Workflow',
                            'WorkflowRun', 'Event', 'AuditLog', 'Domain', 'Mailbox'
                        ];

                        if (scopedModels.includes(model) && organizationId) {
                            if (['findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                                args.where = { ...args.where, organizationId };
                            }
                            if (['update', 'updateMany', 'upsert', 'delete', 'deleteMany'].includes(operation)) {
                                args.where = { ...args.where, organizationId };
                            }
                            if (['create', 'createMany'].includes(operation)) {
                                if ('data' in args) {
                                    if (Array.isArray(args.data)) {
                                        args.data = args.data.map((d: any) => ({ ...d, organizationId }));
                                    } else {
                                        args.data = { ...args.data, organizationId };
                                    }
                                }
                            }
                        }
                        return query(args);
                    },
                },
            },
        });
    }
}
