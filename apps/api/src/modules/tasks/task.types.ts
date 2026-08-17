export type TaskStatus = "PENDING" | "COMPLETED";

export interface TaskRecord {
  id: string;
  organization_id: string;
  due_date: Date;
  status: TaskStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface TaskResponse {
  id: string;
  dueDate: string;
  status: TaskStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  due_date: Date;
  notes?: string;
}

export interface UpdateTaskInput {
  due_date?: Date;
  notes?: string | null;
}
