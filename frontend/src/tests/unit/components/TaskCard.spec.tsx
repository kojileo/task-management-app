import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '@/components/TaskCard';
import { TaskItem, TaskStatus } from '@/types/task';

// コンポーネントに必要な最小限のpropsのみを渡す単体テスト
describe('TaskCard', () => {
  // モックハンドラー
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onStatusChange: jest.fn(),
  };

  // テスト用のタスク
  const mockTask: TaskItem = {
    id: 1,
    title: 'テストタスク',
    description: 'タスクの説明文',
    status: TaskStatus.NotStarted,
    dueDate: '2023-12-31',
    assignedTo: 'テストユーザー',
  };

  // 各テスト後にモックをリセット
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('タスクの基本情報が正しく表示される', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // タイトルが表示されることを確認
    expect(screen.getByText('テストタスク')).toBeInTheDocument();

    // 説明が表示されることを確認
    expect(screen.getByText('タスクの説明文')).toBeInTheDocument();

    // 担当者が表示されることを確認
    expect(screen.getByText('担当: テストユーザー')).toBeInTheDocument();

    // 日付が表示されることを確認（フォーマットに注意）
    expect(screen.getByText(/期限:/)).toBeInTheDocument();
  });

  it('編集ボタンをクリックすると、onEdit関数が呼ばれる', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // テストIDを使って編集ボタンを取得
    const editButton = screen.getByTestId(`edit-button-${mockTask.id}`);

    // ボタンをクリック
    fireEvent.click(editButton);

    // onEdit関数が正しく呼び出されたか確認
    expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('削除ボタンをクリックすると、onDelete関数が呼ばれる', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // テストIDを使って削除ボタンを取得
    const deleteButton = screen.getByTestId(`delete-button-${mockTask.id}`);

    // ボタンをクリック
    fireEvent.click(deleteButton);

    // onDelete関数が正しく呼び出されたか確認
    expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('ステータスを変更すると、onStatusChange関数が呼ばれる', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // テストIDを使ってステータス選択要素を取得
    const statusSelect = screen.getByTestId(`status-select-${mockTask.id}`);

    // ステータスを「進行中」に変更
    fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress } });

    // onStatusChange関数が正しく呼び出されたか確認
    expect(mockHandlers.onStatusChange).toHaveBeenCalledTimes(1);
    expect(mockHandlers.onStatusChange).toHaveBeenCalledWith(mockTask.id, TaskStatus.InProgress);
  });
});
