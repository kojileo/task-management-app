import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '@/components/TaskForm';
import { TaskItem, TaskStatus, getStatusStringFromNumber } from '@/types/task';
import { toast } from 'react-hot-toast';

// 日付のモック
const mockDate = new Date('2023-01-01');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

// react-hot-toastのモック
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
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
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        ...mockTask,
        // statusが数値の場合は文字列に変換する処理があるため
        status:
          typeof mockTask.status === 'number'
            ? getStatusStringFromNumber(mockTask.status)
            : mockTask.status,
      });
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

  it('空のフォームが正しく表示される', () => {
    render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);

    // 各フィールドが存在することを確認
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByLabelText('期限')).toBeInTheDocument();
    expect(screen.getByLabelText('担当者')).toBeInTheDocument();

    // ボタンが存在することを確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('既存タスクデータでフォームが初期化される', () => {
    const existingTask = {
      id: 1,
      title: '既存タスク',
      description: '既存の説明',
      status: TaskStatus.InProgress,
      dueDate: '2023-12-31',
      assignedTo: '既存担当者',
    };

    render(
      <TaskForm
        task={existingTask}
        onSubmit={mockHandlers.onSubmit}
        onCancel={mockHandlers.onCancel}
      />
    );

    // 初期値が正しく設定されていることを確認
    expect(screen.getByLabelText('タイトル')).toHaveValue('既存タスク');
    expect(screen.getByLabelText('説明')).toHaveValue('既存の説明');
    expect(screen.getByLabelText('ステータス')).toHaveValue(TaskStatus.InProgress);
    expect(screen.getByLabelText('期限')).toHaveValue('2023-12-31');
    expect(screen.getByLabelText('担当者')).toHaveValue('既存担当者');
  });

  it('キャンセルボタンをクリックするとonCancelが呼ばれる', () => {
    render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);

    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
  });

  it('有効なデータでフォームを送信するとonSubmitが呼ばれる', () => {
    render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);

    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストタスク' },
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' },
    });
    fireEvent.change(screen.getByLabelText('担当者'), {
      target: { value: 'テスト担当者' },
    });

    // フォームを送信
    fireEvent.submit(screen.getByTestId('task-form'));

    // onSubmitが呼ばれたことを確認
    expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1);
    expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'テストタスク',
        description: 'テスト説明',
        assignedTo: 'テスト担当者',
      })
    );
  });

  it('タイトルなしでフォームを送信するとエラーが表示される', () => {
    render(<TaskForm onSubmit={mockHandlers.onSubmit} onCancel={mockHandlers.onCancel} />);

    // タイトルを空に設定
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: '' },
    });

    // フォームを送信
    fireEvent.submit(screen.getByTestId('task-form'));

    // エラートーストが表示されることを確認
    expect(toast.error).toHaveBeenCalled();
    // onSubmitは呼ばれないことを確認
    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });
});
