class Task {
  constructor(id, user_id, title, description, status, priority, due_date, created_at) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.due_date = due_date;
    this.created_at = created_at;
  }

  isOverdue() {
    if (!this.due_date) return false;

    return new Date(this.due_date) < new Date()
      && this.status !== 'Concluída';
  }

  validate(){
    if (!this.title || typeof this.title !== 'string' || this.title.trim().length === 0) {
      throw new Error('O título é obrigatório.');
    }

    if (this.title.length > 255) {
      throw new Error('Título não pode exceder 255 caracteres.');
    }
  }
}

export default Task;
