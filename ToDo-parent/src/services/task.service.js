import {
  list as repoList,
  getByUserId as repoGetById,
  createTask as repoCreateTask,
  updateTask as repoUpdateTask,
  deleteTask as repoDeleteTask,
} from '../repositories/task.repository.js';

const VALID_STATUSES = ['Pendente' || 'pendente', 'Em Andamento' || 'em andamento', 'Concluída' || 'concluída', 'Em Atraso' || 'em atraso' ];

async function list(userId, filters) {
  return await repoList(userId, filters);
}

async function getByUserId(id, userId) {
  const task = await repoGetById(id, userId);
  if (!task) throw { status: 404, message: 'Tarefa não encontrada.' };
  return task;
}

async function create(userId, data) {
  const task = new Task(data);

  const validations = validateTask(task);

  const priorityNum = validations.validateTaskPriority();

  const created = await repoCreateTask({ userId, title: task.title, description: task.description, status: task.status, priority: priorityNum, due_date: task.due_date });
  return created;
}


async function update(id, userId, data) {
  const { title, status, priority } = data;
  
  const existing = await repoGetById(id, userId);
  if (!existing) throw { status: 404, message: 'Tarefa não encontrada.' };
  
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw { status: 400, message: 'O título é obrigatório.' };
    }
    if (title.length > 255) {
      throw { status: 400, message: 'Título não pode exceder 255 caracteres.' };
    }
  }

  if (status && !VALID_STATUSES.includes(status)) {
    throw { status: 400, message: 'Status inválido.' };
  }

  if (priority !== undefined) {
    const priorityNum = parseInt(priority, 10);
    if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
      throw { status: 400, message: 'Prioridade deve ser entre 1 e 5.' };
    }
  }
  
  if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
    throw { status: 400, message: 'Data de vencimento inválida.' };
  }
  
  const updated = await repoUpdateTask(id, userId, data);
  if (!updated) throw { status: 404, message: 'Tarefa não encontrada.' };
  return updated;
}

async function remove(id, userId) {
  const deleted = await repoDeleteTask(id, userId);
  if (!deleted) throw { status: 404, message: 'Tarefa não encontrada.' };
  return deleted;
}

async function notifications(userId) {
  await syncOverdueTasks(userId);
  return await repoNotifications(userId);
}

function validateTask(task) {
  validateTitle(task.title);

  validateStatus(task.status);
  
  validateDueDate(task.due_date);
 
  validateTaskPriority(task.priority);

  function validateDueDate(taskDueDate) {
    if (taskDueDate && isNaN(new Date(taskDueDate).getTime())) {
      throw { status: 400, message: 'Data de vencimento inválida.' };
    }
  }

  function validateTaskPriority(taskPriority) {
    const priorityNum = parseInt(taskPriority, 10);

    if (taskPriority === undefined) {
      throw { status: 400, message: 'Prioridade é obrigatória.' };
    }
    else if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
      throw { status: 400, message: 'Prioridade deve ser entre 1 e 5.' };
    }
    return priorityNum;
  }

  function validateStatus(taskStatus) {
    if (!VALID_STATUSES.includes(taskStatus)) {
      throw { status: 400, message: 'Status inválido ou não definido.' };
    }
  }

  function validateTitle(taskTitle) {
    if (!taskTitle || typeof taskTitle !== 'string' || taskTitle.trim().length === 0) {
      throw { status: 400, message: 'O título é obrigatório.' };
    }

    if (taskTitle.length > 255) {
      throw { status: 400, message: 'Título não pode exceder 255 caracteres.' };
    }
  }
}

export { list, getByUserId, create, update, remove, notifications };