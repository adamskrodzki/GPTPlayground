import { DataList, IAction } from './common';

class KnowledgeElement implements IAction {
  constructor(
    private readonly shortDescription: string,
    private readonly content: string,
  ) {}

  public toString(): string {
    return `Summary: ${this.shortDescription} \n Full Context:${this.content}`;
  }
}

class KnowledgeBase extends DataList<KnowledgeElement> {}

const knowledgeBaseInstance = new KnowledgeBase();

export { knowledgeBaseInstance, KnowledgeBase, KnowledgeElement };
