import { http, HttpResponse } from 'msw';

interface TaskRequestBody {
  title: string;
  description: string;
}

export const handlers = [
  // タスク一覧取得
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'テストタスク1',
        description: 'テストタスク1の説明',
        status: '未着手',
        dueDate: '2024-05-01',
        assignedTo: 'ユーザー1',
      },
    ]);
  }),

  // タスク作成
  http.post('/api/tasks', async ({ request }) => {
    const body = await request.json() as TaskRequestBody;
    return HttpResponse.json({
      id: 2,
      title: body.title,
      description: body.description,
      status: '未着手',
      dueDate: '2024-05-02',
      assignedTo: 'ユーザー1',
    }, { status: 201 });
  }),
]; 