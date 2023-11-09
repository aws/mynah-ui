/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MynahIcons } from './components/icon';

export interface QuickActionCommand {
  command: string;
  description?: string;
  placeholder?: string;
}
export interface QuickActionCommandGroup {
  groupName?: string;
  commands: QuickActionCommand[];
}
/**
 * data store model to update the mynah ui partially or fully
 */
export interface MynahUIDataModel {
  /**
   * Tab title
   * */
  tabTitle?: string;
  /**
   * Chat screen loading animation state (mainly use during the stream or getting the initial answer)
   */
  loadingChat?: boolean;
  /**
   * Show chat avatars or not
   * */
  showChatAvatars?: boolean;
  /**
   * Show cancel button while loading the chat
   * */
  cancelButtonWhenLoading?: boolean;
  /**
  * Quick Action commands to show when user hits / to the input initially
  */
  quickActionCommands?: QuickActionCommandGroup[];
  /**
  * Placeholder to be shown on prompt input
  */
  promptInputPlaceholder?: string;
  /**
  * Info block to be shown under prompt input
  */
  promptInputInfo?: string;
  /**
  * Prompt input field disabled state, set to tru to disable it
  */
  promptInputDisabledState?: boolean;
  /**
  * List of chat item objects to be shown on the web suggestions search screen
  */
  chatItems?: ChatItem[];
  // TODO
  selectedCodeSnippet?: string;
}

export interface MynahUITabStoreTab {
  /**
   * Is tab selected
   */
  isSelected?: boolean;
  /**
  * Tab items data store
  */
  store?: MynahUIDataModel;
}
/**
 * tabs store model to update the tabs partially or fully
 */
export interface MynahUITabStoreModel {
  [tabId: string]: MynahUITabStoreTab;
}

export enum MynahEventNames {
  RESET_STORE = 'resetStore',
  FEEDBACK_SET = 'feedbackSet',
  CARD_VOTE = 'cardVote',
  SOURCE_LINK_CLICK = 'sourceLinkClick',
  LINK_CLICK = 'linkClick',
  CHAT_ITEM_ENGAGEMENT = 'chatItemEngagement',
  COPY_CODE_TO_CLIPBOARD = 'copyCodeToClipboard',
  INSERT_CODE_TO_CURSOR_POSITION = 'insertCodeToCursorPosition',
  CHAT_PROMPT = 'chatPrompt',
  FOLLOW_UP_CLICKED = 'followUpClicked',
  SHOW_MORE_WEB_RESULTS_CLICK = 'showMoreWebResultsClick',
  SHOW_FEEDBACK_FORM = 'showFeedbackForm',
  OPEN_DIFF = 'openDiff',
  ADD_CODE_SNIPPET = 'addCodeSnippet',
  REMOVE_CODE_SNIPPET = 'removeCodeSnippet',
};

export enum MynahPortalNames {
  WRAPPER = 'wrapper',
  SIDE_NAV = 'sideNav',
  OVERLAY = 'overlay',
  FEEDBACK_FORM = 'feedbackForm',
};

export interface SourceLinkMetaData {
  stars?: number; // repo stars
  forks?: number; // repo forks
  answerCount?: number; // total answers if it is a question
  isOfficialDoc?: boolean; // is suggestion comes from an official api doc
  isAccepted?: boolean; // is accepted or not if it is an answer
  score?: number; // relative score according to the up and down votes for a question or an answer
  lastActivityDate?: number; // creation or last update date for question or answer
}

export interface SourceLink {
  title: string;
  id?: string;
  url: string;
  body?: string;
  type?: string;
  metadata?: Record<string, SourceLinkMetaData>;
}
export enum ChatItemType {
  PROMPT = 'prompt',
  SYSTEM_PROMPT = 'system-prompt',
  AI_PROMPT = 'ai-prompt',
  ANSWER = 'answer',
  ANSWER_STREAM = 'answer-stream',
  ANSWER_PART = 'answer-part',
  CODE_RESULT = 'code-result',
}

