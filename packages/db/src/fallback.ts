// Fallback mock Prisma client when generation fails
export class PrismaClientMock {
    // Define properties explicitly for TypeScript
    user: any;
    contact: any;
    organization: any;
    intelligenceSearch: any;
    company: any;
    deal: any;
    workflow: any;
    sequence: any;
    inboxMessage: any;
    template: any;
    workflowTrigger: any;
    activity: any;
    executionLog: any;

    constructor() {
        const mockModel = {
            findMany: async () => [],
            findUnique: async () => null,
            findFirst: async () => null,
            create: async (args: any) => ({ ...args.data, id: 'mock-id' }),
            update: async (args: any) => ({ ...args.data, id: args.where.id }),
            delete: async (args: any) => ({ id: args.where.id }),
            count: async () => 0,
        };

        this.user = mockModel;
        this.contact = mockModel;
        this.organization = mockModel;
        this.intelligenceSearch = mockModel;
        this.company = mockModel;
        this.deal = mockModel;
        this.workflow = mockModel;
        this.sequence = mockModel;
        this.inboxMessage = mockModel;
        this.template = mockModel;
        this.workflowTrigger = mockModel;
        this.activity = mockModel;
        this.executionLog = mockModel;
    }

    async $connect() {
        console.log('Mock Database Connected');
    }

    async $disconnect() { }
}

export const PrismaClient = PrismaClientMock;
export enum UserRole { ADMIN = 'ADMIN', USER = 'USER' }
export enum MemberRole { OWNER = 'OWNER', ADMIN = 'ADMIN', MEMBER = 'MEMBER' }
