import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { FilterOption } from '../../../static';
import testIds from '../../../helper/test-ids';
import { ChatItemFormItemsWrapper } from '../chat-item-form-items';

export interface PromptOptionsProps {
  classNames?: string[];
  filterOptions: FilterOption[];
  onFiltersChange?: (filterFormData: Record<string, any>, isValid: boolean) => void;
}

export class PromptOptions {
  render: ExtendedHTMLElement;
  private readonly props: PromptOptionsProps;
  private formItemsWrapper: ChatItemFormItemsWrapper;
  constructor (props: PromptOptionsProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.options,
      classNames: [ 'mynah-prompt-input-options', ...(this.props.classNames ?? []) ],
      children: this.getFilterOptionsWrapper()
    });
  }

  private readonly getFilterOptionsWrapper = (): Array<ExtendedHTMLElement | string> => {
    if (this.props.filterOptions?.length > 0) {
      this.formItemsWrapper = new ChatItemFormItemsWrapper({
        tabId: '',
        chatItem: {
          formItems: this.props.filterOptions
        },
        onFormChange: this.props.onFiltersChange
      });
      return [
        this.formItemsWrapper.render
      ];
    }
    return [ '' ];
  };

  public readonly update = (filterOptions: FilterOption[]): void => {
    this.props.filterOptions = filterOptions;
    this.render.update({
      children: this.getFilterOptionsWrapper()
    });
  };

  public readonly getOptionValues = (): Record<string, string> => {
    return this.formItemsWrapper?.getAllValues() ?? {};
  };
}
