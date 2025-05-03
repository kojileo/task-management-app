export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

// デバッグヘルパー関数
export const getStatusStringFromNumber = (statusNumber: number): TaskStatus => {
  const statusValues = Object.values(TaskStatus);
  return (statusValues[statusNumber] as TaskStatus) || TaskStatus.NotStarted;
};

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}

// フォームデータ用の型定義 - dueDateは必須
export interface TaskFormData {
  id?: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}
