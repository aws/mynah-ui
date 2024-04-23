import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { MynahUI, MynahUIProps } from '@aws/mynah-ui';
import './mynah-ui-polaris-theme.scss';
import { CardRenderDetails } from '../../../../dist/static';

type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type ExtractMethods<T> = PickMatching<T, any>;
export type MynahUIPublicFeatures = ExtractMethods<MynahUI>;

export const MynahUIWrapper = forwardRef((props: MynahUIProps, ref: React.Ref<MynahUIPublicFeatures>): JSX.Element => {
  const mynahWrapperId = `mynah-ui-wrapper-${new Date().getTime()}`;
  let mynahUI: MynahUI;

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
    notify: props => {
      mynahUI?.notify(props);
    },
    endMessageStream: (tabId, messageId, updateWith):CardRenderDetails => {
      return mynahUI.endMessageStream(tabId, messageId, updateWith);
    },
    showCustomForm: (tabId, formItems, buttons, title, description) => {
      mynahUI?.showCustomForm(tabId, formItems, buttons, title, description);
    },
  }));

  useEffect(() => {
    const wrapperDom = document.querySelector(`#${mynahWrapperId}`);
    if (wrapperDom != null) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      mynahUI = new MynahUI({
        ...props,
        rootSelector: `#${mynahWrapperId}`,
      });
    }
  }, []);

  return <div id={mynahWrapperId} className="mynah-ui-chat-wrapper" />;
});
