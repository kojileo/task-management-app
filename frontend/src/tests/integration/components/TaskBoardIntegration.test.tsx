import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { TaskItem, TaskStatus, TaskFormData } from '@/types/task';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';

// 統合テスト用のTaskBoardコンポーネントを作成
function TaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 1,
      title: '初期タスク',
      description: '初期タスクの説明',
      status: TaskStatus.NotStarted,
      dueDate: '2024-12-31',
      assignedTo: 'テストユーザー',
    },
  ]);

  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleStatusChange = (id: number, status: TaskStatus) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, status } : task)));
  };

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      // 既存タスクの更新
      setTasks(tasks.map(task => (task.id === editingTask.id ? { ...task, ...data } : task)));
    } else {
      // 新規タスクの作成
      const newTask: TaskItem = {
        ...data,
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      };
      setTasks([...tasks, newTask]);
    }

    setEditingTask(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <div>
      <button onClick={handleNewTask} data-testid="new-task-button">
        新規タスク作成
      </button>

      {showForm && (
        <TaskForm task={editingTask || undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
      )}

      <TaskList
        tasks={tasks}
        loading={false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

describe('TaskBoard Integration Tests', () => {
  it('完全なタスク追加フローが動作する', async () => {
    render(<TaskBoard />);

    // 初期状態を確認
    expect(screen.getByText('初期タスク')).toBeInTheDocument();

    // 新規タスク作成ボタンをクリック
    fireEvent.click(screen.getByTestId('new-task-button'));

    // フォームが表示されることを確認
    expect(screen.getByTestId('task-form')).toBeInTheDocument();

    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '新しいタスク' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '新しいタスクの説明' } });
    fireEvent.change(screen.getByLabelText('担当者'), { target: { value: '新しい担当者' } });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    // 新しいタスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    });

    // 初期タスクと新しいタスクの両方が表示されていることを確認
    expect(screen.getByText('初期タスク')).toBeInTheDocument();
    expect(screen.getByText('新しいタスク')).toBeInTheDocument();
  });

  it('タスク編集フローが動作する', async () => {
    render(<TaskBoard />);

    // 初期タスクの編集ボタンをクリック
    const editButton = screen.getByTestId('edit-button-1');
    fireEvent.click(editButton);

    // フォームが表示されることを確認
    expect(screen.getByTestId('task-form')).toBeInTheDocument();

    // タイトルフィールドに初期値が設定されていることを確認
    expect(screen.getByLabelText('タイトル')).toHaveValue('初期タスク');

    // タイトルを変更
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '編集されたタスク' } });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    // 編集されたタスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('編集されたタスク')).toBeInTheDocument();
    });

    // 初期タスクが表示されなくなったことを確認
    expect(screen.queryByText('初期タスク')).not.toBeInTheDocument();
  });

  it('タスク削除フローが動作する', async () => {
    render(<TaskBoard />);

    // 初期タスクの削除ボタンをクリック
    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    // タスクが削除されたことを確認
    await waitFor(() => {
      expect(screen.queryByText('初期タスク')).not.toBeInTheDocument();
    });

    // タスクがないメッセージが表示されることを確認
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  it('タスクのステータス変更が動作する', async () => {
    render(<TaskBoard />);

    // 初期タスクのステータスを変更
    const statusSelect = screen.getByTestId('status-select-1');
    fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress } });

    // 未着手のカラムにタスクがなくなることを確認
    const notStartedHeading = screen.getByRole('heading', { name: '未着手' });
    const notStartedColumn = notStartedHeading.closest('div')?.parentElement;
    expect(notStartedColumn).not.toContainElement(screen.getByText('初期タスク'));

    // 進行中のカラムにタスクが移動することを確認
    const inProgressHeading = screen.getByRole('heading', { name: '進行中' });
    const inProgressColumn = inProgressHeading.closest('div')?.parentElement;
    expect(inProgressColumn).toContainElement(screen.getByText('初期タスク'));
  });
});
