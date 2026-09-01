export type TaskStatus = "PENDING" | "COMPLETED";
export type TaskRecurrenceUnit = "DAY" | "WEEK" | "MONTH";

export interface TaskRecord {
  id: string;
  organization_id: string;
  due_date: Date;
  status: TaskStatus;
  recurrence_interval: number | null;
  recurrence_unit: TaskRecurrenceUnit | null;
  recurrence_end_date: Date | null;
  recurrence_end_count: number | null;
  occurrence_number: number;
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
  recurrenceInterval: number | null;
  recurrenceUnit: TaskRecurrenceUnit | null;
  recurrenceEndDate: string | null;
  recurrenceEndCount: number | null;
  occurrenceNumber: number;
  predecessorId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  due_date: Date;
  notes?: string;
  recurrence_interval?: number | null;
  recurrence_unit?: TaskRecurrenceUnit | null;
  recurrence_end_date?: Date | null;
  recurrence_end_count?: number | null;
}

export interface UpdateTaskInput {
  due_date?: Date;
  notes?: string | null;
  recurrence_interval?: number | null;
  recurrence_unit?: TaskRecurrenceUnit | null;
  recurrence_end_date?: Date | null;
  recurrence_end_count?: number | null;
}
