import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { TaskStore, type Effort, type Priority } from './task.store';

type TaskForm = {
  title: FormControl<string>;
  priority: FormControl<Priority>;
  effort: FormControl<Effort>;
};

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {

  protected readonly year = new Date().getFullYear();

  // signal so title can be easily changed
  protected readonly title = signal('eon Flow');

  // Real app state lives here. 
  //The component handles UI interactions.
  protected readonly store = new TaskStore();

 // Keep a reference to the input to restore focus after submit,
 // for multiple task submission without using the mouse.

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  protected readonly form = new FormGroup<TaskForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    }),
    priority: new FormControl('Medium', { nonNullable: true }),
    effort: new FormControl('Medium', { nonNullable: true }),
  });

  protected addTask() {
    if (this.form.invalid) {
      //show the reason rather than do nothing.
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    this.store.add({
      title: v.title,
      priority: v.priority,
      effort: v.effort,
    });

    // Reset back to defaults.
    this.form.reset({ title: '', priority: 'Medium', effort: 'Medium' });

    // Cursor goes back to the input.
    this.titleInput()?.nativeElement?.focus();
  }
}
