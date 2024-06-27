import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahEventNames } from '../../../static';
import { FeedbackForm } from '../../feedback-form/feedback-form';

describe('feedback form', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submit', () => {
    const testFeedbackForm = new FeedbackForm({
      initPayload: {
        selectedOption: 'buggy-code',
        comment: 'test comment',
        messageId: 'test-message-id',
        tabId: 'test-tab-id',
      }
    });

    const spyDispatch = jest.spyOn(MynahUIGlobalEvents.getInstance(), 'dispatch');

    // Actually render the portal
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SHOW_FEEDBACK_FORM, {
      messageId: 'test-message-id',
      tabId: 'test-tab-id',
    });

    const submitButtonElement = testFeedbackForm.feedbackFormContainer.querySelectorAll('button')[2];
    expect(submitButtonElement.textContent?.trim()).toBe('Submit');
    submitButtonElement.click();
    expect(spyDispatch).toHaveBeenCalledTimes(2);
    expect(spyDispatch).toHaveBeenNthCalledWith(1, MynahEventNames.SHOW_FEEDBACK_FORM, {
      messageId: 'test-message-id',
      tabId: 'test-tab-id',
    });
    expect(spyDispatch).toHaveBeenNthCalledWith(2, MynahEventNames.FEEDBACK_SET, {
      comment: 'test comment',
      messageId: 'test-message-id',
      selectedOption: 'buggy-code',
      tabId: 'test-tab-id',
    });
  });

  it('cancel', () => {
    const testFeedbackForm = new FeedbackForm({
      initPayload: {
        selectedOption: 'buggy-code',
        comment: 'test comment',
        messageId: 'test-message-id',
        tabId: 'test-tab-id',
      }
    });

    const spyDispatch = jest.spyOn(MynahUIGlobalEvents.getInstance(), 'dispatch');

    // Actually render the portal
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SHOW_FEEDBACK_FORM, {
      messageId: 'test-message-id',
      tabId: 'test-tab-id',
    });

    const cancelButtonElement = testFeedbackForm.feedbackFormContainer.querySelectorAll('button')[1];
    expect(cancelButtonElement.textContent?.trim()).toBe('Cancel');
    cancelButtonElement.click();
    expect(spyDispatch).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenNthCalledWith(1, MynahEventNames.SHOW_FEEDBACK_FORM, {
      messageId: 'test-message-id',
      tabId: 'test-tab-id',
    });
  });
});
