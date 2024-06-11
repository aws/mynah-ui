import { useEffect, useRef, useState } from 'react';
import { ChatItemCardContent, ChatItemCardContentProps } from '@aws/mynah-ui';

export const MynahUIStreamingContent = (
  props: ChatItemCardContentProps
): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  let [contentElement, setContentElement] = useState<ChatItemCardContent>();

  useEffect(() => {
    contentElement?.updateCardStack(props);
  }, [props.body, props.children]);

  useEffect(() => {
    if (
      contentElement == null &&
      containerRef?.current != null &&
      Array.from(containerRef.current.children).length === 0
    ) {
      const elm = new ChatItemCardContent({
        ...props,
      });
      setContentElement(elm);
      containerRef.current.appendChild(elm.render);
    }
  }, []);

  return <div className='mynah-ui-streaming-content' ref={containerRef} />;
};
