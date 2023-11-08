/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import {
  MynahEventNames,
  ReferenceTrackerInformation,
  Suggestion,
} from '../../static';
import { MynahUIGlobalEvents } from '../../helper/events';
import { CardBody } from '../card/card-body';

export interface SuggestionCardBodyProps {
  suggestion: Partial<Suggestion>;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  highlightRangeWithTooltip?: ReferenceTrackerInformation[];
}
export class SuggestionCardBody {
  render: ExtendedHTMLElement;
  props: SuggestionCardBodyProps;
  constructor (props: SuggestionCardBodyProps) {
    this.props = props;
    this.render = new CardBody({
      highlightRangeWithTooltip: props.highlightRangeWithTooltip,
      body: this.props.suggestion.body ?? '',
      children: this.props.children,
      onCopiedToClipboard: (type, text, referenceTrackerInformation) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.COPY_CODE_TO_CLIPBOARD, {
          messageId: props.suggestion?.id,
          type,
          text,
          referenceTrackerInformation
        });
      },
      onInsertToCursorPosition: (type, text, referenceTrackerInformation) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, {
          messageId: this.props.suggestion?.id,
          type,
          text,
          referenceTrackerInformation
        });
      },
    }).render;
  }
}
