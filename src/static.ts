/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MynahIcons } from './components/icon';
import { ToggleOption } from './components/toggle';

/**
 * data store model to update the mynah ui partially or fully
 */
export interface MynahUIDataModel {
  /**
   * Web suggestions search loading animation state
   */
  loading?: boolean;
  /**
   * Chat screen loading animation state (mainly use during the stream or getting the initial answer)
   */
  loadingChat?: boolean;
  /**
   * Show chat avatars or not
   */
  showChatAvatars?: boolean;
  /**
   * Text to be appeared on top of the search web suggestions (also above the tabs)
   */
  chatMessageOnTopOfSearchResults?: string;
  /**
   * Navigation tabs on the web suggestions search screen
   */
  navigationTabs?: ToggleOption[];
  /**
   * Right side navigation tabs
   */
  sideNavigationTabs?: ToggleOption[];
  /**
   * Is mynah shows the web suggestions search screen or the chat screen
   */
  mode?: MynahMode;
  /**
   * List of Suggestion objects to be shown on the web suggestions search screen
   */
  suggestions?: Suggestion[];
  /**
   * List of ChatItem objects to be shown on the chat screen
   */
  chatItems?: ChatItem[];
}

export enum MynahEventNames {
  RESET_STORE = 'resetStore',
  SEARCH = 'search',
  FEEDBACK_SET = 'feedbackSet',
  SUGGESTION_VOTE = 'suggestionVote',
  SUGGESTION_OPEN = 'suggestionOpen',
  SUGGESTION_LINK_COPY = 'suggestionLinkCopy',
  SUGGESTION_ENGAGEMENT = 'suggestionEngagement',
  SUGGESTION_COPY_TO_CLIPBOARD = 'suggestionCopyToClipboard',
  CHAT_PROMPT = 'chatPrompt',
  FOLLOW_UP_CLICKED = 'followUpClicked',
  SUGGESTION_ATTACHED_TO_CHAT = 'suggestionAttachedToChat',
  UPDATE_LAST_CHAT_ANSWER_STREAM = 'updateLastChatAnswerStream',
  CLEAR_CHAT = 'clearChat',
  SHOW_MORE_WEB_RESULTS_CLICK = 'showMoreWebResultsClick',
  SHOW_FEEDBACK_FORM_CLICK = 'showFeedbackFormClick',
};

export const MynahPortalNames = {
  WRAPPER: 'wrapper',
  SIDE_NAV: 'sideNav',
  OVERLAY: 'overlay',
  FEEDBACK_FORM: 'feedbackForm',
};

export interface SearchPayloadMatchPolicy {
  must: string[];
  should: string[];
  mustNot: string[];
}

export interface SearchPayloadCodeSelection {
  selectedCode: string;
  file?: {
    range: {
      start: { row: string; column: string };
      end: { row: string; column: string };
    };
    name: string;
  };
}

export interface SearchPayload {
  selectedTab?: string;
}

export interface SuggestionMetaData {
  stars?: number; // repo stars
  forks?: number; // repo forks
  answerCount?: number; // total answers if it is a question
  isOfficialDoc?: boolean; // is suggestion comes from an official api doc
  isAccepted?: boolean; // is accepted or not if it is an answer
  score?: number; // relative score according to the up and down votes for a question or an answer
  lastActivityDate?: number; // creation or last update date for question or answer
}

export type SuggestionMetaDataUnion = Record<string, SuggestionMetaData>;

export interface CanonicalExample { canonicalExample: { body: string; url: string } }

export interface Suggestion {
  title: string;
  url: string;
  body?: string;
  type?: string;
  metadata?: SuggestionMetaDataUnion | CanonicalExample;
}
export enum ChatItemType {
  PROMPT = 'prompt',
  SYSTEM_PROMPT = 'system-prompt',
  AI_PROMPT = 'ai-prompt',
  ANSWER = 'answer',
  ANSWER_STREAM = 'answer-stream',
  ANSWER_PART = 'answer-part'
}

export interface ChatItem {
  body?: string;
  type: ChatItemType;
  followUp?: {
    text?: string;
    options?: ChatItemFollowUp[];
  };
  relatedContent?: {
    title: string | boolean;
    content: Suggestion[];
  };
  suggestions?: {
    title: string | boolean;
    suggestions: Suggestion[];
  };
}

export interface ChatPrompt {
  prompt: string;
  attachment?: Suggestion;
}

export interface ChatItemFollowUp extends ChatPrompt {
  type?: string;
  pillText: string;
}

export enum MynahMode {
  CHAT = 'chat',
  SEARCH = 'search'
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
}

export const SupportedCodingLanguages = [ 'typescript', 'javascript', 'java', 'json', 'python' ];
type ElementType<T extends readonly unknown[]> = T extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type SupportedCodingLanguagesType = ElementType<typeof SupportedCodingLanguages>;

export const SupportedCodingLanguagesExtensionToTypeMap = {
  ts: 'typescript',
  js: 'javascript',
  py: 'python',
  java: 'java',
  json: 'json',
};

export type OnCopiedToClipboardFunction = (type?: 'selection' | 'block', text?: string) => void;

export enum SuggestionEventName {
  OPEN = 'openSuggestion',
  COPY = 'copy',
}

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

export interface SuggestionEngagement {
  /**
     * Suggestion information
     */
  suggestion: Suggestion;

  /**
     * Engagement type
     */
  engagementType: EngagementType;
  /**
     * Total duration in ms till the engagement triggered.
     */
  engagementDurationTillTrigger: number;
  /**
     * This is a little bit more than what you might expect on a normal scroll position of the suggestion card.
     * This attribute gives the value for how much the users traveled their mouses and additionally how much they scrolled to focus on that suggestion
     */
  scrollDistanceToEngage: number;
  /**
     * Total mouse movement in x and y directions till the engagament triggered.
     * To avoid confusion: this is not the distance between start and end points, this is the total traveled distance.
     */
  totalMouseDistanceTraveled: { x: number; y: number };
  /**
     * If the engagementType is "interaction" and this object has a value, you can assume it as a text selection.
     * If the engagementType is "interaction" but this object is not defined, you can assume it as a click
     */
  selectionDistanceTraveled?: { x: number; y: number; selectedText?: string };
}

export type FeedbackStars = 1 | 2 | 3 | 4 | 5;

export interface FeedbackPayload {
  stars?: FeedbackStars;
  comment?: string;
}

export enum NotificationType {
  INFO = MynahIcons.INFO,
  SUCCESS = MynahIcons.OK_CIRCLED,
  WARNING = MynahIcons.WARNING,
  ERROR = MynahIcons.ERROR,
}
