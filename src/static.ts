/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MynahIcons, MynahIconsType } from './components/icon';
import { ChatItemBodyRenderer } from './helper/dom';
import {
  SelectAbstract,
  SelectProps,
  RadioGroupAbstract,
  RadioGroupProps,
  ButtonAbstract,
  ButtonProps,
  TextInputProps,
  TextInputAbstract,
  TextAreaProps,
  TextAreaAbstract,
  ToggleOption,
} from './main';

export interface QuickActionCommand {
  command: string;
  id?: string;
  label?: string;
  disabled?: boolean;
  icon?: MynahIcons | MynahIconsType;
  description?: string;
  placeholder?: string;
  children?: QuickActionCommandGroup[];
  route?: string[];
}
export interface QuickActionCommandGroup {
  groupName?: string;
  actions?: Action[];
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
   * Tab title
   * */
  tabBackground?: boolean;
  /**
   * If tab is running an action (loadingChat = true) this markdown will be shown before close in a popup
   */
  tabCloseConfirmationMessage?: string | null;
  /**
   * Keep tab open button text
   */
  tabCloseConfirmationKeepButton?: string | null;
  /**
   * Close tab button text
   */
  tabCloseConfirmationCloseButton?: string | null;
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
  * Context commands to show when user hits @ to the input any point
  */
  contextCommands?: QuickActionCommandGroup[];
  /**
  * Placeholder to be shown on prompt input
  */
  promptInputPlaceholder?: string;
  /**
  * Prompt input text
  */
  promptInputText?: string;
  /**
    * Label to be shown on top of the prompt input
    */
  promptInputLabel?: string | null;
  /**
    * Label to be shown on top of the prompt input
    */
  promptInputVisible?: boolean;
  /**
  * Info block to be shown under prompt input
  */
  promptInputInfo?: string;
  /**
  * A sticky chat item card on top of the prompt input
  */
  promptInputStickyCard?: Partial<ChatItem> | null;
  /**
  * Prompt input field disabled state, set to tru to disable it
  */
  promptInputDisabledState?: boolean;
  /**
  * Prompt input progress field
  */
  promptInputProgress?: ProgressField | null;
  /**
  * List of chat item objects to be shown on the web suggestions search screen
  */
  chatItems?: ChatItem[];
  /**
   * Attached code under the prompt input field
   */
  selectedCodeSnippet?: string;
  /**
   * Tab bar buttons next to the tab items
   */
  tabBarButtons?: TabBarMainAction[];
  /**
   * Tab content compact mode which keeps everything in the middle
   */
  compactMode?: boolean;
  /**
   * Tab content header details, only visibile when showTabHeaderDetails is set to 'true'
   */
  tabHeaderDetails?: TabHeaderDetails | null;
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
  ROOT_FOCUS = 'rootFocusStateChange',
  CARD_VOTE = 'cardVote',
  SOURCE_LINK_CLICK = 'sourceLinkClick',
  INFO_LINK_CLICK = 'infoLinkClick',
  FORM_LINK_CLICK = 'formLinkClick',
  LINK_CLICK = 'linkClick',
  CHAT_ITEM_ENGAGEMENT = 'chatItemEngagement',
  COPY_CODE_TO_CLIPBOARD = 'copyCodeToClipboard',
  CODE_BLOCK_ACTION = 'codeBlockAction',
  CHAT_PROMPT = 'chatPrompt',
  CHAT_ITEM_ADD = 'chatItemAdd',
  FOLLOW_UP_CLICKED = 'followUpClicked',
  BODY_ACTION_CLICKED = 'bodyActionClicked',
  QUICK_COMMAND_GROUP_ACTION_CLICK = 'quickCommandGroupActionClicked',
  TABBED_CONTENT_SWITCH = 'tabbedContentSwitch',
  SHOW_MORE_WEB_RESULTS_CLICK = 'showMoreWebResultsClick',
  SHOW_FEEDBACK_FORM = 'showFeedbackForm',
  FILE_CLICK = 'fileClick',
  FILE_ACTION_CLICK = 'fileActionClick',
  TAB_FOCUS = 'tabFocus',
  CUSTOM_FORM_ACTION_CLICK = 'customFormActionClick',
  FORM_MODIFIER_ENTER_PRESS = 'formModifierEnterPress',
  ADD_ATTACHMENT = 'addAttachment',
  REMOVE_ATTACHMENT = 'removeAttachment',
  TAB_BAR_BUTTON_CLICK = 'tabBarButtonClick',
  PROMPT_PROGRESS_ACTION_CLICK = 'promptProgressActionClick',
  ROOT_RESIZE = 'rootResize',
  CONTEXT_SELECTED = 'contextSelected'
};

