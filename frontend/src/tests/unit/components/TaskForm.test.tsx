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
  error: jest.fn(),
  success: jest.fn(),
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

  it('フォームが正しく表示される', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByLabelText('期限')).toBeInTheDocument();
    expect(screen.getByLabelText('担当者')).toBeInTheDocument();
  });

  it('初期データが正しく設定される', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    expect(screen.getByLabelText('タイトル')).toHaveValue(mockTask.title);
    expect(screen.getByLabelText('説明')).toHaveValue(mockTask.description);
    expect(screen.getByLabelText('ステータス')).toHaveValue(mockTask.status);
    expect(screen.getByLabelText('期限')).toHaveValue(mockTask.dueDate);
    expect(screen.getByLabelText('担当者')).toHaveValue(mockTask.assignedTo);
  });

  it('フォームの送信が正しく動作する', async () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストタスク' },
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' },
    });
    fireEvent.change(screen.getByLabelText('期限'), {
      target: { value: '2023-12-31' },
    });
    fireEvent.change(screen.getByLabelText('担当者'), {
      target: { value: 'テストユーザー' },
    });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    // onSubmitが正しい値で呼ばれることを確認
    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        title: 'テストタスク',
        description: 'テスト説明',
        dueDate: '2023-12-31',
        assignedTo: 'テストユーザー',
      });
    });
  });

  it('キャンセルボタンが正しく動作する', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    fireEvent.click(screen.getByText('キャンセル'));

    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  it('バリデーションエラーが表示される', async () => {
    render(
      <TaskForm
        task={{ ...mockTask, title: '' }}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    // タイトルを空のまま送信
    fireEvent.click(screen.getByText('保存'));

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('タイトルは必須です');
      expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
    });
  });

  it('フォームの入力が正しく更新される', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    const newTitle = '新しいタイトル';
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: newTitle },
    });

    expect(screen.getByLabelText('タイトル')).toHaveValue(newTitle);
  });
}); 