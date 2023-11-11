import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { CodeSnippetWidget } from './code-snippet-widget';

export interface ICodeSnippetProps {
  tabId: string;
}

export interface ISelectCodeSnippetEvent {
  tabId: string;
  selectedCodeSnippet?: string;
}

export class CodeSnippet {
  private readonly _props: ICodeSnippetProps;
  private readonly _render: ExtendedHTMLElement;
  constructor (props: ICodeSnippetProps) {
    this._props = props;

    this._render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'outer-container' ],
      persistent: true,
    });
  }

  public get render (): ExtendedHTMLElement {
    return this._render;
  }

  public readonly updateSelectedCodeSnippet = (selectedCodeSnippet: string | undefined): void => {
    this._render.clear();
    if (selectedCodeSnippet !== undefined && selectedCodeSnippet !== '') {
      this._render.insertChild(
        'afterbegin',
        new CodeSnippetWidget({
          tabId: this._props.tabId,
          markdownText: selectedCodeSnippet,
        }).render
      );
    }
    MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).updateStore({
      selectedCodeSnippet,
    });
  };

  public readonly clear = (): void => {
    this._render.clear();
    MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).updateStore({
      selectedCodeSnippet: undefined,
    });
  };
}
