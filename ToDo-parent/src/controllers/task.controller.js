import * as taskService from '../services/task.service.js';

async function list(req, res) {
  const userId = req.user.id;
  const { status, search, sort, order } = req.query;
  const page = parseInt(req.query.page, 10) || 0;
  const size = parseInt(req.query.size, 10) || 10;

  try {
    const paged = await taskService.list(userId, { status, search, page, size, sortField: sort, sortOrder: order });
    return res.json(paged);
  } catch (err) {
    console.error('list error:', err);
    return res.status(500).json({ message: 'Erro ao listar tarefas.' });
  }
}

async function create(req, res) {
  const userId = req.user.id;
  try {
    const created = await taskService.create(userId, req.body);
    return res.status(201).json(created);
  } catch (err) {
    console.error('create error:', err);
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro ao criar tarefa.' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const updated = await taskService.update(id, userId, req.body);
    return res.json(updated);
  } catch (err) {
    console.error('update error:', err);
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro ao atualizar tarefa.' });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await taskService.remove(id, userId);
    return res.json({ message: 'Tarefa removida com sucesso.' });
  } catch (err) {
    console.error('remove error:', err);
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro ao remover tarefa.' });
  }
}

export { list, create, update, remove };