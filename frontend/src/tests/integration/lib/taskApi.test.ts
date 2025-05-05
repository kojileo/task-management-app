import taskApi from '@/lib/taskApi';
import { TaskStatus } from '@/types/task';

// fetchのモック設定
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('taskApi Integration Tests', () => {
  const mockDate = '2024-12-31';
  const mockISODate = new Date(mockDate + 'T00:00:00Z').toISOString();

  const mockTask = {
    id: 1,
    title: 'テストタスク',
    description: 'テスト説明',
    status: TaskStatus.NotStarted,
    dueDate: mockDate,
    assignedTo: 'テストユーザー',
  };

  beforeEach(() => {
    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5045';
  });

  describe('getAllTasks', () => {
    it('タスク一覧の取得が成功する', async () => {
      const mockTasks = [mockTask];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      });

      const tasks = await taskApi.getAllTasks();
      expect(tasks).toEqual(mockTasks);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5045/api/Task');
    });

    it('タスク一覧の取得に失敗した場合、エラーがスローされる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(taskApi.getAllTasks()).rejects.toThrow('タスクの取得に失敗しました');
    });
  });

  describe('getTaskById', () => {
    it('指定したIDのタスクの取得が成功する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const task = await taskApi.getTaskById(1);
      expect(task).toEqual(mockTask);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5045/api/Task/1');
    });

    it('指定したIDのタスクの取得に失敗した場合、エラーがスローされる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(taskApi.getTaskById(999)).rejects.toThrow('タスクの取得に失敗しました');
    });
  });

  describe('createTask', () => {
    const newTask = {
      title: 'テストタスク',
      description: 'テスト説明',
      status: TaskStatus.NotStarted,
      dueDate: mockDate,
      assignedTo: 'テストユーザー',
    };

    it('タスクの作成が成功する', async () => {
      const mockResponse = {
        id: 1,
        title: newTask.title,
        description: newTask.description,
        status: 0,
        dueDate: mockISODate,
        assignedTo: newTask.assignedTo,
        createdAt: mockISODate,
        updatedAt: mockISODate,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockResponse),
      });

      const createdTask = await taskApi.createTask(newTask);
      expect(createdTask).toEqual({
        id: mockResponse.id,
        title: mockResponse.title,
        description: mockResponse.description,
        status: TaskStatus.NotStarted,
        dueDate: mockResponse.dueDate,
        assignedTo: mockResponse.assignedTo,
      });
    });

    it('タスクの作成に失敗した場合、エラーがスローされる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(taskApi.createTask(newTask)).rejects.toThrow('タスクの作成に失敗しました');
    });

    it('空のレスポンスでLocationヘッダーがある場合、タスクを取得する', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '',
          headers: {
            get: (name: string) => (name === 'location' ? '/api/Task/1' : null),
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTask,
        });

      const createdTask = await taskApi.createTask(newTask);
      expect(createdTask).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('タスクの更新が成功する', async () => {
      const updatedTask = {
        ...mockTask,
        title: '更新されたタスク',
      };

      const mockResponse = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: 0,
        dueDate: mockISODate,
        assignedTo: updatedTask.assignedTo,
        createdAt: mockISODate,
        updatedAt: mockISODate,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await taskApi.updateTask(updatedTask.id, updatedTask);
      expect(result).toEqual({
        id: mockResponse.id,
        title: mockResponse.title,
        description: mockResponse.description,
        status: TaskStatus.NotStarted,
        dueDate: mockResponse.dueDate,
        assignedTo: mockResponse.assignedTo,
      });
    });

    it('タスクの更新に失敗した場合、エラーがスローされる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(taskApi.updateTask(999, mockTask)).rejects.toThrow('タスクの更新に失敗しました');
    });
  });

  describe('deleteTask', () => {
    it('タスクの削除が成功する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await expect(taskApi.deleteTask(1)).resolves.not.toThrow();
    });

    it('タスクの削除に失敗した場合、エラーがスローされる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(taskApi.deleteTask(999)).rejects.toThrow('タスクの削除に失敗しました');
    });
  });
});
