import { computed, effect, signal } from '@angular/core';

export type Priority = 'Low' | 'Medium' | 'High';
export type Effort = 'Low' | 'Medium' | 'High';

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  effort: Effort;
  done: boolean;
};

const STORAGE_KEY = 'aeon-flow.tasks.v1';

function safeParseTasks(json: string | null): Task[] {
  if (!json) return [];

  try {
    const raw = JSON.parse(json) as unknown;
    if (!Array.isArray(raw)) return [];

    // Only need “good enough” validation here:
    // - keep the app from crashing on bad localStorage
    // - anything weird forced back to defaults
    return raw
      .filter(x => x && typeof x === 'object')
      .map((x: any) => ({
        id: typeof x.id === 'string' ? x.id : crypto.randomUUID(),
        title: typeof x.title === 'string' ? x.title : 'Untitled',
        priority: x.priority === 'Low' || x.priority === 'Medium' || x.priority === 'High' ? x.priority : 'Medium',
        effort: x.effort === 'Low' || x.effort === 'Medium' || x.effort === 'High' ? x.effort : 'Medium',
        done: typeof x.done === 'boolean' ? x.done : false,
      }));
  } catch {
    return [];
  }
}

export class TaskStore {
  // --- persisted state -------------------------------------------------------

  readonly tasks = signal<Task[]>(safeParseTasks(localStorage.getItem(STORAGE_KEY)));

  // --- UI state --------------------------------------------------------------
  // These are “view preferences”, not part of the tasks themselves.
  readonly filterPriority = signal<Priority | 'All'>('All');
  readonly filterEffort = signal<Effort | 'All'>('All');
  readonly showCompleted = signal(true);

  // Inline edit state.
  readonly editingId = signal<string | null>(null);
  readonly editingTitle = signal('');

  // --- derived state ---------------------------------------------------------

  readonly totalCount = computed(() => this.tasks().length);
  readonly completedCount = computed(() => this.tasks().filter(t => t.done).length);
  readonly remainingCount = computed(() => this.tasks().filter(t => !t.done).length);
  readonly hasCompleted = computed(() => this.tasks().some(t => t.done));

  readonly remainingByPriority = computed(() => {
    const remaining = this.tasks().filter(t => !t.done);
    return {
      Low: remaining.filter(t => t.priority === 'Low').length,
      Medium: remaining.filter(t => t.priority === 'Medium').length,
      High: remaining.filter(t => t.priority === 'High').length,
    } as const;
  });

  readonly remainingByEffort = computed(() => {
    const remaining = this.tasks().filter(t => !t.done);
    return {
      Low: remaining.filter(t => t.effort === 'Low').length,
      Medium: remaining.filter(t => t.effort === 'Medium').length,
      High: remaining.filter(t => t.effort === 'High').length,
    } as const;
  });

  // What the UI should render (filters applied).
  readonly visibleTasks = computed(() => {
    const p = this.filterPriority();
    const e = this.filterEffort();
    const showDone = this.showCompleted();

    return this.tasks().filter(t => {
      if (!showDone && t.done) return false;
      if (p !== 'All' && t.priority !== p) return false;
      if (e !== 'All' && t.effort !== e) return false;
      return true;
    });
  });

  constructor() {
    // This is intentionally “dumb”: every change persists immediately.
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
    });
  }

  // --- actions ---------------------------------------------------------------

  resetFilters() {
    this.filterPriority.set('All');
    this.filterEffort.set('All');
    this.showCompleted.set(true);
  }

  add(task: Omit<Task, 'id' | 'done'>) {
    const title = task.title.trim();
    if (!title) return;

    const t: Task = {
      id: crypto.randomUUID(),
      title,
      priority: task.priority,
      effort: task.effort,
      done: false,
    };

    this.tasks.update(list => [t, ...list]);
  }

  toggleDone(id: string) {
    this.tasks.update(list => list.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  delete(id: string) {
    this.tasks.update(list => list.filter(t => t.id !== id));
  }

  clearCompleted() {
    this.tasks.update(list => list.filter(t => !t.done));
  }

  // --- inline editing --------------------------------------------------------

  startEdit(id: string) {
    const t = this.tasks().find(x => x.id === id);
    if (!t) return;

    this.editingId.set(id);
    this.editingTitle.set(t.title);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editingTitle.set('');
  }

  commitEdit() {
    const id = this.editingId();
    if (!id) return;

    const title = this.editingTitle().trim();
    if (!title) {
      // If someone clears the field, treat it as “cancel”.
      this.cancelEdit();
      return;
    }

    this.tasks.update(list => list.map(t => (t.id === id ? { ...t, title } : t)));
    this.cancelEdit();
  }
}
