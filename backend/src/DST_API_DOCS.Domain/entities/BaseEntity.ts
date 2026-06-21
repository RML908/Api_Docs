export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

export interface Auditable {
  createdBy: number | null;
  updatedBy: number | null;
}
