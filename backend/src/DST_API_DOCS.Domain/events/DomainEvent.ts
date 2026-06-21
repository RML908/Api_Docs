export interface DomainEvent {
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: number;
}

export class EndpointCreatedEvent implements DomainEvent {
  readonly eventType = 'EndpointCreated';
  readonly occurredAt = new Date();
  constructor(public readonly aggregateId: number, public readonly groupId: number) {}
}

export class EndpointStatusChangedEvent implements DomainEvent {
  readonly eventType = 'EndpointStatusChanged';
  readonly occurredAt = new Date();
  constructor(
    public readonly aggregateId: number,
    public readonly previousStatus: string,
    public readonly newStatus: string,
  ) {}
}

export class GroupDeletedEvent implements DomainEvent {
  readonly eventType = 'GroupDeleted';
  readonly occurredAt = new Date();
  constructor(public readonly aggregateId: number) {}
}
