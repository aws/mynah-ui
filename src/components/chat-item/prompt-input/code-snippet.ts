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
  private snippetWidget: CodeSnippetWidget | undefined;
  public lastCodeSnippet: string = '';
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
    if (this.snippetWidget !== undefined) {
      this.snippetWidget.clear();
    }
    this._render.clear();
    this.lastCodeSnippet = selectedCodeSnippet ?? '';
    if (selectedCodeSnippet !== undefined && selectedCodeSnippet !== '') {
      this.snippetWidget = new CodeSnippetWidget({
        tabId: this._props.tabId,
        markdownText: selectedCodeSnippet,
      });
      this._render.insertChild('afterbegin', this.snippetWidget.render);
      const isCodeOverflowVertically =
        (this._render.getBoundingClientRect()?.height ?? 0) < (this._render.getElementsByTagName('code')?.[0]?.getBoundingClientRect()?.height ?? 0);
      if (isCodeOverflowVertically) {
        this._render.children[0].classList.add('vertical-overflow');
      }
    }
    MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId)?.updateStore({
      selectedCodeSnippet,
    });
  };

  public readonly clear = (): void => {
    this.lastCodeSnippet = '';
    if (this.snippetWidget !== undefined) {
      this.snippetWidget.clear();
    }
    this.snippetWidget = undefined;
    this._render.clear();
    MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId)?.updateStore({
      selectedCodeSnippet: undefined,
    });
  };
}
