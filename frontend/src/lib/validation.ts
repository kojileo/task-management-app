import { TaskFormData } from '@/types/task';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateTaskForm(data: TaskFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // タイトルのバリデーション
  if (!data.title.trim()) {
    errors.title = 'タイトルは必須です';
  } else if (data.title.length > 100) {
    errors.title = 'タイトルは100文字以内で入力してください';
  }

  // 説明のバリデーション
  if (data.description.length > 1000) {
    errors.description = '説明は1000文字以内で入力してください';
  }

  // 期限のバリデーション
  if (!data.dueDate) {
    errors.dueDate = '期限は必須です';
  }

  // 担当者のバリデーション
  if (!data.assignedTo.trim()) {
    errors.assignedTo = '担当者は必須です';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
} 