import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { TaskStatus } from '@/types/task';
import taskApi from '@/lib/taskApi';

jest.mock('@/lib/taskApi', () => ({
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

// 日付のモック
const mockDate = new Date('2023-01-01');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

describe('Home', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'テストタスク1',
      description: 'テスト説明1',
      assignedTo: 'テストユーザー1',
      dueDate: '2023-12-31',
      status: TaskStatus.NotStarted,
    },
    {
      id: 2,
      title: 'テストタスク2',
      description: 'テスト説明2',
      assignedTo: 'テストユーザー2',
      dueDate: '2024-01-01',
      status: TaskStatus.InProgress,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (taskApi.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (taskApi.createTask as jest.Mock).mockResolvedValue({ id: 3, ...mockTasks[0] });
    (taskApi.updateTask as jest.Mock).mockResolvedValue({
      ...mockTasks[0],
      status: TaskStatus.InProgress,
    });
    (taskApi.deleteTask as jest.Mock).mockResolvedValue(undefined);
  });

  it('タスクの一覧が表示される', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    });
  });

  it('タスクの新規作成ができる', async () => {
    render(<Home />);

    // 新規タスクボタンをクリック
    fireEvent.click(screen.getByText('新規タスク'));

    // フォームが表示される
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('担当者')).toBeInTheDocument();
    expect(screen.getByLabelText('期限')).toBeInTheDocument();

    // フォームに入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '新しいタスク' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '新しい説明' } });
    fireEvent.change(screen.getByLabelText('担当者'), { target: { value: '新しいユーザー' } });
    fireEvent.change(screen.getByLabelText('期限'), { target: { value: '2023-01-02' } });

    // 送信ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    // APIが呼ばれる
    await waitFor(() => {
      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: '新しいタスク',
        description: '新しい説明',
        assignedTo: '新しいユーザー',
        dueDate: '2023-01-02',
        status: TaskStatus.NotStarted,
      });
    });
  });

  it('タスクの編集ができる', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    // 編集ボタンをクリック
    const editButtons = screen.getAllByRole('button', { name: /を編集$/ });
    fireEvent.click(editButtons[0]);

    // フォームが表示され、タスクの情報が入力されている
    expect(screen.getByLabelText('タイトル')).toHaveValue('テストタスク1');
    expect(screen.getByLabelText('説明')).toHaveValue('テスト説明1');
    expect(screen.getByLabelText('担当者')).toHaveValue('テストユーザー1');
    expect(screen.getByLabelText('期限')).toHaveValue('2023-12-31');

    // フォームを編集
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '編集されたタスク' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '編集された説明' } });
    fireEvent.change(screen.getByLabelText('担当者'), { target: { value: '編集されたユーザー' } });
    fireEvent.change(screen.getByLabelText('期限'), { target: { value: '2023-01-02' } });

    // 送信ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    // APIが呼ばれる
    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledWith(1, {
        id: 1,
        title: '編集されたタスク',
        description: '編集された説明',
        assignedTo: '編集されたユーザー',
        dueDate: '2023-01-02',
        status: TaskStatus.NotStarted,
      });
    });
  });

  it('タスクの削除ができる', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: /を削除$/ });
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログが表示される
    expect(screen.getByRole('dialog')).toHaveTextContent('タスクを削除しますか？');

    // 確認ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    // APIが呼ばれる
    await waitFor(() => {
      expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  it('タスクのステータスを変更できる', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    // ステータスを変更
    const statusSelects = screen.getAllByRole('combobox', { name: /のステータス$/ });
    fireEvent.change(statusSelects[0], { target: { value: TaskStatus.InProgress } });

    // ステータスが更新される
    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledWith(1, {
        ...mockTasks[0],
        status: TaskStatus.InProgress,
      });
    });
  });
});
