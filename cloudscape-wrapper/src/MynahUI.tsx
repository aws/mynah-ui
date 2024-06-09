import { forwardRef, useImperativeHandle, useState } from 'react';
import './mynah-ui-polaris-theme.scss';
import { CloudscapeMynahUIButton } from './component-maps/button/button';
import { CloudscapeMynahUIRadioGroup } from './component-maps/radio-group';
import { CloudscapeMynahUISelect } from './component-maps/select';
import { CloudscapeMynahUITextInput } from './component-maps/text-input';
import { CloudscapeMynahUITextArea } from './component-maps/text-area';
import { MynahUI, MynahUIProps, generateUID } from '@aws/mynah-ui';
import { CardRenderDetails } from '@aws/mynah-ui/dist/static';

type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type ExtractMethods<T> = PickMatching<T, any>;
export type MynahUIPublicFeatures = ExtractMethods<MynahUI>;

export const MynahUIWrapper = forwardRef(
  (props: MynahUIProps, ref: React.Ref<MynahUIPublicFeatures>): JSX.Element => {
    let mynahUI:MynahUI;

    useImperativeHandle(ref, () => ({
      addToUserPrompt: (tabId, codeStringToAdd) => {
        mynahUI?.addToUserPrompt(tabId, codeStringToAdd);
      },
      addChatItem: (tabId, chatItem) => {
        mynahUI?.addChatItem(tabId, chatItem);
      },
      updateLastChatAnswer: (tabId, updateWith) => {
        mynahUI?.updateLastChatAnswer(tabId, updateWith);
      },
      updateChatAnswerWithMessageId: (tabId, messageId, updateWith) => {
        mynahUI?.updateChatAnswerWithMessageId(tabId, messageId, updateWith);
      },
      selectTab: (tabId, eventId) => {
        mynahUI?.selectTab(tabId, eventId);
      },
      removeTab: (tabId, eventId) => {
        mynahUI?.removeTab(tabId, eventId);
      },
      updateStore: (tabId, data) => {
        return mynahUI?.updateStore(tabId, data);
      },
      getSelectedTabId: () => {
        return mynahUI?.getSelectedTabId();
      },
      getAllTabs: () => {
        return mynahUI?.getAllTabs() ?? {};
      },
      notify: (props) => {
        mynahUI?.notify(props);
      },
      endMessageStream: (tabId, messageId, updateWith): CardRenderDetails => {
        return mynahUI?.endMessageStream(tabId, messageId, updateWith) ?? {};
      },
      showCustomForm: (tabId, formItems, buttons, title, description) => {
        mynahUI?.showCustomForm(tabId, formItems, buttons, title, description);
      },
    }));

    return (
      <div
        id={`mynah-ui-wrapper-${generateUID()}`}
        className='mynah-ui-chat-wrapper'
        ref={(ref) => {
          if (
            mynahUI == null &&
            ref != null &&
            Array.from((ref as unknown as HTMLElement).children).length === 0
          ) {
            mynahUI = new MynahUI({
              ...props,
              config: {
                ...props.config,
                componentOverrides: {
                  Button: CloudscapeMynahUIButton,
                  RadioGroup: CloudscapeMynahUIRadioGroup,
                  Select: CloudscapeMynahUISelect,
                  TextInput: CloudscapeMynahUITextInput,
                  TextArea: CloudscapeMynahUITextArea,
                },
              },
              rootSelector: `#${ref.getAttribute('id')}`,
            });
          }
        }}
      />
    );
  }
);
