export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}

// フォームデータ用の型定義 - dueDateは必須
export type TaskFormData = Omit<TaskItem, 'id'>;
