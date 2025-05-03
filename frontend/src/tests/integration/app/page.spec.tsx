import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { toast } from 'react-hot-toast';
import Home from '@/app/page';
import taskApi from '@/lib/taskApi';
import { TaskStatus } from '@/types/task';

// モックの設定
jest.mock('@/lib/taskApi');
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Home Integration Tests', () => {
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
    (taskApi.getTaskById as jest.Mock).mockImplementation(id =>
      Promise.resolve(mockTasks.find(task => task.id === id) || mockTasks[0])
    );
  });

  it('タスクの作成から削除までの一連の操作が正しく動作する', async () => {
    await act(async () => {
      render(<Home />);
    });

    // 初期表示の確認
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    });

    // 新規タスク作成
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
        target: { value: '新規説明' },
      });
      fireEvent.change(screen.getByLabelText('ステータス'), {
        target: { value: TaskStatus.NotStarted },
      });
      fireEvent.change(screen.getByLabelText('期限'), {
        target: { value: '2024-12-31' },
      });
      fireEvent.change(screen.getByLabelText('担当者'), {
        target: { value: '新規ユーザー' },
      });
    });

    // タスク作成APIのモック設定
    const newTaskResponse = {
      id: 3,
      title: '新規タスク',
      description: '新規説明',
      status: 0, // 数値のステータス
      dueDate: '2024-12-31',
      assignedTo: '新規ユーザー',
    };
    const newTask = {
      id: 3,
      title: '新規タスク',
      description: '新規説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: '新規ユーザー',
    };

    // taskApiのモックを修正して数値型のstatusに対応
    (taskApi.createTask as jest.Mock).mockImplementation(() => Promise.resolve(newTask));

    // フォームを送信
    const form = screen.getByTestId('task-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    // タスクが追加されたことを確認
    await waitFor(() => {
      const taskElements = screen.getAllByText('新規タスク');
      expect(taskElements.length).toBeGreaterThan(0);
    });

    // 編集ボタンが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByTestId(`edit-button-${newTask.id}`)).toBeInTheDocument();
    });

    // タスクの編集
    const editButton = screen.getByTestId(`edit-button-${newTask.id}`);
    await act(async () => {
      fireEvent.click(editButton);
    });

    // 編集フォームに入力
    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), {
        target: { value: '更新されたタスク' },
      });
    });

    // タスク更新APIのモック設定
    const updatedTaskResponse = {
      ...newTaskResponse,
      title: '更新されたタスク',
    };
    const updatedTask = {
      ...newTask,
      title: '更新されたタスク',
    };

    // updateTaskメソッドをモック
    (taskApi.updateTask as jest.Mock).mockImplementation(() => Promise.resolve(updatedTask));

    // 編集フォームを送信
    await act(async () => {
      fireEvent.submit(screen.getByTestId('task-form'));
    });

    // タスクが更新されたことを確認
    await waitFor(() => {
      expect(screen.getByText('更新されたタスク')).toBeInTheDocument();
    });

    // タスクの削除
    const deleteButton = screen.getByTestId(`delete-button-${updatedTask.id}`);
    (taskApi.deleteTask as jest.Mock).mockResolvedValue({});

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // タスクが削除されたことを確認
    await waitFor(() => {
      expect(screen.queryByText('更新されたタスク')).not.toBeInTheDocument();
    });
  });

  it('エラー発生時の処理が正しく動作する', async () => {
    await act(async () => {
      render(<Home />);
    });

    // 新規タスク作成
    const newTaskButton = screen.getByRole('button', { name: /新規タスク/ });
    await act(async () => {
      fireEvent.click(newTaskButton);
    });

    // タスク作成APIでエラーを発生させる
    const errorMessage = 'タスクの作成に失敗しました';
    (taskApi.createTask as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // フォームに入力して送信
    await act(async () => {
      fireEvent.change(screen.getByLabelText('タイトル'), {
        target: { value: 'エラータスク' },
      });
      fireEvent.change(screen.getByLabelText('説明'), {
        target: { value: 'エラー説明' },
      });
      fireEvent.change(screen.getByLabelText('ステータス'), {
        target: { value: TaskStatus.NotStarted },
      });
      fireEvent.change(screen.getByLabelText('期限'), {
        target: { value: '2024-12-31' },
      });
      fireEvent.change(screen.getByLabelText('担当者'), {
        target: { value: 'エラーユーザー' },
      });
    });

    const form = screen.getByTestId('task-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    // APIの呼び出しを検証
    await waitFor(() => {
      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: 'エラータスク',
        description: 'エラー説明',
        status: TaskStatus.NotStarted,
        dueDate: '2024-12-31',
        assignedTo: 'エラーユーザー',
      });
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('タスクの取得に失敗した場合、エラーメッセージが表示される', async () => {
    const errorMessage = 'タスクの取得に失敗しました';
    (taskApi.getAllTasks as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('タスクの更新に失敗した場合、エラーメッセージが表示される', async () => {
    const errorMessage = 'タスクの更新に失敗しました';
    (taskApi.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (taskApi.updateTask as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    const editButton = screen.getByTestId(`edit-button-${mockTasks[0].id}`);
    await act(async () => {
      fireEvent.click(editButton);
    });

    // フォームを送信
    const form = screen.getByTestId('task-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('タスクの削除に失敗した場合、エラーメッセージが表示される', async () => {
    const errorMessage = 'タスクの削除に失敗しました';
    (taskApi.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (taskApi.deleteTask as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId(`delete-button-${mockTasks[0].id}`);
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
