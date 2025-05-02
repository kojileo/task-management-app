import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '@/components/TaskForm';
import { TaskItem, TaskStatus } from '@/types/task';
import { toast } from 'react-hot-toast';

// 日付のモック
const mockDate = new Date('2023-01-01');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

// react-hot-toastのモック
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('TaskForm', () => {
  const mockTask: TaskItem = {
    id: 1,
    title: 'テストタスク',
    description: 'テスト説明',
    status: TaskStatus.NotStarted,
    dueDate: '2024-12-31',
    assignedTo: 'テストユーザー',
  };

  const mockHandlers = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('フォームが正しくレンダリングされる', () => {
    render(
      <TaskForm task={mockTask} onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />
    );

    expect(screen.getByLabelText('タイトル')).toHaveValue(mockTask.title);
    expect(screen.getByLabelText('説明')).toHaveValue(mockTask.description);
    expect(screen.getByLabelText('ステータス')).toHaveValue(mockTask.status);
    expect(screen.getByLabelText('期限')).toHaveValue(mockTask.dueDate);
    expect(screen.getByLabelText('担当者')).toHaveValue(mockTask.assignedTo);
  });

  it('フォームの送信が正しく処理される', async () => {
    render(
      <TaskForm task={mockTask} onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />
    );

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    // onSubmitが正しく呼び出されることを確認
    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(mockTask);
    });
  });

  it('キャンセルボタンが正しく動作する', () => {
    render(
      <TaskForm task={mockTask} onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />
    );

    // キャンセルボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));

    // onCancelが呼び出されることを確認
    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });
});
