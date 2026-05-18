import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Task, TaskStatus } from '../../models/task';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TaskService } from '../../services/task.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
  templateUrl: './create-task.component.html',
})
export class CreateTaskComponent implements OnInit{

  @Input() eventShowCreateTask!: EventEmitter<Task>;
  @Output() modalClosed = new EventEmitter<void>();

  visible = false;
  private closeRequestedFromSubmit = false;

  statuses = TaskStatus;
  form!: FormGroup;
  fb = inject(FormBuilder);
  router = inject(Router);
  messageService = inject(MessageService);
  taskService = inject(TaskService);

  statusOptions = [
    { label: 'Pendente', value: TaskStatus.PENDENTE },
    { label: 'Em Andamento', value: TaskStatus.EM_ANDAMENTO },
    { label: 'Concluída', value: TaskStatus.CONCLUIDA },
    { label: 'Em Atraso', value: TaskStatus.EM_ATRASO },
  ];
  priorityOptions = [
    { label: 'Muito Alta - 1 ', value: 1 },
    { label: 'Alta - 2', value: 2 },
    { label: 'Média - 3', value: 3 },
    { label: 'Baixa - 4', value: 4 },
    { label: 'Muito Baixa - 5', value: 5 },
  ];

  ngOnInit(): void {
    this.buildForm();
    this.showModal();
  }

  private buildForm() {
    this.form = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: [''],
      status: [TaskStatus.PENDENTE],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      due_date: [null as Date | null],
    });
  }

  private showModal() {
    if (!this.eventShowCreateTask) return;
    this.eventShowCreateTask.subscribe(task => {
      this.visible = !this.visible;
      if (task) {
        const patched = {
          ...task,
          due_date: task.due_date ? new Date(task.due_date) : null,
          priority: Number(task.priority) as Task['priority'],
        } as any;
        this.form.patchValue(patched);
      } else {
        this.buildForm();
      }
    });
  }

  onCancel(): void {
    this.closeRequestedFromSubmit = false;
    this.closeDialog();
  }

  handleDialogHide(): void {
    if (this.closeRequestedFromSubmit) {
      this.closeRequestedFromSubmit = false;
      return;
    }

    this.closeDialog();
  }

  private closeDialog(): void {
    this.visible = false;
    this.buildForm();
    this.modalClosed.emit();
  }

  showDialog(): void {
    if (this.form.valid) {
            this.onSubmit();
        } else {
            this.form.markAllAsTouched();
            this.form.markAsDirty();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor preencha todos os campos obrigatórios.'
            });
        }
  }

  onSubmit(){
    if(this.form.valid){
      const rawTask = this.form.getRawValue();
      const task: Task = {
        ...rawTask,
        priority: Number(rawTask.priority) as Task['priority'],
        due_date: rawTask.due_date ? (rawTask.due_date instanceof Date ? rawTask.due_date.toISOString() : String(rawTask.due_date)) : null,
      } as Task;
      task.id ? this.updateTask(task) : this.createTask(task);
    }
  }

  private createTask(task: Task): void {
    this.taskService.create(task).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa criada com sucesso.' });
          this.closeRequestedFromSubmit = true;
          this.closeDialog();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao criar tarefa.' });
      }
    });
  }

  updateTask(task: Task): void {
    this.taskService.update(task.id, task).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa atualizada com sucesso.' });
          this.closeRequestedFromSubmit = true;
          this.closeDialog();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar tarefa.' });
      }
    });
  }
}
