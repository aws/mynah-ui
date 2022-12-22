/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { SearchContext } from './search-context';
import { SearchInput } from './search-input';
import { SearchApiHelp } from './search-api-help';
import { SearchLiveToggle } from './search-live-toggle';
import { SearchCardHeader } from './search-card-header';

export class SearchCard {
  private unfoldedByContextInsertion: boolean = false;
  private unfoldedByButton: boolean = false;
  private readonly searchInput: SearchInput;
  private readonly searchAPIHelp: SearchApiHelp;
  private readonly liveSearchToggle: SearchLiveToggle;
  private readonly foldUnfoldButton: Button;
  private readonly contextManagement: SearchContext;
  private readonly searchCardHeader: SearchCardHeader;
  render: ExtendedHTMLElement;
  constructor () {
    this.foldUnfoldButton = new Button({
      children: [ new Icon({ icon: MynahIcons.DOWN_OPEN }).render, new Icon({ icon: MynahIcons.UP_OPEN }).render ],
      onClick: () => {
        if (this.render.hasClass('mynah-search-block-unfold')) {
          this.unfoldedByButton = false;
          if (!this.unfoldedByContextInsertion) {
            this.render.removeClass('mynah-search-block-unfold');
          }
        } else {
          this.unfoldedByButton = true;
          this.render.addClass('mynah-search-block-unfold');
        }
      },
      classNames: [ 'mnynah-search-block-fold-unfold-button' ],
    });

    this.searchCardHeader = new SearchCardHeader();
    this.liveSearchToggle = new SearchLiveToggle({ label: 'Live suggestions:' });
    this.searchAPIHelp = new SearchApiHelp();
    this.searchInput = new SearchInput();
    this.contextManagement = new SearchContext({
      onContextInsertionEnabled: () => {
        this.unfoldedByContextInsertion = true;
        this.render.addClass('mynah-search-block-unfold');
      },
      onContextInsertionDisabled: () => {
        this.unfoldedByContextInsertion = false;
        if (!this.unfoldedByButton) {
          this.render.removeClass('mynah-search-block-unfold');
        }
      },
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-search-block' ],
      children: [
        this.searchCardHeader.render,
        this.liveSearchToggle.render,
        this.searchAPIHelp.render,
        this.searchInput.render,
        this.contextManagement.render,
        this.foldUnfoldButton.render,
      ],
    });
  }

  public addFocusOnInput = (): void => {
    this.searchInput.addFocusOnInput();
  };

  setFolded = (folded: boolean): void => {
    if (folded) {
      this.render.addClass('mynah-search-block-ready-to-fold');
    } else {
      this.render.removeClass('mynah-search-block-ready-to-fold');
    }
  };
}
