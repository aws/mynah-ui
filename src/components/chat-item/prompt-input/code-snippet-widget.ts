import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../overlay/overlay';
import { Icon, MynahIcons } from '../../icon';
import { Button } from '../../button';
import { MynahUIGlobalEvents, cancelEvent } from '../../../helper/events';
import { MynahEventNames } from '../../../static';
import { Card } from '../../card';
import { SyntaxHighlighter } from '../../syntax-highlighter';
import { marked } from 'marked';

export interface ICodeSnippetWidgetProps {
  tabId: string;
  markdownText: string;
}

export class CodeSnippetWidget {
  private readonly props: ICodeSnippetWidgetProps;
  private previewOverlay: Overlay | undefined;
  private parsedCode: string = '';
  render: ExtendedHTMLElement;
  constructor (props: ICodeSnippetWidgetProps) {
    this.props = props;
    this.render = this.renderCodeSnippetWidget(this.props.markdownText);
  }

  private readonly showPreviewOverLay = (markdownText: string): void => {
    this.previewOverlay = new Overlay({
      background: false,
      closeOnOutsideClick: false,
      referenceElement: this.render,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_TOP,
      horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
      children: [
        new Card({
          classNames: [ 'snippet-card-container-preview' ],
          children: [
            new SyntaxHighlighter({
              codeStringWithMarkup: this.parsedCode,
              block: true,
              showCopyOptions: false
            }).render,
          ]
        }).render
      ],
    });
  };

  private readonly closePreviewOverLay = (): void => {
    if (this.previewOverlay !== undefined) {
      this.previewOverlay.close();
      this.previewOverlay = undefined;
    }
  };

  private readonly renderCodeSnippetWidget = (markdownText: string): ExtendedHTMLElement => {
    this.parsedCode = DomBuilder.getInstance().build({
      type: 'code',
      innerHTML: marked(markdownText)
    }).querySelector('code')?.innerHTML ?? '';
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'snippet-card-container' ],
      children: [
        new Card({
          events: {
            mouseenter: () => {
              this.showPreviewOverLay(markdownText);
            },
            mouseleave: () => {
              this.closePreviewOverLay();
            },
          },
          children: [
            new SyntaxHighlighter({
              codeStringWithMarkup: this.parsedCode,
              block: true,
              showCopyOptions: false
            }).render,
          ],
        }).render,
        new Button({
          classNames: [ 'code-snippet-close-button' ],
          onClick: e => {
            cancelEvent(e);
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.REMOVE_CODE_SNIPPET, this.props.tabId);
            this.closePreviewOverLay();
          },
          icon: new Icon({ icon: MynahIcons.CANCEL }).render,
          primary: false,
        }).render,
      ],
    });
  };
}