export enum MynahPortalNames {
  WRAPPER = 'wrapper',
  SIDE_NAV = 'sideNav',
  OVERLAY = 'overlay',
  FEEDBACK_FORM = 'feedbackForm',
};

export type PromptAttachmentType = 'code' | 'markdown';

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

export type Status = 'info' | 'success' | 'warning' | 'error';

export interface ProgressField {
  /**
   * Prompt input progress status
   */
  status?: 'default' | Status;
  /**
  * Prompt input progress text
  */
  text?: string;
  /**
  * Prompt input progress text for the current state (ie: 15%, 2min remaining)
  */
  valueText?: string;
  /**
  * Prompt input progress value to show the inner bar state, -1 for infinite
  */
  value?: number;
  /**
   * Prompt input progress actions
   */
  actions?: ChatItemButton[];
}

export interface TreeNodeDetails {
  status?: Status;
  icon?: MynahIcons | MynahIconsType;
  label?: string;
  description?: string;
  clickable?: boolean;
}

export interface ChatItemContent {
  header?: ChatItemContent | null;
  body?: string | null;
  customRenderer?: string | ChatItemBodyRenderer | ChatItemBodyRenderer[] | null;
  followUp?: {
    text?: string;
    options?: ChatItemAction[];
  } | null;
  relatedContent?: {
    title?: string;
    content: SourceLink[];
  } | null;
  codeReference?: ReferenceTrackerInformation[] | null;
  fileList?: {
    fileTreeTitle?: string;
    rootFolderTitle?: string;
    filePaths?: string[];
    deletedFiles?: string[];
    collapsedByDefault?: boolean;
    hideFileCount?: boolean;
    actions?: Record<string, FileNodeAction[]>;
    details?: Record<string, TreeNodeDetails>;
  } | null;
  /**
   * @deprecated starting from version v5.0.0, it will no longer render the buttons in a reversed order, but rather in the order of the array.
   */
  buttons?: ChatItemButton[] | null;
  formItems?: ChatItemFormItem[] | null;
  footer?: ChatItemContent | null;
  informationCard?: {
    title?: string;
    status?: {
      status?: Status;
      icon?: MynahIcons | MynahIconsType;
      body?: string;
    };
    description?: string;
    icon?: MynahIcons | MynahIconsType;
    content: ChatItemContent;
  } | null;
  tabbedContent?: Array<ToggleOption & {
    content: ChatItemContent;
  }> | null;
  codeBlockActions?: CodeBlockActions | null;
}

export interface ChatItem extends ChatItemContent{
  type: ChatItemType;
  messageId?: string;
  snapToTop?: boolean;
  canBeVoted?: boolean;
  icon?: MynahIcons | MynahIconsType;
  hoverEffect?: boolean;
  status?: Status;
}

export interface ValidationPattern {
  pattern: string | RegExp;
  errorMessage?: string;
}

interface BaseFormItem {
  id: string;
  mandatory?: boolean;
  title?: string;
  placeholder?: string;
  value?: string;
  description?: string;
}

export type TextBasedFormItem = BaseFormItem & {
  type: 'textarea' | 'textinput' | 'numericinput' | 'email';
  checkModifierEnterKeyPress?: boolean;
  validationPatterns?: {
    operator?: 'and' | 'or';
    genericValidationErrorMessage?: string;
    patterns: ValidationPattern[];
  };
};

type SelectFormItem = BaseFormItem & {
  type: 'select';
  options: Array<{
    value: string;
    label: string;
  }>;
};

type OtherFormItem = BaseFormItem & {
  type: 'stars' | 'radiogroup';
  options?: Array<{
    value: string;
    label: string;
  }>;
};

export type ChatItemFormItem = TextBasedFormItem | SelectFormItem | OtherFormItem;

export interface ChatPrompt {
  prompt?: string;
  escapedPrompt?: string;
  command?: string;
  context?: string[] | QuickActionCommand[];
}

