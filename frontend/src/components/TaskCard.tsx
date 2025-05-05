'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TaskItem, TaskStatus } from '@/types/task';

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

const statusColors = {
  [TaskStatus.NotStarted]: 'bg-blue-100 text-blue-800',
  [TaskStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.Completed]: 'bg-green-100 text-green-800',
};

const statusLabels = {
  [TaskStatus.NotStarted]: '未着手',
  [TaskStatus.InProgress]: '進行中',
  [TaskStatus.Completed]: '完了',
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange(task.id, e.target.value as TaskStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 mb-3">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <p className="text-gray-600 text-sm mt-2">{task.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              期限: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span className="text-sm text-gray-500">担当: {task.assignedTo}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={task.status}
            onChange={handleStatusChange}
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]} border-0 focus:ring-0`}
            data-testid={`status-select-${task.id}`}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value} className={statusColors[value as TaskStatus]}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleEdit}
            className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
            aria-label={`${task.title}を編集`}
            data-testid={`edit-button-${task.id}`}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
            aria-label={`${task.title}を削除`}
            data-testid={`delete-button-${task.id}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { statusColors, statusLabels };
