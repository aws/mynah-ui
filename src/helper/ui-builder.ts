import { CodeBlockActions, ReferenceTrackerInformation } from '../static';
import { Icon, MynahIcons } from '../components/icon';
import { Button, ButtonStatus } from '../components/button';
import { MakePropsBindable } from './bindable';
import { DomBuilderEventHandler, DomBuilderEventHandlerWithOptions, ExtendedHTMLElement, GenericEvents } from './dom';
import { ChatItemCardContent } from '../components/chat-item/chat-item-card-content';
import { Card } from '../components/card/card';

interface UIBuilderContainerBindable {
  classNames?: string[];
  border?: boolean;
  background?: boolean;
  padding?: 'small' | 'medium' | 'large' | 'none';
}
interface UIBuilderContainer extends MakePropsBindable<UIBuilderContainerBindable> {
  type: 'container';
  children?: UIBuilderModel[];
}

interface UIBuilderContentBindable {
  classNames?: string[];
  body?: string;
  subType?: 'streamable' | 'static';
  codeReference?: ReferenceTrackerInformation[] | null;
  codeActions?: CodeBlockActions;
}
interface UIBuilderContent extends MakePropsBindable<UIBuilderContentBindable> {
  type: 'content';
  children?: UIBuilderModel[];
}

interface UIBuilderActionBindable {
  classNames?: string[];
  icon?: MynahIcons;
  label?: string;
  tooltip?: string;
  disabled?: boolean;
  primary?: boolean;
  status?: ButtonStatus;
}
interface UIBuilderAction extends MakePropsBindable<UIBuilderActionBindable> {
  type: 'action';
  events: {
    click: (e: Event) => void;
  } & Partial<Record<GenericEvents, DomBuilderEventHandler | DomBuilderEventHandlerWithOptions>>;
}

export type UIBuilderModel = UIBuilderContainer | UIBuilderAction | UIBuilderContent;

type UpdateProps<T> = Partial<Omit<T, 'type'>>;
interface UIBuilderReturnType<T extends UIBuilderModel> {
  render: ExtendedHTMLElement | string;
  update?: (props: UpdateProps<T>) => void;
}

export function UIBuilder<T extends UIBuilderModel> (props: T): UIBuilderReturnType<T> {
  switch (props.type) {
    case 'container':
      const containerComponent = new Card({
        classNames: props.classNames,
        children: (props.children ?? []).map(child => UIBuilder(child).render ?? ''),
        background: props.background ?? false,
        border: props.border ?? false,
        padding: props.padding ?? 'none'
      });

      return {
        render: containerComponent.render,
        update: (newPprops: UpdateProps<UIBuilderContainer>) => {
          containerComponent.update({
            ...(newPprops.classNames != null ? { classNames: newPprops.classNames } : {}),
            ...(newPprops.border != null ? { border: newPprops.border } : {}),
            ...(newPprops.padding != null ? { padding: newPprops.padding } : {}),
            ...(newPprops.background != null ? { background: newPprops.background } : {}),
            ...(newPprops.children != null ? { children: (props.children ?? []).map(child => UIBuilder(child).render ?? '') } : {}),
          });
        }
      };
    case 'content':
      const contentComponent = new ChatItemCardContent({
        classNames: props.classNames,
        children: (props.children ?? []).map(child => UIBuilder(child).render ?? ''),
        body: props.body,
        codeBlockActions: props.codeActions,
        codeReference: props.codeReference,
        renderAsStream: props.subType === 'streamable',
      });

      return {
        render: contentComponent.render,
        update: (newPprops: UpdateProps<UIBuilderContent>) => {
          contentComponent.update({
            ...(newPprops.classNames != null ? { classNames: newPprops.classNames } : {}),
            ...(newPprops.codeActions != null ? { codeBlockActions: newPprops.codeActions } : {}),
            ...(newPprops.codeReference != null ? { codeReference: newPprops.codeReference } : {}),
            ...(newPprops.subType != null ? { renderAsStream: newPprops.subType === 'streamable' } : {}),
            ...(newPprops.children != null ? { children: (props.children ?? []).map(child => UIBuilder(child).render ?? '') } : {}),
          });
        }
      };
    case 'action':
      const actionComponent = new Button({
        onClick: props.events.click,
        label: props.label,
        icon: props.icon != null ? (new Icon({ icon: props.icon }).render) : undefined,
        tooltip: props.tooltip,
        disabled: props.disabled,
        primary: props.primary ?? false,
        status: props.status
      });

      return {
        render: actionComponent.render,
        update: (newProps: UpdateProps<UIBuilderAction>) => {
          actionComponent.update({
            ...(newProps.label != null ? { label: newProps.label } : {}),
            ...(newProps.icon != null ? { icon: newProps.icon != null ? (new Icon({ icon: newProps.icon }).render) : undefined } : {}),
            ...(newProps.tooltip != null ? { tooltip: newProps.tooltip } : {}),
            ...(newProps.disabled != null ? { disabled: newProps.disabled } : {}),
            ...(newProps.primary != null ? { primary: newProps.primary ?? false } : {}),
            ...(newProps.status != null ? { status: newProps.status } : {}),
          });
        }
      };
    default:
      return {
        render: ''
      };
  }
}
