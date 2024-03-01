# MynahUI Config

You can set the config from the constructor parameters while creating a new instance of `mynah-ui`.

_**Note:** You cannot set it on runtime. It is getting used just once during the initialization._

```typescript
...
interface ConfigModel {
    // Do not forget that you have to provide all of them
    // Config allows partial set of texts
    texts: {
        mainTitle?: string;
        feedbackFormTitle?: string;
        feedbackFormOptionsLabel?: string;
        feedbackFormCommentLabel?: string;
        feedbackThanks?: string;
        feedbackReportButtonLabel?: string;
        codeSuggestions?: string;
        files?: string;
        insertAtCursorLabel?: string;
        copy?: string;
        showMore?: string;
        save?: string;
        cancel?: string;
        submit?: string;
        pleaseSelect?: string;
        stopGenerating?: string;
        copyToClipboard?: string;
        noMoreTabsTooltip?: string;
        codeSuggestionWithReferenceTitle?: string;
        spinnerText?: string;
        tabCloseConfirmationMessage?: string;
        tabCloseConfirmationKeepButton?: string;
        tabCloseConfirmationCloseButton?: string;
    };
    // Options to show up on the overlay feedback form
    // after user clicks to downvote on a chat item
    // and clicks 'Report' again
    feedbackOptions: Array<{
        label: string;
        value: string;
    }>;
    maxUserInput: number; // max number of chars for the input field
    autoFocus: boolean; // auto focuses to input panel after every action
    maxTabs: number; // set 1 to hide tabs panel
    showPromptField: boolean; // shows prompt field (default: true)
}
...
```
---

<p><br/></p>

# `texts`
All static texts will be shown on UI. 
Please take a look at each image to identify which text blongs to which item on UI.

## mainTitle
Default tab title text if it is not set through store data for that tab.

<p align="center">
  <img src="./img/texts/mainTitle.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## feedbackFormTitle, feedbackFormOptionsLabel, feedbackFormCommentLabel, submit, cancel
<p align="center">
  <img src="./img/texts/feedbackForm.png" alt="feedbackForm" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>


---

## fileTreeTitle, rootFolderTitle, feedbackFormCommentLabel, submit, cancel
<p align="center">
  <img src="./img/texts/fileTreeTitle.png" alt="fileTree" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>


---

## pleaseSelect
<p align="center">
  <img src="./img/texts/pleaseSelect.png" alt="feedbackForm" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## feedbackThanks, feedbackReportButtonLabel, showMore
<p align="center">
  <img src="./img/texts/voteAndSourceActions.png" alt="voteAndSourceActions" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## stopGenerating
<p align="center">
  <img src="./img/texts/stopGenerating.png" alt="stopGenerating" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## insertAtCursorLabel, copy
<p align="center">
  <img src="./img/texts/copyInsertToCursor.png" alt="copyInsertToCursor" style="border-radius: 10px; max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## codeSuggestions, files, codeSuggestionWithReferenceTitle
<p align="center">
  <img src="./img/texts/codeFileSuggestions.png" alt="codeFileSuggestions" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## spinnerText
<p align="center">
  <img src="./img/texts/spinnerText.png" alt="spinnerText" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## tabCloseConfirmationMessage, tabCloseConfirmationKeepButton, tabCloseConfirmationCloseButton
<p align="center">
  <img src="./img/texts/tabCloseConfirmation.png" alt="tabCloseConfirmation" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## noMoreTabsTooltip
<p align="center">
  <img src="./img/texts/noMoreTabs.png" alt="noMoreTabsTooltip" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

<p><br/></p>

# `feedbackOptions`

Feedback type options to be shown on feedback form.
defaults:
```typescript
...
feedbackOptions: [
    {
      value: 'inaccurate-response',
      label: 'Inaccurate response',
    },
    {
      value: 'harmful-content',
      label: 'Harmful content'
    },
    {
      value: 'overlap',
      label: 'Overlaps with existing content'
    },
    {
      value: 'incorrect-syntax',
      label: 'Incorrect syntax'
    },
    {
      value: 'buggy-code',
      label: 'Buggy code'
    },
    {
      value: 'low-quality',
      label: 'Low quality'
    },
    {
      value: 'other',
      label: 'Other'
    }
  ],
...
```

<p align="center">
  <img src="./img/feedbackOptions.png" alt="feedbackOptions" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

<p><br/></p>

# `maxTabs`
Maximum number of tabs user/system can open in a single instance of `mynah-ui`.

default: `1000`

An important note here is that if you provide **`1`** to maxTabs, it will not show the tab bar at all. However you still need to add a tab then initially to show a content.

And finally, if you try to add tabs more than given `maxTabs` amount while initializing the MynahUI with [Constructor Properties](./PROPERTIES.md), it will only generate the tabs till it reaches the `maxTabs` limit.

_Assume that you've provided `1` for `maxTabs`._


<p align="center">
  <img src="./img/maxTabs1.png" alt="maxTabs1" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

<p><br/></p>

# `autoFocus`
Just auto focus to prompt input field after every response arrival or initialization.

default: `true`

---

<p><br/></p>

# `maxUserInput`
Max number of chars user can insert into the prompt field. But, as might know you can also add code attachments under the prompt field. A treshold of `96` chars will be automatically reduced from the `maxUserInput`.

**So beware that if you want 4000 chars exact, you need to give 4096 to the config.**

default: `4096`

---

<p><br/></p>

# `showPromptField`
Show or hide the prompt input field completely. You may want to hide the prompt field by setting `showPromptField` to `false` to make the chat work one way only. Just to provide answers or information.

default: `true`

_If you set `showPromptField` to `false`_

<p align="center">
  <img src="./img/noPrompt.png" alt="noPrompt" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>