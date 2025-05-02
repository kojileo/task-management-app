import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import { TaskStatus } from '@/types/task';

describe('TaskList', () => {
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

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onStatusChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タスク一覧が正しく表示される', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    expect(screen.getByText('未着手')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
  });

  it('タスクの編集ボタンが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    const editButton = screen.getByTestId('edit-button-1');
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('タスクの削除ボタンが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
  });

  it('タスクのステータス変更が正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    const statusSelect = screen.getByTestId('status-select-1');
    fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress } });

    expect(mockHandlers.onStatusChange).toHaveBeenCalledWith(1, TaskStatus.InProgress);
  });

  it('ローディング中はスケルトンが表示される', () => {
    render(
      <TaskList
        tasks={[]}
        loading={true}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    const skeletons = screen.getAllByTestId('skeleton-loading');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('タスクが空の場合はメッセージが表示される', () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
}); 