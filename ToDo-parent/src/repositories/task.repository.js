import { connectDB, sql } from '../database/connection.js';

async function list(userId, { status, search, page = 0, size = 10, sortField, sortOrder } = {}) {
  const db = await connectDB();

  await db.request()
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE tasks
      SET status = 'Em Atraso'
      WHERE user_id = @userId
        AND status = 'Em Andamento'
        AND due_date IS NOT NULL
        AND due_date < CAST(GETDATE() AS date)
    `);

  const whereClauses = ['t.user_id = @userId'];
  const inputs = [{ name: 'userId', type: sql.Int, value: userId }];

  if (status) {
    whereClauses.push('t.status = @status');
    inputs.push({ name: 'status', type: sql.NVarChar, value: status });
  }

  if (search) {
    whereClauses.push('(t.title LIKE @search OR t.description LIKE @search)');
    inputs.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
  }

  const where = `WHERE ${whereClauses.join(' AND ')}`;

  const countRequest = db.request();
  for (const i of inputs) countRequest.input(i.name, i.type, i.value);
  const countResult = await countRequest.query(`SELECT COUNT(1) AS total FROM tasks t ${where}`);
  const total = countResult.recordset[0]?.total ?? 0;

  const offset = Math.max(0, parseInt(page, 10) || 0) * Math.max(1, parseInt(size, 10) || 10);

  const selectRequest = db.request();
  for (const i of inputs) selectRequest.input(i.name, i.type, i.value);
  selectRequest.input('offset', sql.Int, offset);
  selectRequest.input('size', sql.Int, parseInt(size, 10) || 10);

  // permissive whitelist para evitar SQL injection em nomes de colunas
  const allowedSortFields = new Set(['id','title','status','priority','due_date','created_at','updated_at']);
  let orderByClause = `\n    ORDER BY\n      CASE t.status WHEN 'Pendente' THEN 0 ELSE 1 END,\n      CASE t.status WHEN 'Pendente' THEN t.priority ELSE NULL END ASC\n`;

  if (sortField && allowedSortFields.has(sortField)) {
    const order = (String(sortOrder || '').toLowerCase() === 'desc') ? 'DESC' : 'ASC';
    orderByClause = `\n    ORDER BY t.${sortField} ${order} \n`;
  }

  const result = await selectRequest.query(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      t.updated_at
    FROM tasks t
    ${where}${orderByClause}
    OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
  `);

  return {
    content: result.recordset,
    totalElements: total,
    page: parseInt(page, 10) || 0,
    size: parseInt(size, 10) || 10,
  };
}

async function createTask({ userId, title, description, status, priority, due_date }) {
  const db = await connectDB();
  const result = await db.request()
    .input('userId', sql.Int, userId)
    .input('title', sql.NVarChar, title)
    .input('description', sql.NVarChar, description || null)
    .input('status', sql.NVarChar, status)
    .input('priority', sql.TinyInt, priority)
    .input('due_date', sql.Date, due_date || null)
    .query(`
      INSERT INTO tasks (user_id, title, description, status, priority, due_date)
      OUTPUT INSERTED.*
      VALUES (@userId, @title, @description, @status, @priority, @due_date)
    `);

  return result.recordset[0];
}

async function updateTask(id, userId, fields) {
  const db = await connectDB();
  const result = await db.request()
    .input('id', sql.Int, id)
    .input('userId', sql.Int, userId)
    .input('title', sql.NVarChar, fields.title ?? null)
    .input('description', sql.NVarChar, fields.description ?? null)
    .input('status', sql.NVarChar, fields.status ?? null)
    .input('priority', sql.TinyInt, fields.priority ?? null)
    .input('due_date', sql.Date, fields.due_date ?? null)
    .query(`UPDATE tasks
            SET
              title = COALESCE(@title, title),
              description = COALESCE(@description, description),
              status = COALESCE(@status, status),
              priority = COALESCE(@priority, priority),
              due_date = COALESCE(@due_date, due_date),
              updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id AND user_id = @userId
          `);

  return result.recordset.length ? result.recordset[0] : null;
}

async function deleteTask(id, userId) {
  const db = await connectDB();
  const result = await db.request()
    .input('id', sql.Int, id)
    .input('userId', sql.Int, userId)
    .query('DELETE FROM tasks OUTPUT DELETED.id WHERE id = @id AND user_id = @userId');

  return result.recordset.length ? result.recordset[0] : null;
}

export {
  list,
  createTask,
  updateTask,
  deleteTask,
};