export interface ChatItem {
  body?: string | string[];
  type: ChatItemType;
  messageId?: string;
  canBeVoted?: boolean;
  followUp?: {
    text?: string;
    options?: ChatItemFollowUp[];
  };
  relatedContent?: {
    title?: string;
    content: SourceLink[];
  };
  codeReference?: ReferenceTrackerInformation[];
}

export interface ChatPrompt {
  prompt?: string;
  escapedPrompt?: string;
  command?: string;
  attachment?: SourceLink;
}

export interface ChatItemFollowUp extends ChatPrompt {
  type?: string;
  pillText: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  icon?: MynahIcons;
}

export enum KeyMap {
  ESCAPE = 'Escape',
  ENTER = 'Enter',
  BACKSPACE = 'Backspace',
  SPACE = ' ',
  DELETE = 'Delete',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  PAGE_UP = 'PageUp',
  PAGED_OWN = 'PageDown',
  HOME = 'Home',
  END = 'End',
  META = 'Meta',
  TAB = 'Tab',
  SHIFT = 'Shift',
  CONTROL = 'Control',
  ALT = 'Alt',
  SLASH = '/',
  BACK_SLASH = '\\'
}

export interface ReferenceTrackerInformation {
  licenseName?: string;
  repository?: string;
  url?: string;
  recommendationContentSpan: {
    start: number;
    end: number;
  };
  information: string;
}

export type CodeSelectionType = 'selection' | 'block';
export type OnCopiedToClipboardFunction = (type?: CodeSelectionType, text?: string, referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
export type OnInsertToCursorPositionFunction = (type?: CodeSelectionType, text?: string, referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;

export enum RelevancyVoteType {
  UP = 'upvote',
  DOWN = 'downvote',
}

/**
 * 'interaction' will be set if there was a potential text selection or a click input was triggered by the user.
 *  If this is a selection selectionDistanceTraveled object will also be filled
 * 'timespend' will be set basically if there is no interaction except mouse movements in a time spent longer than the ENGAGEMENT_DURATION_LIMIT
 *  Don't forget that in 'timespend' case, user should leave the suggestion card at some point to count it as an interaction.
 *  (They need to go back to the code or move to another card instead)
 */
export enum EngagementType {
  INTERACTION = 'interaction',
  TIME = 'timespend',
}

export interface Engagement {
  /**
     * Engagement type
     */
  engagementType: EngagementType;
  /**
     * Total duration in ms till the engagement triggered.
     */
  engagementDurationTillTrigger: number;
  /**
     * Total mouse movement in x and y directions till the engagement triggered.
     * To avoid confusion: this is not the distance between start and end points, this is the total traveled distance.
     */
  totalMouseDistanceTraveled: { x: number; y: number };
  /**
     * If the engagementType is "interaction" and this object has a value, you can assume it as a text selection.
     * If the engagementType is "interaction" but this object is not defined, you can assume it as a click
     */
  selectionDistanceTraveled?: { x: number; y: number; selectedText?: string };
}

export interface FeedbackPayload {
  messageId: string;
  tabId: string;
  selectedOption: string;
  comment?: string;
}

export enum NotificationType {
  INFO = MynahIcons.INFO,
  SUCCESS = MynahIcons.OK_CIRCLED,
  WARNING = MynahIcons.WARNING,
  ERROR = MynahIcons.ERROR,
}

export interface ConfigModel {
  texts: {
    mainTitle: string;
    feedbackFormTitle: string;
    feedbackFormOptionsLabel: string;
    feedbackFormCommentLabel: string;
    feedbackThanks: string;
    feedbackReportButtonLabel: string;
    codeSuggestions: string;
    clickFileToViewDiff: string;
    files: string;
    insertAtCursorLabel: string;
    copy: string;
    showMore: string;
    save: string;
    cancel: string;
    submit: string;
    stopGenerating: string;
    copyToClipboard: string;
  };
  feedbackOptions: Array<{
    label: string;
    value: string;
  }>;
}
