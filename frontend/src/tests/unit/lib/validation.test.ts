import { validateTaskForm } from '@/lib/validation';
import { TaskFormData, TaskStatus } from '@/types/task';

// 日付のモック
const mockDate = new Date('2023-01-01');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

describe('validateTaskForm', () => {
  const validFormData: TaskFormData = {
    title: 'テストタスク',
    description: 'テスト説明',
    status: TaskStatus.NotStarted,
    dueDate: '2024-12-31',
    assignedTo: 'テストユーザー',
  };

  it('有効なフォームデータを検証する', () => {
    const result = validateTaskForm(validFormData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('タイトルが空の場合にエラーを返す', () => {
    const invalidData = { ...validFormData, title: '' };
    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('タイトルは必須です');
  });

  it('タイトルが100文字を超える場合にエラーを返す', () => {
    const invalidData = { ...validFormData, title: 'a'.repeat(101) };
    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('タイトルは100文字以内で入力してください');
  });

  it('説明が1000文字を超える場合にエラーを返す', () => {
    const invalidData = { ...validFormData, description: 'a'.repeat(1001) };
    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('説明は1000文字以内で入力してください');
  });

  it('期限が空の場合にエラーを返す', () => {
    const invalidData = { ...validFormData, dueDate: '' };
    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.dueDate).toBe('期限は必須です');
  });

  it('担当者が空の場合にエラーを返す', () => {
    const invalidData = { ...validFormData, assignedTo: '' };
    const result = validateTaskForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.assignedTo).toBe('担当者は必須です');
  });
});
