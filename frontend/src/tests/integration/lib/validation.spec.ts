import { validateTaskForm } from '@/lib/validation';
import { TaskStatus } from '@/types/task';

describe('validation Integration Tests', () => {
  describe('validateTaskForm', () => {
    const validTask = {
      title: 'テストタスク',
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    };

    it('有効なタスクデータの場合、バリデーションが成功する', () => {
      const result = validateTaskForm(validTask);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('タイトルが空の場合、エラーを返す', () => {
      const result = validateTaskForm({
        ...validTask,
        title: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('タイトルは必須です');
    });

    it('タイトルが100文字を超える場合、エラーを返す', () => {
      const result = validateTaskForm({
        ...validTask,
        title: 'a'.repeat(101),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('タイトルは100文字以内で入力してください');
    });

    it('説明が1000文字を超える場合、エラーを返す', () => {
      const result = validateTaskForm({
        ...validTask,
        description: 'a'.repeat(1001),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('説明は1000文字以内で入力してください');
    });

    it('期限が空の場合、エラーを返す', () => {
      const result = validateTaskForm({
        ...validTask,
        dueDate: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dueDate).toBe('期限は必須です');
    });

    it('担当者が空の場合、エラーを返す', () => {
      const result = validateTaskForm({
        ...validTask,
        assignedTo: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.assignedTo).toBe('担当者は必須です');
    });

    it('複数のエラーがある場合、すべてのエラーを返す', () => {
      const result = validateTaskForm({
        ...validTask,
        title: '',
        dueDate: '',
        assignedTo: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        title: 'タイトルは必須です',
        dueDate: '期限は必須です',
        assignedTo: '担当者は必須です',
      });
    });
  });
}); 