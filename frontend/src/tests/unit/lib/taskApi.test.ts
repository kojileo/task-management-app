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
    dueDate: mockISODate,
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
    title: mockTaskFormData.title,
    description: mockTaskFormData.description,
    status: mockTaskFormData.status,
    dueDate: mockISODate,
    assignedTo: mockTaskFormData.assignedTo,
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5045';
  });

  it('getAllTasksが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockTask]),
    });

    const tasks = await taskApi.getAllTasks();
    expect(tasks).toEqual([mockTask]);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5045/api/Task');
  });

  it('getTaskByIdが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTask),
    });

    const task = await taskApi.getTaskById(1);
    expect(task).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5045/api/Task/1');
  });

  it('createTaskが正しく動作する', async () => {
    const mockResponse = {
      Id: mockTask.id,
      Title: mockTask.title,
      Description: mockTask.description,
      Status: mockTask.status,
      DueDate: mockISODate,
      AssignedTo: mockTask.assignedTo,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });

    const task = await taskApi.createTask(mockTaskFormData);
    expect(task).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5045/api/Task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedRequestBody),
    });
  });

  it('createTaskで空のレスポンスとLocationヘッダーがある場合', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
        headers: {
          get: (name: string) => (name === 'location' ? '/api/Task/1' : null),
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

    const task = await taskApi.createTask(mockTaskFormData);
    expect(task).toEqual(mockTask);
  });

  it('updateTaskが正しく動作する', async () => {
    const mockResponse = {
      Id: mockTask.id,
      Title: mockTask.title,
      Description: mockTask.description,
      Status: mockTask.status,
      DueDate: mockISODate,
      AssignedTo: mockTask.assignedTo,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });

    const task = await taskApi.updateTask(1, mockTask);
    expect(task).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5045/api/Task/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
        dueDate: mockTask.dueDate,
        assignedTo: mockTask.assignedTo,
      }),
    });
  });

  it('deleteTaskが正しく動作する', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await taskApi.deleteTask(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5045/api/Task/1', {
      method: 'DELETE',
    });
  });

  it('エラーが発生した場合に適切に処理される', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(taskApi.getAllTasks()).rejects.toThrow('タスクの取得に失敗しました');
  });
});
