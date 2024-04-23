import {
  Alert,
  AppLayout,
  Container,
  ContentLayout,
  ExpandableSection,
  Grid,
  Header,
  Link,
  SpaceBetween,
} from '@cloudscape-design/components';
import '../assets/styles.scss';
import { MyChat } from './mynah-ui-chat/MyChat';
import { HeaderToggles } from './header/HeaderToggles';
import { useEffect, useState } from 'react';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

export const Main = (): JSX.Element => {
  const [logMessages, setLogMessages] = useState<string[]>();
  const language = 'tsx';
  const themeMapping = `:root, body, div.mynah-ui-chat-wrapper {
  --mynah-max-width: 100%;
  --mynah-sizing-base: #{awsui.$space-scaled-xxs};

  --mynah-chat-wrapper-spacing: var(--mynah-sizing-4);
  --mynah-font-family: system-ui, -apple-system, sans-serif;
  --mynah-syntax-code-font-family: monospace;
  --mynah-color-text-default: #{awsui.$color-text-body-default};
  --mynah-color-text-strong: #{awsui.$color-text-body-default};
  --mynah-color-text-weak: #{awsui.$color-text-input-disabled};
  --mynah-color-text-link: #{awsui.$color-text-link-default};
  --mynah-color-text-input: #{awsui.$color-text-form-default};
  --mynah-color-light: rgba(0, 0, 0, 0.05);
  --mynah-color-highlight: rgba(255, 180, 0, 0.25);
  --mynah-color-highlight-text: #886411;
  --mynah-color-border-default: #{awsui.$color-border-divider-default};
  --mynah-button-border-width: 1px;
  --mynah-border-width: 1px;
  --mynah-color-syntax-variable: #9b46b0;
  --mynah-color-syntax-function: #0073c0;
  --mynah-color-syntax-operator: #9b46b0;
  --mynah-color-syntax-attr-value: #007acc;
  --mynah-color-syntax-attr: #a31515;
  --mynah-color-syntax-property: #0598bc;
  --mynah-color-syntax-comment: #616161;
  --mynah-color-syntax-code: #{awsui.$color-text-accent};
  --mynah-color-syntax-bg: rgba(40, 120, 200, 0.2);
  --mynah-color-status-info: #{awsui.$color-text-status-info};
  --mynah-color-status-success: #{awsui.$color-text-status-success};
  --mynah-color-status-warning: #{awsui.$color-text-status-warning};
  --mynah-color-status-error: #{awsui.$color-text-status-error};
  --mynah-color-bg: #{awsui.$color-background-layout-main};
  --mynah-color-tab-active: #{awsui.$color-background-container-content};
  --mynah-color-toggle: #{awsui.$color-background-button-primary-default};
  --mynah-color-toggle-reverse: #{awsui.$color-text-button-primary-default};
  --mynah-color-button: #{awsui.$color-background-button-normal-active};
  --mynah-color-button-reverse: #{awsui.$color-text-button-normal-active};
  --mynah-color-alternate: #{awsui.$color-background-button-primary-default};
  --mynah-color-alternate-reverse: #{awsui.$color-text-button-primary-default};
  --mynah-card-bg: #{awsui.$color-background-container-content};
  --mynah-shadow-button: 0 5px 10px -10px rgba(0, 0, 0, 0.25);
  --mynah-shadow-card: 0;
  --mynah-shadow-overlay: #{awsui.$shadow-container-active};
  --mynah-syntax-code-font-size: 1rem;
  --mynah-syntax-code-line-height: 1.25rem;
  --mynah-font-size-xxsmall: 0.75rem;
  --mynah-font-size-xsmall: 0.85rem;
  --mynah-font-size-small: 0.95rem;
  --mynah-font-size-medium: 1rem;
  --mynah-font-size-large: 1.125rem;
  --mynah-line-height: 1.25rem;
  --mynah-card-radius: #{awsui.$border-radius-container};
  --mynah-card-radius-corner: 0;
  --mynah-button-radius: #{awsui.$border-radius-input};
  --mynah-input-radius: #{awsui.$border-radius-input};
  --mynah-bottom-panel-transition: all 850ms cubic-bezier(0.25, 1, 0, 1);
  --mynah-very-short-transition: all 600ms cubic-bezier(0.25, 1, 0, 1);
  --mynah-very-long-transition: all 1650ms cubic-bezier(0.25, 1, 0, 1);
  --mynah-short-transition: all 550ms cubic-bezier(0.85, 0.15, 0, 1);
  --mynah-short-transition-rev: all 580ms cubic-bezier(0.35, 1, 0, 1);
  --mynah-short-transition-rev-opacity: opacity 750ms
    cubic-bezier(0.35, 1, 0, 1);
  --mynah-text-flow-transition: all 800ms cubic-bezier(0.35, 1.2, 0, 1),
    transform 800ms cubic-bezier(0.2, 1.05, 0, 1);
}`;
  const codeMynahUIWrapper = `import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { MynahUI, MynahUIProps } from '@aws/mynah-ui';
// import '@amzn/awsui-design-tokens/polaris.scss';
import './mynah-ui-polaris-theme.scss';

type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type ExtractMethods<T> = PickMatching<T, any>;
export type MynahUIPublicFeatures = ExtractMethods<MynahUI>;

export const MynahUIWrapper = forwardRef(
  (props: MynahUIProps, ref: React.Ref<MynahUIPublicFeatures>): JSX.Element => {
    const mynahWrapperId = \`mynah-ui-wrapper-\${new Date().getTime()}\`;
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
      notify: (props) => {
        mynahUI?.notify(props);
      },
      showCustomForm: (tabId, formItems, buttons, title, description) => {
        mynahUI?.showCustomForm(tabId, formItems, buttons, title, description);
      },
    }));

    useEffect(() => {
      const wrapperDom = document.querySelector(\`#\${mynahWrapperId}\`);
      if (wrapperDom != null) {
        mynahUI = new MynahUI({
          ...props,
          rootSelector: \`#\${mynahWrapperId}\`,
        });
      }
    }, []);

    return (
      <div id={mynahWrapperId} className='mynah-ui-chat-wrapper' />
    );
  }
);`;
  const codeUsage = `export const MyChat = (): JSX.Element => {
  const mynahUIRef = useRef<MynahUIPublicFeatures>(null);
  const mynahUI: MynahUIPublicFeatures | null;
  const eventHandlers: Partial<MynahUIProps> = {
    onChatPrompt: (tabId: string, prompt: ChatPrompt) => {

      // Adding user prompt to render
      mynahUI?.addChatItem(tabId, {
        type: ChatItemType.PROMPT,
        messageId: new Date().getTime().toString(),
        body: \`\${prompt.escapedPrompt as string}\`,
      });

      // Call to answering function
    },
    onSendFeedback: (tabId, feedbackPayload) => {},
    onShowMoreWebResultsClick: (tabId, messageId) => {},
    onCopyCodeToClipboard: (tabId, messageId, ...) => {},
    ...
  };
  const tabId = 'NO_TABS_TABID';
  useEffect(()=>{
    // We're grabbing the mynahUI itself to be able to call its methods
    if (mynahUIRef?.current != null) {
      mynahUI = mynahUIRef.current;
    }

    // And now lets add a chat item
    mynahUI?.addChatItem(tabId, {...})
  },[])
  return <Container
      header={
        <Header description='It is all mocked, but showcases almost all features.'>
          Chat with Q
        </Header>
      }
      disableContentPaddings
    >
      <MynahUIWrapper
        ref={mynahUIRef}
        config={{ maxTabs: 1 }}
        tabs={{
          [tabId]: {
            isSelected: true,
            store: {...},
          },
        }}
        defaults={{...}}
        {...eventHandlers}
      />
    </Container>
}`;

  useEffect(() => {
    const elms = document.querySelectorAll('.sample-code-syntax > pre');
    if (elms != null) {
      Array.from(elms).forEach((elm) => Prism.highlightElement(elm));
    }
  }, []);

  return (
    <AppLayout
      toolsHide
      navigationHide
      contentType='default'
      content={
        <ContentLayout
          header={
            <SpaceBetween size='m'>
              <Header
                variant='h1'
                info={
                  <Link href='https://github.com/aws/mynah-ui' target='_blank'>
                    github/aws/mynah-ui
                  </Link>
                }
                description='Since MynahUI is framework independent, it can be wrapped also in React.'
                actions={<HeaderToggles />}
              >
                MynahUI inside Cloudscape
              </Header>

              <Alert statusIconAriaLabel='Info'>
                This is MynahUI which is used for Q Chat in IDEs but wrapped
                with CloudScape 3.0.
              </Alert>
            </SpaceBetween>
          }
        >
          <Grid
            data-class='main-panel-grid'
            gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}
          >
            <div className='main-panel-content-wrapper'>
              <Container
                header={
                  <Header description='This is a wrapper of the original vanillajs @aws/mynah-ui dependency'>
                    MynahUI React Wrapper
                  </Header>
                }
              >
                <p>
                  Hello and welcome to the PoC of the mynah-ui cloudscape
                  version. This version basically uses original mynah-ui under
                  the hood but it provides a React component with Cloudscape
                  look&feel out of the box.
                </p>
                <p> But, what we did to make this work?</p>
                <ul>
                  <li>
                    Installed{' '}
                    <code className='mynah-syntax-highlighter mynah-inline-code'>
                      mynah-ui
                    </code>{' '}
                    as a dependency
                  </li>
                  <li>Created an empty wrapper component</li>
                  <li>
                    Initialized MynahUI inside the{' '}
                    <code className='mynah-syntax-highlighter mynah-inline-code'>
                      useEffect
                    </code>{' '}
                    (when component is generated) with the root selector which
                    refers to the wrapper component itself.
                  </li>
                  <li>Added the polaris (cloudscape) theme mappings.</li>
                  <li>
                    Mapped all{' '}
                    <code className='mynah-syntax-highlighter mynah-inline-code'>
                      mynah-ui
                    </code>{' '}
                    props to the new react wrapper component (by using the exact
                    same{' '}
                    <code className='mynah-syntax-highlighter mynah-inline-code'>
                      MynahUIProps
                    </code>
                    ) from the vanilla library.
                  </li>
                  <li>
                    Generated a Ref structure which has all the methods
                    available in MynahUI like{' '}
                    <code className='mynah-syntax-highlighter mynah-inline-code'>
                      addChatItem
                    </code>
                    ,
                    <code className='mynah-syntax-highlighter mynah-inline-code'>
                      updateChatAnswerWithMessageId
                    </code>{' '}
                    etc.
                  </li>
                </ul>
                <ExpandableSection headerText='How we migrated MynahUI to React (+ Cloudscape)'>
                  <div className='sample-code-syntax mynah-syntax-highlighter'>
                    <pre className={`language-${language}`}>
                      <code>{codeMynahUIWrapper}</code>
                    </pre>
                  </div>
                </ExpandableSection>
                <ExpandableSection headerText='How we map polaris theme to mynah-ui css custom properties (in progress)'>
                  <div className='sample-code-syntax mynah-syntax-highlighter'>
                    <pre className='language-css'>
                      <code>{themeMapping}</code>
                    </pre>
                  </div>
                </ExpandableSection>
                <ExpandableSection headerText='How you can use it inside your own component'>
                  <div className='sample-code-syntax mynah-syntax-highlighter'>
                    <pre className={`language-${language}`}>
                      <code>{codeUsage}</code>
                    </pre>
                  </div>
                </ExpandableSection>
                <p>
                  Since the mynah-ui react wrapper follows the exact same
                  arguments, properties and data model from the vanilla
                  mynah-ui, the documentations we already have can be used as
                  is.
                </p>
                <p>
                  <i>As you can see;</i>
                  <br />
                  By using the same data model, same methods and same UI with a
                  different theme,{' '}
                  <b>
                    we're able to provide the exact same experience and
                    workflows in any platform we use mynah-ui.
                  </b>
                </p>
                <p>
                  Having one controller and one themeable UI can allow us to{' '}
                  <b>
                    iterate and act much faster, provide the same experience
                    everywhere, fix problems from one single source and reduce
                    duplicate work to almost 0.
                  </b>
                </p>
              </Container>

              <Container
                header={
                  <Header description='To clear logs, please use /clear-logs from chat.'>
                    Logs
                  </Header>
                }
              >
                {logMessages?.map((message, index) => (
                  <div className='log-content' key={`${index}_log_mesage`}>
                    <div dangerouslySetInnerHTML={{ __html: message }} />
                  </div>
                ))}
              </Container>
            </div>
            <MyChat
              onLog={(message) => {
                setLogMessages((prevLogs) => [...(prevLogs ?? []), message]);
              }}
              onClearLog={() => {
                setLogMessages([]);
              }}
            />
          </Grid>
        </ContentLayout>
      }
    />
  );
};
