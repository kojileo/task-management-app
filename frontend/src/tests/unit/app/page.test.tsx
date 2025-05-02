import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import Home from '@/app/page';
import taskApi from '@/lib/taskApi';
import { TaskStatus } from '@/types/task';

// toastのモック
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// taskApiのモック
jest.mock('@/lib/taskApi', () => ({
  __esModule: true,
  default: {
    getAllTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

describe('Home', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'テストタスク1',
      description: 'テスト説明1',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー1',
    },
    {
      id: 2,
      title: 'テストタスク2',
      description: 'テスト説明2',
      status: TaskStatus.InProgress,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (taskApi.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('初期表示時にタスク一覧が正しく表示される', async () => {
    await act(async () => {
      render(<Home />);
    });

    // タスク一覧が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    });
  });

  it('新規タスク作成フォームが表示される', async () => {
    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('タスク管理')).toBeInTheDocument();
    });

    // 新規タスクボタンをクリック
    const newTaskButton = screen.getByRole('button', { name: /新規タスク/ });
    await act(async () => {
      fireEvent.click(newTaskButton);
    });

    // フォームが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByLabelText('期限')).toBeInTheDocument();
    expect(screen.getByLabelText('担当者')).toBeInTheDocument();
  });

  it('タスクの作成が成功する', async () => {
    const newTask = {
      id: 3,
      title: '新規タスク',
      description: '新規説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: '新規ユーザー',
    };

    (taskApi.getAllTasks as jest.Mock).mockResolvedValue([]);
    (taskApi.createTask as jest.Mock).mockResolvedValue(newTask);

    await act(async () => {
      render(<Home />);
    });

    // 新規タスクボタンをクリック
    const newTaskButton = screen.getByRole('button', { name: /新規タスク/ });
    await act(async () => {
      fireEvent.click(newTaskButton);
    });

    // フォームに入力
    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), {
        target: { value: newTask.title },
      });
      fireEvent.change(screen.getByLabelText('説明'), {
        target: { value: newTask.description },
      });
      fireEvent.change(screen.getByLabelText('ステータス'), {
        target: { value: newTask.status },
      });
      fireEvent.change(screen.getByLabelText('期限'), {
        target: { value: newTask.dueDate },
      });
      fireEvent.change(screen.getByLabelText('担当者'), {
        target: { value: newTask.assignedTo },
      });
    });

    // フォームを送信
    await act(async () => {
      fireEvent.submit(screen.getByTestId('task-form'));
    });

    await waitFor(() => {
      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        dueDate: newTask.dueDate,
        assignedTo: newTask.assignedTo,
      });
      expect(toast.success).toHaveBeenCalledWith('タスクを作成しました');
    });
  });

  it('タスクの作成に失敗した場合、エラーメッセージが表示される', async () => {
    (taskApi.getAllTasks as jest.Mock).mockResolvedValue([]);
    (taskApi.createTask as jest.Mock).mockRejectedValue(new Error('タスクの作成に失敗しました'));

    await act(async () => {
      render(<Home />);
    });

    // 新規タスクボタンをクリック
    const newTaskButton = screen.getByRole('button', { name: /新規タスク/ });
    await act(async () => {
      fireEvent.click(newTaskButton);
    });

    // フォームに入力
    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), {
        target: { value: '新規タスク' },
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

    // フォームを送信
    const form = screen.getByTestId('task-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: '新規タスク',
        description: 'テスト説明',
        status: TaskStatus.NotStarted,
        dueDate: '2024-12-31',
        assignedTo: 'テストユーザー',
      });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('タスクの作成に失敗しました');
    }, { timeout: 3000 });
  });

  it('タスクの編集が成功する', async () => {
    const updatedTask = {
      ...mockTasks[0],
      title: '更新されたタスク',
      description: '更新された説明',
    };

    (taskApi.updateTask as jest.Mock).mockResolvedValue(updatedTask);

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId(`edit-button-${mockTasks[0].id}`));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), {
        target: { value: updatedTask.title },
      });
      fireEvent.change(screen.getByLabelText('説明'), {
        target: { value: updatedTask.description },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('保存'));
    });

    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledWith(mockTasks[0].id, {
        ...mockTasks[0],
        title: updatedTask.title,
        description: updatedTask.description,
      });
      expect(toast.success).toHaveBeenCalledWith('タスクを更新しました');
      expect(screen.getByText(updatedTask.title)).toBeInTheDocument();
    });
  });

  it('タスクの削除が成功する', async () => {
    (taskApi.deleteTask as jest.Mock).mockResolvedValue({});

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId(`delete-button-${mockTasks[0].id}`));
    });

    await waitFor(() => {
      expect(taskApi.deleteTask).toHaveBeenCalledWith(mockTasks[0].id);
      expect(toast.success).toHaveBeenCalledWith('タスクを削除しました');
      expect(screen.queryByText(mockTasks[0].title)).not.toBeInTheDocument();
    });
  });
}); 