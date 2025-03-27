export default {
  selector: 'data-testid',
  prompt: {
    wrapper: 'prompt-input-wrapper',
    attachmentWrapper: 'prompt-input-attachment-wrapper',
    attachment: 'prompt-input-attachment',
    options: 'prompt-input-options',
    attachmentRemove: 'prompt-input-attachment-remove-button',
    send: 'prompt-input-send-button',
    input: 'prompt-input-textarea',
    inputWrapper: 'prompt-input-input-wrapper',
    remainingCharsIndicator: 'prompt-input-remaining-chars-indicator',
    contextTooltip: 'prompt-input-context-tooltip',
    selectedCommand: 'prompt-input-selected-command',
    quickPicksWrapper: 'prompt-input-quick-picks-wrapper',
    quickPicksGroup: 'prompt-input-quick-picks-group',
    quickPicksGroupTitle: 'prompt-input-quick-picks-group-title',
    quickPickItem: 'prompt-input-quick-pick-item',
    footerInfo: 'prompt-input-footer-info',
    footerInfoBody: 'prompt-input-footer-info-body',
    stickyCard: 'prompt-input-sticky-card',
    progress: 'prompt-input-progress-wrapper',
    label: 'prompt-input-label',
  },
  chat: {
    wrapper: 'chat-wrapper',
    chatItemsContainer: 'chat-chat-items-container',
    conversationContainer: 'chat-chat-items-conversation-container',
    middleBlockWrapper: 'chat-middle-block-wrapper',
    stopButton: 'chat-middle-block-stop-button',
    header: 'chat-wrapper-header-details',
    moreContentIndicator: 'chat-wrapper-more-content-available-indicator',
    moreContentIndicatorButton: 'chat-wrapper-more-content-available-indicator-button',
  },
  chatItem: {
    type: {
      any: 'chat-item',
      answer: 'chat-item-answer',
      answerStream: 'chat-item-answer-stream',
      prompt: 'chat-item-prompt',
      aiPrompt: 'chat-item-ai-prompt',
      systemPrompt: 'chat-item-system-prompt',
    },
    card: 'chat-item-card',
    cardBody: 'chat-item-card-body',
    buttons: {
      wrapper: 'chat-iem-buttons-wrapper',
      button: 'chat-item-action-button',
    },
    chatItemFollowup: {
      optionsWrapper: 'chat-item-followup-options-wrapper',
      optionButton: 'chat-item-followup-option',
      title: 'chat-item-followup-title',
      wrapper: 'chat-item-followup-wrapper',
    },
    syntaxHighlighter: {
      wrapper: 'chat-item-syntax-highlighter-wrapper',
      codeBlock: 'chat-item-syntax-highlighter-code-block',
      lineNumbers: 'chat-item-syntax-highlighter-line-numbers',
      language: 'chat-item-syntax-highlighter-language',
      buttonsWrapper: 'chat-item-syntax-highlighter-buttons-wrapper',
      button: 'chat-item-syntax-highlighter-button',
    },
    chatItemForm: {
      wrapper: 'chat-item-form-wrapper',
      title: 'chat-item-form-title',
      description: 'chat-item-form-description',
      itemSelectWrapper: 'chat-item-form-item-select-wrapper',
      itemSelect: 'chat-item-form-item-select',
      itemRadioWrapper: 'chat-item-form-item-radio-wrapper',
      itemRadio: 'chat-item-form-item-radio',
      itemInput: 'chat-item-form-item-text-input',
      itemStarsWrapper: 'chat-item-form-item-stars-wrapper',
      itemStars: 'chat-item-form-item-stars',
      itemTextArea: 'chat-item-form-item-textarea',
      itemToggleWrapper: 'chat-item-form-item-toggle-wrapper',
      itemToggleOption: 'chat-item-form-item-toggle-option'
    },
    vote: {
      wrapper: 'chat-item-vote-wrapper',
      upvote: 'chat-item-upvote',
      upvoteLabel: 'chat-item-upvote-label',
      downvote: 'chat-item-downvote',
      downvoteLabel: 'chat-item-downvote-label',
      reportButton: 'chat-item-vote-report',
      thanks: 'chat-item-vote-thanks'
    },
    relatedLinks: {
      showMore: 'chat-item-related-links-show-more',
      wrapper: 'chat-item-related-links-wrapper',
      title: 'chat-item-related-links-title',
      linkWrapper: 'chat-item-related-link-wrapper',
      link: 'chat-item-related-link',
      linkPreviewOverlay: 'chat-item-related-link-preview-overlay',
      linkPreviewOverlayCard: 'chat-item-related-link-preview-overlay-card'
    },
    fileTree: {
      wrapper: 'chat-item-file-tree-wrapper',
      title: 'chat-item-file-tree-title',
      license: 'chat-item-file-tree-license',
      folder: 'chat-item-file-tree-folder',
      file: 'chat-item-file-tree-file',
      fileAction: 'chat-item-file-tree-file-action',
      fileTooltipWrapper: 'chat-item-file-tree-file-tooltip-wrapper'
    },
    tabbedCard: {
      tabs: 'chat-item-tabbed-card-tabs'
    }
  },
  feedbackForm: {
    optionsSelectWrapper: 'feedback-form-options-select-wrapper',
    optionsSelect: 'feedback-form-options-select',
    comment: 'feedback-form-comment-text-area',
    cancelButton: 'feedback-form-cancel-button',
    submitButton: 'feedback-form-submit-button',
  },
  sheet: {
    wrapper: 'sheet-wrapper',
    header: 'sheet-header',
    title: 'sheet-title',
    description: 'sheet-description',
    closeButton: 'sheet-close-button',
  },
  detailedList: {
    action: 'detailed-list-action',
    actionMenu: 'detailed-list-action-menu'
  },
  tabBar: {
    wrapper: 'tab-bar-wrapper',
    buttonsWrapper: 'tab-bar-buttons-wrapper',
    button: 'tab-bar-button',
    menuButton: 'tab-bar-menu-button',
    menuOption: 'tab-bar-menu-option',
    tabsWrapper: 'tab-bar-tabs',
    tabOptionWrapper: 'tab-bar-tabs-option-wrapper',
    tabOption: 'tab-bar-tabs-option',
    tabOptionLabel: 'tab-bar-tabs-option-label',
    tabOptionCloseButton: 'tab-bar-tabs-option-close-button',
    tabAddButton: 'tab-bar-tab-add-button',
    maxTabsReachedOverlay: 'tab-bar-max-tabs-reached-overlay',
    tabCloseConfirmationOverlay: 'tab-bar-tab-close-confirmation-overlay',
    tabCloseConfirmationBody: 'tab-bar-tab-close-confirmation-body',
    tabCloseConfirmationCancelButton: 'tab-bar-tab-close-confirmation-cancel-button',
    tabCloseConfirmationAcceptButton: 'tab-bar-tab-close-confirmation-accept-button'
  },
  noTabs: {
    wrapper: 'no-tabs-wrapper',
    newTabButton: 'no-tabs-new-tab-button'
  },
  notification: {
    wrapper: 'notification-wrapper',
    title: 'notification-title',
    content: 'notification-content',
  }
};
