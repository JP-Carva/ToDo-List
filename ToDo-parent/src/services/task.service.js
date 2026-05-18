import {
  list as repoList,
  createTask as repoCreateTask,
  updateTask as repoUpdateTask,
  deleteTask as repoDeleteTask,
} from '../repositories/task.repository.js';
import Task from '../models/Task.js';

const VALID_STATUSES = ['Pendente', 'Em Andamento', 'Concluída', 'Em Atraso' ];

async function list(userId, filters) {
  return await repoList(userId, filters);
}

async function create(userId, data) {
  const task = new Task(undefined, userId, data.title, data.description, data.status, data.priority, data.due_date);

  const { priorityNum } = validateTask(task, { requireAll: true });

  const created = await repoCreateTask({ userId, title: task.title, description: task.description, status: task.status, priority: priorityNum, due_date: task.due_date });
  return created;
}


async function update(id, userId, data) {
  if (!data || typeof data !== 'object') throw { status: 400, message: 'Payload inválido.' };

  const task = new Task(id, userId, data.title, data.description, data.status, data.priority, data.due_date);

  validateTask(task, { requireAll: false, provided: data });
  
  const updated = await repoUpdateTask(id, userId, data);
  if (!updated) throw { status: 404, message: 'Tarefa não encontrada.' };
  return updated;
}

async function remove(id, userId) {
  const deleted = await repoDeleteTask(id, userId);
  if (!deleted) throw { status: 404, message: 'Tarefa não encontrada.' };
  return deleted;
}

function validateTask(task, opts = {}) {
  const { requireAll = false, provided = {} } = opts;

  if (requireAll || provided.hasOwnProperty('title')) validateTitle(task.title);

  if (requireAll || provided.hasOwnProperty('status')) validateStatus(task.status);

  if (requireAll || provided.hasOwnProperty('due_date')) validateDueDate(task.due_date);

  const priorityNum = validateTaskPriority(task.priority, { requireAll, provided });

  function validateDueDate(taskDueDate) {
    if (taskDueDate && isNaN(new Date(taskDueDate).getTime())) {
      throw { status: 400, message: 'Data de vencimento inválida.' };
    }
  }

  function validateTaskPriority(taskPriority, { requireAll: rq, provided: pv }) {
    const has = pv.hasOwnProperty('priority');
    const priorityNum = taskPriority === undefined || taskPriority === null ? NaN : parseInt(taskPriority, 10);

    if (rq || has) {
      if (taskPriority === undefined || taskPriority === null) throw { status: 400, message: 'Prioridade é obrigatória.' };
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) throw { status: 400, message: 'Prioridade deve ser entre 1 e 5.' };
      return priorityNum;
    }

    if (!isNaN(priorityNum)) return priorityNum;

    return undefined;
  }

  function validateStatus(taskStatus) {
    if (taskStatus === undefined || taskStatus === null) throw { status: 400, message: 'Status inválido ou não definido.' };
    if (!VALID_STATUSES.includes(taskStatus)) throw { status: 400, message: 'Status inválido.' };
  }

  function validateTitle(taskTitle) {
    if (!taskTitle || typeof taskTitle !== 'string' || taskTitle.trim().length === 0) throw { status: 400, message: 'O título é obrigatório.' };
    if (taskTitle.length > 255) throw { status: 400, message: 'Título não pode exceder 255 caracteres.' };
  }

  return { priorityNum };
}

export { list, create, update, remove };