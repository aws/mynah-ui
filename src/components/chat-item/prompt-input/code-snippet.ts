import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahEventNames } from '../../../static';
import { CodeSnippetWidget } from './code-snippet-widget';
import { MAX_USER_INPUT } from '../chat-prompt-input';

export interface ICodeSnippetProps {
  tabId: string;
  onCodeSnippetAdd?: (codeSnippet: string) => void;
  onCodeSnippetRemove?: () => void;
}

export interface ISelectCodeSnippetEvent {
  tabId: string;
  selectedCodeSnippet?: string;
}

export class CodeSnippet {
  private readonly props: ICodeSnippetProps;
  render: ExtendedHTMLElement;
  availableChars: number = MAX_USER_INPUT - 100;
  constructor (props: ICodeSnippetProps) {
    this.props = props;

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.ADD_CODE_SNIPPET, (data: ISelectCodeSnippetEvent) => {
      MynahUITabsStore.getInstance().getTabDataStore(data.tabId).updateStore({
        selectedCodeSnippet: data.selectedCodeSnippet?.substring(0, this.availableChars),
      });
      if (this.props.onCodeSnippetAdd != null) {
        this.props.onCodeSnippetAdd(data.selectedCodeSnippet?.substring(0, this.availableChars) as string);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REMOVE_CODE_SNIPPET, (tabId: string) => {
      MynahUITabsStore.getInstance().getTabDataStore(tabId).updateStore({
        selectedCodeSnippet: undefined,
      });
      if (this.props.onCodeSnippetRemove != null) {
        this.props.onCodeSnippetRemove();
      }
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
      classNames: [ 'outer-container' ],
      persistent: true,
    });
  }

  public readonly clear = (): void => {
    this.render.clear();
    if (this.props.onCodeSnippetRemove !== undefined) {
      this.props.onCodeSnippetRemove();
    }
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).updateStore({
      selectedCodeSnippet: '',
    });
  };
}
