interface IAction {
  toString(): string;
}

class DataList<T extends IAction> {
  private readonly actions: T[] = [];

  protected filterActions: (arg: T) => boolean = () => true;
  protected sortingOrder: (a: T, b: T) => number = (a, b) => (a > b ? 1 : -1);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onAddAction: (arg: T) => void = () => {};

  public add(action: T): void {
    this.onAddAction(action);
    this.actions.push(action);
  }

  public get(): T[] {
    return this.actions;
  }

  public toString(): string {
    return this.actions
      .sort(this.sortingOrder)
      .filter(this.filterActions)
      .map((action) => action.toString())
      .join('\n');
  }
}

export { DataList, IAction };
