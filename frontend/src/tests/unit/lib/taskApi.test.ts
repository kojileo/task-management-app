import taskApi from '@/lib/taskApi';
import { TaskItem, TaskFormData, TaskStatus } from '@/types/task';

// fetchのモック
global.fetch = jest.fn();

describe('taskApi', () => {
  const mockDate = '2023-12-31';
  const mockISODate = new Date(mockDate + 'T00:00:00Z').toISOString();

  const mockTask: TaskItem = {
    id: 1,
    title: 'テストタスク',
    description: 'テスト説明',
    status: TaskStatus.NotStarted,
    dueDate: mockDate,
    assignedTo: 'テストユーザー',
  };

  const mockTaskFormData: TaskFormData = {
    title: 'テストタスク',
    description: 'テスト説明',
    status: TaskStatus.NotStarted,
    dueDate: mockDate,
    assignedTo: 'テストユーザー',
  };

  const expectedRequestBody = {
    ...mockTaskFormData,
    dueDate: mockISODate,
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('getAllTasksが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockTask]),
    });

    const tasks = await taskApi.getAllTasks();
    expect(tasks).toEqual([mockTask]);
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/Task`);
  });

  it('getTaskByIdが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTask),
    });

    const task = await taskApi.getTaskById(1);
    expect(task).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/Task/1`);
  });

  it('createTaskが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTask),
    });

    const task = await taskApi.createTask(mockTaskFormData);
    expect(task).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/Task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedRequestBody),
    });
  });

  it('updateTaskが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTask),
    });

    const task = await taskApi.updateTask(1, mockTask);
    expect(task).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/Task/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...mockTask,
        dueDate: mockISODate,
      }),
    });
  });

  it('deleteTaskが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await taskApi.deleteTask(1);
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/api/Task/1`, {
      method: 'DELETE',
    });
  });

  it('エラーが発生した場合に適切に処理される', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('タスクが見つかりません'),
    });

    await expect(taskApi.getAllTasks()).rejects.toThrow('タスクの取得に失敗しました');
  });
});
