import { validateTaskForm } from '@/lib/validation';
import { TaskStatus } from '@/types/task';

// 日付のモック
const mockDate = new Date('2023-01-01');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

describe('validateTaskForm', () => {
  it('有効なタスクフォームデータを検証する', () => {
    const validData = {
      title: 'テストタスク',
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    };

    const result = validateTaskForm(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('タイトルが空の場合にエラーを返す', () => {
    const invalidData = {
      title: '',
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    };

    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('タイトルは必須です');
  });

  it('タイトルが長すぎる場合にエラーを返す', () => {
    const invalidData = {
      title: 'a'.repeat(101),
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    };

    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('タイトルは100文字以内で入力してください');
  });

  it('説明が長すぎる場合にエラーを返す', () => {
    const invalidData = {
      title: 'テストタスク',
      description: 'a'.repeat(1001),
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    };

    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('説明は1000文字以内で入力してください');
  });

  it('担当者が空の場合にエラーを返す', () => {
    const invalidData = {
      title: 'テストタスク',
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: '',
    };

    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.assignedTo).toBe('担当者は必須です');
  });
}); 