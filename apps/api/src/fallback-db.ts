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
    const createStore = () => {
      const store: any[] = [];
      return {
        findMany: async () => store,
        findUnique: async (args: any) =>
          store.find((item) => item.id === args.where.id) || null,
        findFirst: async (args: any) => store[0] || null,
        create: async (args: any) => {
          const newItem = {
            ...args.data,
            id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          store.push(newItem);
          return newItem;
        },
        update: async (args: any) => {
          const index = store.findIndex((item) => item.id === args.where.id);
          if (index > -1) {
            store[index] = { ...store[index], ...args.data };
            return store[index];
          }
          return null;
        },
        delete: async (args: any) => {
          const index = store.findIndex((item) => item.id === args.where.id);
          if (index > -1) {
            const deleted = store[index];
            store.splice(index, 1);
            return deleted;
          }
          return null;
        },
        count: async () => store.length,
      };
    };

    this.user = createStore();
    this.contact = createStore();
    this.organization = createStore();
    this.intelligenceSearch = createStore();
    this.company = createStore();
    this.deal = createStore();
    this.workflow = createStore();
    this.sequence = createStore();
    this.inboxMessage = createStore();
    this.template = createStore();
    this.workflowTrigger = createStore();
    this.activity = createStore();
    this.executionLog = createStore();
  }

  async $connect() {
    console.log('Mock Database Connected');
  }

  async $disconnect() {}
}

export const PrismaClient = PrismaClientMock;
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}
