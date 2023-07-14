import { DataList, IAction } from './common';

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

class SimpleTask implements IAction {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly definitionOfDone: string[],
    public readonly recommendetFunctions: string[],
  ) {}
}

class Task extends SimpleTask {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public status: TaskStatus,
    public readonly id: string,
    public readonly definitionOfDone: string[],
    public readonly recommendetFunctions: string[],
  ) {
    super(title, description, definitionOfDone, recommendetFunctions);
  }
  public taskOutcome: string | undefined;

  public toString(): string {
    return `Title: ${this.title} \n\n Description:${
      this.description
    } \n\n Definition of done: \n ${this.definitionOfDone.join(
      '\n',
    )} \n\n Recommended Tools: ${JSON.stringify(
      this.recommendetFunctions,
    )} \n\n Status:${this.status}`;
  }

  public parentTaskId(): string | undefined {
    if (this.id.indexOf('.') == -1) {
      return undefined;
    } else {
      return this.id.substring(0, this.id.lastIndexOf('.'));
    }
  }
}

class TaskTracker extends DataList<Task> {
  private rootTask: Task | undefined;
  private tasksMap: Map<string, Task> = new Map<string, Task>();

  protected onAddAction = (arg: Task) => {
    this.tasksMap.set(arg.id, arg);
    if (!arg.parentTaskId()) {
      this.rootTask = arg;
    }
  };

  protected sortingOrder = (a: Task, b: Task) => {
    if (a.parentTaskId() === b.id) {
      return -1;
    }
    if (b.parentTaskId() === a.id) {
      return 1;
    }
    if (!a.parentTaskId()) {
      return 1;
    }
    if (!b.parentTaskId()) {
      return -1;
    }
    return a.id > b.id ? 1 : -1;
  };

  public getTask(id: string): Task | undefined {
    return this.tasksMap.get(id);
  }

  public getRootTask(): Task | undefined {
    return this.rootTask;
  }

  public getChildTasks(id: string): Task[] {
    return this.get().filter((task) => task.parentTaskId() === id);
  }

  public getParentTask(id: string): Task | undefined {
    const task = this.getTask(id);
    if (task) {
      return this.getTask(task.parentTaskId() as string);
    }
    return undefined;
  }

  public updateTaskStatus(id: string, status: TaskStatus): void {
    const task = this.getTask(id);
    if (task) {
      task.status = status;
    }
  }

  public getNextTask(): Task {
    const inProgressTasks = this.get().filter(
      (task) => task.status === TaskStatus.IN_PROGRESS,
    );
    if (inProgressTasks.length > 0) {
      return inProgressTasks[0];
    }
    const sortedTasks = this.get()
      .filter((task) => task.status === TaskStatus.TODO)
      .sort(this.sortingOrder);
    let index = 0;
    while (index < sortedTasks.length - 1) {
      const isNextTaskAChild =
        sortedTasks[index].id === sortedTasks[index + 1].parentTaskId();
      if (isNextTaskAChild) {
        index++;
      } else {
        return sortedTasks[index];
      }
    }
    return sortedTasks[index];
  }
}

const taskTracker = new TaskTracker();

export { Task, TaskStatus, SimpleTask, taskTracker };
