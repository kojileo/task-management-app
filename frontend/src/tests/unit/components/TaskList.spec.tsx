import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '@/components/TaskList';
import { TaskItem, TaskStatus } from '@/types/task';

// TaskCardコンポーネントをモック化
jest.mock('@/components/TaskCard', () => {
  const actual = jest.requireActual('@/types/task');

  return {
    __esModule: true,
    default: jest.fn(({ task }) => (
      <div data-testid={`mocked-task-card-${task.id}`}>{task.title}</div>
    )),
    statusColors: {
      [actual.TaskStatus.NotStarted]: 'mocked-blue',
      [actual.TaskStatus.InProgress]: 'mocked-yellow',
      [actual.TaskStatus.Completed]: 'mocked-green',
    },
    statusLabels: {
      [actual.TaskStatus.NotStarted]: '未着手',
      [actual.TaskStatus.InProgress]: '進行中',
      [actual.TaskStatus.Completed]: '完了',
    },
  };
});

describe('TaskList Unit Tests', () => {
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

  afterEach(() => {
    jest.clearAllMocks();
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

    // スケルトンローディングの要素が表示されることを確認
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

    // タスクが空の場合のメッセージが表示されることを確認
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  it('各ステータスごとにタスクが表示される', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // 各ステータスのセクションが表示されていることを確認
    expect(screen.getByRole('heading', { name: '未着手' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '進行中' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '完了' })).toBeInTheDocument();

    // モックされたTaskCardがレンダリングされているか確認
    expect(screen.getByTestId('mocked-task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-task-card-2')).toBeInTheDocument();

    // タスクのタイトルが表示されていることを確認
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
  });

  it('タスクのカウントが表示される', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
        onStatusChange={mockHandlers.onStatusChange}
      />
    );

    // 未着手のタスク数が「1」であることを確認
    const notStartedHeading = screen.getByRole('heading', { name: '未着手' });
    const notStartedColumn = notStartedHeading.closest('div')?.parentElement;
    expect(notStartedColumn).toHaveTextContent('1');

    // 進行中のタスク数が「1」であることを確認
    const inProgressHeading = screen.getByRole('heading', { name: '進行中' });
    const inProgressColumn = inProgressHeading.closest('div')?.parentElement;
    expect(inProgressColumn).toHaveTextContent('1');

    // 完了のタスク数が「0」であることを確認
    const completedHeading = screen.getByRole('heading', { name: '完了' });
    const completedColumn = completedHeading.closest('div')?.parentElement;
    expect(completedColumn).toHaveTextContent('0');
  });
});
