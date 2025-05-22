import { DomBuilder, ExtendedHTMLElement } from '../../../../helper/dom';
import { StyleLoader } from '../../../../helper/style-loader';
import { CheckboxFormItemGroup } from '../../../../static';
import { ChatItemFormItemsWrapper } from '../../chat-item-form-items';

export interface CheckboxListWrapperProps {
  checkboxGroup: CheckboxFormItemGroup;
}

export interface CheckboxGroupWrapperProps {
  checkboxGroups: CheckboxFormItemGroup[];
}

export class CheckboxGroupWrapper {
  private readonly props: CheckboxGroupWrapperProps;

  render: ExtendedHTMLElement;

  constructor (props: CheckboxGroupWrapperProps) {
    this.props = props;
    StyleLoader.getInstance().load('components/form-items/_checkbox-list.scss');

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-detailed-list' ],
      children: props.checkboxGroups.map((item) => new CheckboxListWrapper({ checkboxGroup: item }).render)
    });
  }
}

export class CheckboxListWrapper {
  private readonly props: CheckboxListWrapperProps;
  values: Record<string, boolean>;
  render: ExtendedHTMLElement;
  parentCheckbox: ChatItemFormItemsWrapper; // might not need this and below
  childrenCheckboxes: ChatItemFormItemsWrapper;

  constructor (props: CheckboxListWrapperProps) {
    this.props = props;
    // StyleLoader.getInstance().load('components/form-items/_checkbox-list.scss');

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'nested-checkbox-list' ],
      children: [ this.renderParent(), this.renderChildren() ]
    });
  }

  renderParent (): ExtendedHTMLElement | string {
    if (this.props.checkboxGroup.groupName != null) {
      this.parentCheckbox = new ChatItemFormItemsWrapper({
        tabId: '',
        onFormChange: (formData) => {
          // Update all children to match parent's state
          if (this.props.checkboxGroup.groupName != null) {
            const newValue = formData[this.props.checkboxGroup.groupName?.id];
            this.props.checkboxGroup.groupName.indeterminate = false;
            // to do: think more about relationship between indeterminate and true/false
            this.props.checkboxGroup.groupName.value = newValue;
            this.props.checkboxGroup.items = this.props.checkboxGroup.items.map((item) => ({ ...item, value: newValue }));
            this.update();
          }
        },
        chatItem:
        { formItems: [ this.props.checkboxGroup.groupName ] }
      });

      return DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'nested-checkbox-list-parent' ],
        children: [ this.parentCheckbox.render ]
      });
    }
    return '';
  }

  renderChildren (): ExtendedHTMLElement {
    this.childrenCheckboxes = new ChatItemFormItemsWrapper({
      tabId: '',
      onFormChange: (formData) => {
        this.props.checkboxGroup.items = this.props.checkboxGroup.items.map((item) => ({ ...item, value: formData[item.id] }));
        // update parent to match children
        if (this.props.checkboxGroup.groupName != null) {
          if (this.props.checkboxGroup.items.every(({ value }) => value === 'true')) {
            this.props.checkboxGroup.groupName.indeterminate = false;
            this.props.checkboxGroup.groupName.value = 'true';
          } else if (this.props.checkboxGroup.items.every(({ value }) => value === 'false')) {
            this.props.checkboxGroup.groupName.indeterminate = false;
            this.props.checkboxGroup.groupName.value = 'false';
          } else {
            this.props.checkboxGroup.groupName.indeterminate = true;
            this.props.checkboxGroup.groupName.value = 'true'; // make sure server ignores parent's value. server shouldnt even send/receive value for parent
          }
        }
        this.update();
      },
      chatItem:
        { formItems: this.props.checkboxGroup.items }
    });

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'nested-checkbox-list-children' ],
      children: [ this.childrenCheckboxes.render ]
    });
  }

  update (props?: CheckboxListWrapperProps): void {
    if (props != null) { this.props.checkboxGroup = props.checkboxGroup; }
    this.render.update({ children: [ this.renderParent(), this.renderChildren() ] });
  }
}
