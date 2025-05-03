import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '@/components/TaskList';
import { TaskItem, TaskStatus } from '@/types/task';

describe('TaskList', () => {
  const mockTasks: TaskItem[] = [
    {
      id: 1,
      title: 'タスク1',
      description: 'テスト用タスク1の説明',
      status: TaskStatus.NotStarted,
      dueDate: '2023-12-31',
      assignedTo: 'ユーザー1',
    },
    {
      id: 2,
      title: 'タスク2',
      description: 'テスト用タスク2の説明',
      status: TaskStatus.InProgress,
      dueDate: '2024-01-01',
      assignedTo: 'ユーザー2',
    },
  ];

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onStatusChange: jest.fn(),
  };

  it('タスクリストが正しく表示される', () => {
    const { getByRole } = render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // 各ステータスのセクションが表示されていることを確認
    expect(getByRole('heading', { name: '未着手' })).toBeInTheDocument();
    expect(getByRole('heading', { name: '進行中' })).toBeInTheDocument();
    expect(getByRole('heading', { name: '完了' })).toBeInTheDocument();

    // タスクが正しく表示されていることを確認
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
  });

  it('編集ボタンがクリックされたときにonEditが呼ばれる', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /を編集$/ });
    fireEvent.click(editButtons[0]);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('削除ボタンがクリックされたときにonDeleteが呼ばれる', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /を削除$/ });
    fireEvent.click(deleteButtons[0]);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTasks[0].id);
  });

  it('ステータスが変更されたときにonStatusChangeが呼ばれる', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // ステータス変更のセレクトボックスを取得
    const statusSelect = screen.getByTestId(`status-select-${mockTasks[0].id}`);

    // ステータスを変更
    fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress } });

    // ステータス変更のハンドラーが呼ばれることを確認
    expect(mockHandlers.onStatusChange).toHaveBeenCalledWith(
      mockTasks[0].id,
      TaskStatus.InProgress
    );
  });

  it('ローディング中はスケルトンが表示される', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={true}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // スケルトンローディングの要素が表示されていることを確認
    const skeletons = screen.getAllByTestId('skeleton-loading');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
