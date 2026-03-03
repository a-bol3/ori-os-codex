
export type NodeType =
    | 'trigger.contact.created'
    | 'trigger.deal.created'
    | 'trigger.campaign.completed'
    | 'trigger.schedule'
    | 'action.create.task'
    | 'action.send.email'
    | 'action.update.deal'
    | 'action.add.to.segment'
    | 'action.http.request'
    | 'condition.if'
    | 'delay';

export interface WorkflowNode {
    id: string;
    type: NodeType;
    config: Record<string, any>;
    next?: string[];
}

export interface WorkflowDefinition {
    nodes: WorkflowNode[];
    triggers: WorkflowNode[];
}
