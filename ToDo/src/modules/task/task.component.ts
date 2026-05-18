import { Component, OnInit, OnDestroy, ViewChild, inject, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, TaskFilters, TaskStatus } from '../../models/task';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { CreateTaskComponent } from '../create-task/create-task.component';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { Dialog } from "primeng/dialog";
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PanelModule,
    BadgeModule,
    CheckboxModule,
    MenubarModule,
    PopoverModule,
    CreateTaskComponent,
    IconField,
    InputIcon,
    Tag,
    Dialog,
    PaginatorModule,
    SelectModule,
  ],
  templateUrl: './task.component.html',
})
export class TasksComponent implements OnInit{

  eventShowCreateTask = new EventEmitter<Task>();

  @ViewChild('dt') dt?: Table;

  readonly taskStatus = TaskStatus;


  tasks: Task[] = [];
  rows = 5;
  first = 0;
  totalRecords = 0;
  searchText = '';
  selectedStatus: TaskStatus | '' = '';
  statusFilterOptions = [
    { label: 'Todos', value: '' },
    { label: TaskStatus.PENDENTE, value: TaskStatus.PENDENTE },
    { label: TaskStatus.EM_ANDAMENTO, value: TaskStatus.EM_ANDAMENTO },
    { label: TaskStatus.EM_ATRASO, value: TaskStatus.EM_ATRASO },
    { label: TaskStatus.CONCLUIDA, value: TaskStatus.CONCLUIDA },
  ];
  selectedTask = {} as Task;
  dialogDeleteVisible = false;

  notifications: string[] = [];

  auth = inject(AuthService);
  taskSvc= inject(TaskService);
  messageService = inject(MessageService);
  cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadTasks(true);
    this.eventShowCreateTask.subscribe(value => {
      if(!value) this.loadTasks(true);
    });
  }

  private loadAllTasksForNotifications(): void {
    this.taskSvc.list({ page: 0, size: 10000 }).subscribe({
      next: res => {
        this.refreshDueDateNotifications(res.content);
      },
      error: () => {},
    });
  }

  loadTasks(updateNotifications = false): void {
    const page = Math.floor(this.first / this.rows);
    const filters = {
      status: this.selectedStatus,
      search: this.searchText.trim(),
      page,
      size: this.rows,
    };

    this.taskSvc.list(filters).subscribe({
      next: res => {
        this.tasks = res.content;
        this.totalRecords = res.totalElements;
        if (updateNotifications) this.loadAllTasksForNotifications();
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Erro ao carregar tarefas.' });
      },
    });
  }

  onLazyLoad(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadTasks();
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.loadTasks();
  }

  onStatusFilterChange(value: TaskStatus | ''): void {
    this.selectedStatus = value;
    this.loadTasks();
  }

  editTask(task: Task): void {
    this.eventShowCreateTask.emit(task);
  }

  deleteTask(): void {
    this.taskSvc.remove(this.selectedTask.id).subscribe(() => {
      if (!this.selectedTask) return;
      this.onDialogDeleteHide();
      this.loadTasks(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Tarefa deletada com sucesso.' });
    });
  }

  onDialogDeleteShow(task: Task): void {
        this.dialogDeleteVisible = true;
        this.selectedTask = task;
        this.cdRef.detectChanges();
    }

    onDialogDeleteHide(): void {
        this.dialogDeleteVisible = false;
        this.selectedTask = {} as Task;
    }

  advanceStatus(task: Task, completeByCheckbox = false): void {
    const updateStatus = (status: TaskStatus): void => {
      this.taskSvc
        .update(task.id, this.buildStatusUpdatePayload(task, status))
        .subscribe(() => {
          this.loadTasks(true);
        });
    };

    if (completeByCheckbox) {
      if (task.status === TaskStatus.CONCLUIDA) return;
      updateStatus(TaskStatus.CONCLUIDA);
      return;
    }

    const next: Partial<Record<TaskStatus, TaskStatus>> = {
      [TaskStatus.PENDENTE]:     TaskStatus.EM_ANDAMENTO,
      [TaskStatus.EM_ANDAMENTO]: TaskStatus.CONCLUIDA,
    };
    const nextStatus = next[task.status];
    if (!nextStatus) return;
    updateStatus(nextStatus);
  }

  private buildStatusUpdatePayload(task: Task, status: TaskStatus): Partial<Task> {
    return {
      title: task.title,
      description: task.description,
      status,
      priority: task.priority,
      due_date: task.due_date,
    };
  }

  onTaskCheckboxChange(task: Task, checked: boolean): void {
    if (!checked) return;
    this.advanceStatus(task, true);
  }

  canStart(task: Task): boolean {
    return task.status === TaskStatus.PENDENTE;
  }

  private refreshDueDateNotifications(tasks: Task[]): void {
    const now = this.toDateOnly(new Date());
    this.notifications = [];

    for (const task of tasks) {
      if (!task.due_date) continue;
      if (task.status === TaskStatus.CONCLUIDA) continue;

      const dueDate = this.toDateOnly(new Date(task.due_date));
      if (Number.isNaN(dueDate.getTime())) continue;

      const diffDays = Math.floor((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const dueDateText = this.formatDate(task.due_date);
      const oneDay = 24 * 60 * 60 * 1000;

      if (task.status === TaskStatus.EM_ANDAMENTO) {
        if (diffDays < 0) {
          const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / oneDay);
          this.notifications.push(`A tarefa "${task.title}" está atrasada há ${daysLate} dia(s) (vencia em ${dueDateText}).`);
        } else if (diffDays <= 2) {
          this.notifications.push(`A tarefa "${task.title}" está próxima do vencimento (${dueDateText}).`);
        }
        continue;
      }

      if (task.status === TaskStatus.EM_ATRASO) {
        if (diffDays < 0) {
          const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / oneDay);
          this.notifications.push(`A tarefa "${task.title}" está em atraso por ${daysLate} dia(s) (vencia em ${dueDateText}).`);
        } else {
          this.notifications.push(`A tarefa "${task.title}" está com status 'Em Atraso' e tem vencimento em ${dueDateText}.`);
        }
        continue;
      }

      if (task.status === TaskStatus.PENDENTE) {
        if (diffDays < 0) {
          const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / oneDay);
          this.notifications.push(`A tarefa "${task.title}" está pendente e atrasada há ${daysLate} dia(s) (vencia em ${dueDateText}).`);
        } else if (diffDays <= 2) {
          this.notifications.push(`A tarefa "${task.title}" vence em breve (${dueDateText}).`);
        }
      }
    }
  }

  private toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  getSeverity(status: TaskStatus) {
        switch (status) {
            case 'Pendente':
                return 'danger';

            case 'Concluída':
                return 'success';

            case 'Em Andamento':
                return 'info';

            case 'Em Atraso':
                return 'warn';
            default:
                return 'secondary';
        }
    }

  priorityStars(priority: number): string {
    return '★'.repeat(priority) + '☆'.repeat(5 - priority);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
}
