import { ExtendedHTMLElement } from '../../../helper/dom';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../overlay';
import { Icon, MynahIcons } from '../../icon';
import { Button } from '../../button';
import { MynahUIGlobalEvents, cancelEvent } from '../../../helper/events';
import { MynahEventNames } from '../../../static';
import { Card } from '../../card/card';
import { CardBody } from '../../card/card-body';

export interface ICodeSnippetWidgetProps {
  tabId: string;
  markdownText: string;
}

export class CodeSnippetWidget {
  private readonly props: ICodeSnippetWidgetProps;
  private previewOverlay: Overlay | undefined;
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
          classNames: [ 'mynah-prompt-input-snippet-attachment-overlay' ],
          children: [
            new CardBody({
              body: markdownText,
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
    return new Card({
      padding: 'none',
      events: {
        mouseenter: () => {
          this.showPreviewOverLay(markdownText);
        },
        mouseleave: () => {
          this.closePreviewOverLay();
        },
      },
      classNames: [ 'snippet-card-container' ],
      children: [
        new CardBody({
          body: markdownText,
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
    }).render;
  };

  public readonly clear = (): void => {
    this.closePreviewOverLay();
  };
}
