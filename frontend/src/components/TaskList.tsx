'use client';

import { TaskItem, TaskStatus } from '@/types/task';
import TaskCard, { statusColors, statusLabels } from './TaskCard';

interface TaskListProps {
  tasks: TaskItem[];
  loading: boolean;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export default function TaskList({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-lg p-4 animate-pulse"
            data-testid="skeleton-loading"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-white rounded-lg p-4 mb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">タスクがありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.values(TaskStatus).map(status => {
        // ステータスごとのタスク数を確認
        const filteredTasks = tasks.filter(t => t.status === status);

        return (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{statusLabels[status]}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
              >
                {filteredTasks.length}
              </span>
            </div>
            {filteredTasks.map(task => (
              <TaskCard
                key={`${task.id}-${task.status}`}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
