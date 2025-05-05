import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import TaskList from '@/components/TaskList';
import { TaskStatus } from '@/types/task';

describe('TaskList Integration Tests', () => {
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

  it('タスク一覧が正しく表示され、タスクのステータスに応じて適切なカラムに配置される', async () => {
    await act(async () => {
      render(
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onStatusChange={mockHandlers.onStatusChange}
        />
      );
    });

    // タスクが表示されることを確認
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    expect(screen.getByText('テストタスク2')).toBeInTheDocument();

    // 各タスクの説明が表示されることを確認
    expect(screen.getByText('テスト説明1')).toBeInTheDocument();
    expect(screen.getByText('テスト説明2')).toBeInTheDocument();

    // 未着手のカラムにタスク1が表示されていることを確認
    const notStartedHeading = screen.getByRole('heading', { name: '未着手' });
    const notStartedColumn = notStartedHeading.closest('div')?.parentElement;
    expect(notStartedColumn).toContainElement(screen.getByText('テストタスク1'));

    // 進行中のカラムにタスク2が表示されていることを確認
    const inProgressHeading = screen.getByRole('heading', { name: '進行中' });
    const inProgressColumn = inProgressHeading.closest('div')?.parentElement;
    expect(inProgressColumn).toContainElement(screen.getByText('テストタスク2'));
  });

  it('タスクの編集ボタンが正しく動作する', async () => {
    await act(async () => {
      render(
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onStatusChange={mockHandlers.onStatusChange}
        />
      );
    });

    const editButton = screen.getByTestId(`edit-button-${mockTasks[0].id}`);
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('タスクの削除ボタンが正しく動作する', async () => {
    await act(async () => {
      render(
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onStatusChange={mockHandlers.onStatusChange}
        />
      );
    });

    const deleteButton = screen.getByTestId(`delete-button-${mockTasks[0].id}`);
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTasks[0].id);
  });

  it('タスクのステータス変更が正しく動作する', async () => {
    await act(async () => {
      render(
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onStatusChange={mockHandlers.onStatusChange}
        />
      );
    });

    const statusSelect = screen.getByTestId(`status-select-${mockTasks[0].id}`);
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress } });
    });

    expect(mockHandlers.onStatusChange).toHaveBeenCalledWith(
      mockTasks[0].id,
      TaskStatus.InProgress
    );
  });

  it('ローディング中はローディングメッセージが表示される', async () => {
    await act(async () => {
      render(
        <TaskList
          tasks={[]}
          loading={true}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onStatusChange={mockHandlers.onStatusChange}
        />
      );
    });

    const skeletons = screen.getAllByTestId('skeleton-loading');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('タスクが空の場合はメッセージが表示される', async () => {
    await act(async () => {
      render(
        <TaskList
          tasks={[]}
          loading={false}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onStatusChange={mockHandlers.onStatusChange}
        />
      );
    });

    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
});
