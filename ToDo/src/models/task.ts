export enum TaskStatus {
  PENDENTE = 'Pendente',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDA = 'Concluída',
  EM_ATRASO = 'Em Atraso'
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  search?: string;
}

export interface Paginated<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
}

export interface TaskFiltersPaged extends TaskFilters {
  page?: number;
  size?: number;
  sortField?: string;
  sortOrder?: number; // 1 = asc, -1 = desc
}
