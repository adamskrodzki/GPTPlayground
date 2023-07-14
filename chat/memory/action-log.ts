import { DataList, IAction } from './common';

class Action implements IAction {
  constructor(
    public readonly action: string,
    public readonly parentBot: string,
  ) {}

  public toString(): string {
    return `${this.action}`;
  }
}

class ActionsLog extends DataList<Action> {
  public latestActions(bot: string, count: number | undefined): string {
    const allActions = this.get().filter((action) => action.parentBot === bot);
    return allActions
      .slice(count ? allActions.length - count : count)
      .map((action) => action.toString())
      .join('\n');
  }
}

const actionsLogInstance = new ActionsLog();

export { actionsLogInstance, ActionsLog, Action };
