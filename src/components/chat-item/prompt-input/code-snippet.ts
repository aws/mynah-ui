import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahEventNames } from '../../../static';
import { CodeSnippetWidget } from './code-snippet-widget';

export interface ICodeSnippetProps {
  tabId: string;
}

export interface ISelectCodeSnippetEvent {
  tabId: string;
  selectedCodeSnippet?: string;
}

export class CodeSnippet {
  private readonly props: ICodeSnippetProps;
  render: ExtendedHTMLElement;
  constructor (props: ICodeSnippetProps) {
    this.props = props;

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.ADD_CODE_SNIPPET, (data: ISelectCodeSnippetEvent) => {
      MynahUITabsStore.getInstance().getTabDataStore(data.tabId).updateStore({
        selectedCodeSnippet: data.selectedCodeSnippet,
      });
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REMOVE_CODE_SNIPPET, (tabId: string) => {
      MynahUITabsStore.getInstance().getTabDataStore(tabId).updateStore({
        selectedCodeSnippet: undefined,
      });
    });

    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('selectedCodeSnippet', (selectedCodeSnippet: string) => {
        this.render.clear();
        if (selectedCodeSnippet !== undefined && selectedCodeSnippet !== '') {
          this.render.insertChild(
            'afterbegin',
            new CodeSnippetWidget({
              tabId: props.tabId,
              markdownText: selectedCodeSnippet,
            }).render
          );
        }
      });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: ['outer-container'],
      persistent: true,
    });
  }

  public readonly clear = (): void => {
    this.render.clear();
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).updateStore({
      selectedCodeSnippet: '',
    });
  };
}