export interface ChatItemAction extends ChatPrompt {
  type?: string;
  pillText: string;
  disabled?: boolean;
  description?: string;
  status?: 'primary' | Status;
  icon?: MynahIcons | MynahIconsType;
}
export interface ChatItemButton extends Omit<Action, 'status'> {
  keepCardAfterClick?: boolean;
  waitMandatoryFormItems?: boolean;
  status?: 'main' | 'primary' | 'clear' | Status;
  flash?: 'infinite' | 'once';
  fillState?: 'hover' | 'always';
  position?: 'inside' | 'outside';
}
export interface Action {
  text?: string;
  id: string;
  disabled?: boolean;
  description?: string;
  status?: Status;
  icon?: MynahIcons | MynahIconsType;
}
export interface TabBarAction extends Action {}

export interface TabBarMainAction extends TabBarAction {
  items?: TabBarAction[];
}

export interface FileNodeAction {
  name: string;
  label?: string;
  disabled?: boolean;
  description?: string;
  status?: Status;
  icon: MynahIcons | MynahIconsType;
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
  AT = '@',
  SLASH = '/',
  BACK_SLASH = '\\'
}

export interface ReferenceTrackerInformation {
  licenseName?: string;
  repository?: string;
  url?: string;
  recommendationContentSpan?: {
    start: number;
    end: number;
  };
  information: string;
}

export type CodeSelectionType = 'selection' | 'block';
export type OnCopiedToClipboardFunction = (type?: CodeSelectionType, text?: string, referenceTrackerInformation?: ReferenceTrackerInformation[], codeBlockIndex?: number, totalCodeBlocks?: number) => void;
export type OnCodeBlockActionFunction = (actionId: string, data?: any, type?: CodeSelectionType, text?: string, referenceTrackerInformation?: ReferenceTrackerInformation[], codeBlockIndex?: number, totalCodeBlocks?: number) => void;

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

export interface TabHeaderDetails {
  icon?: MynahIcons | MynahIconsType;
  title?: string;
  description?: string;
}

export interface CodeBlockAction {
  id: 'copy' | 'insert-to-cursor' | string;
  label: string;
  description?: string;
  icon?: MynahIcons | MynahIconsType;
  data?: any;
  flash?: 'infinite' | 'once';
  acceptedLanguages?: string[];
}
export type CodeBlockActions = Record<'copy' | 'insert-to-cursor' | string, CodeBlockAction | undefined | null>;

export interface ConfigTexts {
  mainTitle: string;
  feedbackFormTitle: string;
  feedbackFormDescription: string;
  feedbackFormOptionsLabel: string;
  feedbackFormCommentLabel: string;
  feedbackThanks: string;
  feedbackReportButtonLabel: string;
  codeSuggestions: string;
  clickFileToViewDiff: string;
  files: string;
  changes: string;
  insertAtCursorLabel: string;
  copy: string;
  showMore: string;
  save: string;
  cancel: string;
  submit: string;
  pleaseSelect: string;
  stopGenerating: string;
  copyToClipboard: string;
  noMoreTabsTooltip: string;
  codeSuggestionWithReferenceTitle: string;
  spinnerText: string;
  tabCloseConfirmationMessage: string;
  tabCloseConfirmationKeepButton: string;
  tabCloseConfirmationCloseButton: string;
  noTabsOpen: string;
  openNewTab: string;
  commandConfirmation: string;
};

type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type ExtractMethods<T> = PickMatching<T, any>;

export interface ComponentOverrides {
  Button?: new(props: ButtonProps) => ExtractMethods<ButtonAbstract>;
  RadioGroup?: new(props: RadioGroupProps) => ExtractMethods<RadioGroupAbstract>;
  Select?: new(props: SelectProps) => ExtractMethods<SelectAbstract>;
  TextInput?: new(props: TextInputProps) => ExtractMethods<TextInputAbstract>;
  TextArea?: new(props: TextAreaProps) => ExtractMethods<TextAreaAbstract>;
};
export interface ConfigOptions {
  feedbackOptions: Array<{
    label: string;
    value: string;
  }>;
  tabBarButtons?: TabBarMainAction[];
  maxTabs: number;
  maxTabsTooltipDuration?: number;
  noMoreTabsTooltip?: string;
  showPromptField: boolean;
  autoFocus: boolean;
  maxUserInput: number;
  userInputLengthWarningThreshold: number;
  codeBlockActions?: CodeBlockActions;
  codeInsertToCursorEnabled?: boolean;
  codeCopyToClipboardEnabled?: boolean;
  test?: boolean;
}

export interface ConfigModel extends ConfigOptions {
  texts: Partial<ConfigTexts>;
  componentOverrides: Partial<ComponentOverrides>;
}

export interface CardRenderDetails {
  totalNumberOfCodeBlocks?: number;
}
