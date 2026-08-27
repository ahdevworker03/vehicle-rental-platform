export type TaskStatus = "PENDING" | "COMPLETED";
export type TaskRecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface TaskRecord {
  id: string;
  organization_id: string;
  due_date: Date;
  status: TaskStatus;
  recurrence_type: TaskRecurrenceType;
  predecessor_id: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface TaskResponse {
  id: string;
  dueDate: string;
  status: TaskStatus;
  recurrenceType: TaskRecurrenceType;
  predecessorId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  due_date: Date;
  notes?: string;
  recurrence_type?: TaskRecurrenceType;
}

export interface UpdateTaskInput {
  due_date?: Date;
  notes?: string | null;
  recurrence_type?: TaskRecurrenceType;
}
