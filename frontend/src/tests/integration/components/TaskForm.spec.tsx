import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { toast } from 'react-hot-toast';
import TaskForm from '@/components/TaskForm';
import { TaskStatus } from '@/types/task';

// モックの設定
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TaskForm Integration Tests', () => {
  const mockTask = {
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

  it('新規タスク作成フォームが正しく表示される', async () => {
    await act(async () => {
      render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);
    });

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByLabelText('期限')).toBeInTheDocument();
    expect(screen.getByLabelText('担当者')).toBeInTheDocument();
  });

  it('既存タスクの編集フォームが正しく表示される', async () => {
    await act(async () => {
      render(
        <TaskForm
          task={mockTask}
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
    });

    expect(screen.getByLabelText('タイトル')).toHaveValue(mockTask.title);
    expect(screen.getByLabelText('説明')).toHaveValue(mockTask.description);
    expect(screen.getByLabelText('ステータス')).toHaveValue(mockTask.status);
    expect(screen.getByLabelText('期限')).toHaveValue(mockTask.dueDate);
    expect(screen.getByLabelText('担当者')).toHaveValue(mockTask.assignedTo);
  });

  it('フォームの送信が正しく動作する', async () => {
    await act(async () => {
      render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), {
        target: { value: 'テストタスク' },
      });
      fireEvent.change(screen.getByLabelText('説明'), {
        target: { value: 'テスト説明' },
      });
      fireEvent.change(screen.getByLabelText('ステータス'), {
        target: { value: TaskStatus.NotStarted },
      });
      fireEvent.change(screen.getByLabelText('期限'), {
        target: { value: '2024-12-31' },
      });
      fireEvent.change(screen.getByLabelText('担当者'), {
        target: { value: 'テストユーザー' },
      });
    });

    const form = screen.getByTestId('task-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
      title: 'テストタスク',
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    });
  });

  it('キャンセルボタンが正しく動作する', async () => {
    await act(async () => {
      render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);
    });

    const cancelButton = screen.getByText('キャンセル');
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  it('バリデーションエラーが正しく表示される', async () => {
    await act(async () => {
      render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);
    });

    const form = screen.getByTestId('task-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(toast.error).toHaveBeenCalled();
    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });
});
