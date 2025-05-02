import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import taskApi from '@/lib/taskApi';
import { TaskItem, TaskStatus } from '@/types/task';
import { toast } from 'react-hot-toast';

// react-hot-toastのモック
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

// taskApiのモック
jest.mock('@/lib/taskApi', () => ({
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe('Home', () => {
  const mockTasks: TaskItem[] = [
    {
      id: 1,
      title: 'テストタスク1',
      description: 'テスト説明1',
      status: TaskStatus.NotStarted,
      dueDate: '2023-12-31',
      assignedTo: 'テストユーザー1',
    },
    {
      id: 2,
      title: 'テストタスク2',
      description: 'テスト説明2',
      status: TaskStatus.InProgress,
      dueDate: '2023-12-31',
      assignedTo: 'テストユーザー2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (taskApi.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('タスク一覧が表示される', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    });
  });

  it('新規タスクを作成できる', async () => {
    const newTask: TaskItem = {
      id: 3,
      title: '新規タスク',
      description: '新規説明',
      status: TaskStatus.NotStarted,
      dueDate: '2023-12-31',
      assignedTo: '新規ユーザー',
    };

    (taskApi.createTask as jest.Mock).mockResolvedValue(newTask);

    render(<Home />);

    // 新規タスクボタンをクリック
    fireEvent.click(screen.getByText('新規タスク'));

    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: '新規タスク' },
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: '新規説明' },
    });
    fireEvent.change(screen.getByLabelText('期限'), {
      target: { value: '2023-12-31' },
    });
    fireEvent.change(screen.getByLabelText('担当者'), {
      target: { value: '新規ユーザー' },
    });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: '新規タスク',
        description: '新規説明',
        dueDate: '2023-12-31',
        assignedTo: '新規ユーザー',
        status: TaskStatus.NotStarted,
      });
      expect(toast.success).toHaveBeenCalledWith('タスクを作成しました');
    });
  });

  it('タスクを編集できる', async () => {
    const updatedTask: TaskItem = {
      ...mockTasks[0],
      title: '更新後のタスク',
      description: '更新後の説明',
    };

    (taskApi.updateTask as jest.Mock).mockResolvedValue(updatedTask);

    render(<Home />);

    // 編集ボタンをクリック
    await waitFor(() => {
      const editButton = screen.getByLabelText('テストタスク1を編集');
      fireEvent.click(editButton);
    });

    // フォームの値を更新
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: '更新後のタスク' },
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: '更新後の説明' },
    });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledWith(1, {
        ...mockTasks[0],
        title: '更新後のタスク',
        description: '更新後の説明',
      });
      expect(toast.success).toHaveBeenCalledWith('タスクを更新しました');
    });
  });

  it('タスクを削除できる', async () => {
    (taskApi.deleteTask as jest.Mock).mockResolvedValue(undefined);

    render(<Home />);

    // 削除ボタンをクリック
    await waitFor(() => {
      const deleteButton = screen.getByLabelText('テストタスク1を削除');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('タスクを削除しました');
    });
  });

  it('タスクのステータスを変更できる', async () => {
    const updatedTask: TaskItem = {
      ...mockTasks[0],
      status: TaskStatus.InProgress,
    };

    (taskApi.updateTask as jest.Mock).mockResolvedValue(updatedTask);

    render(<Home />);

    // ステータス変更ボタンをクリック
    await waitFor(() => {
      const statusButton = screen.getByLabelText('テストタスク1のステータスを変更');
      fireEvent.click(statusButton);
    });

    // ステータスが更新される
    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledWith(1, {
        ...mockTasks[0],
        status: TaskStatus.InProgress,
      });
      expect(toast.success).toHaveBeenCalledWith('タスクのステータスを更新しました');
    });
  });
});
