import { SyntaxHighlighter } from '../syntax-highlighter';

describe('syntax-highlighter', () => {
  it('render', () => {
    const testSyntaxHighlighter = new SyntaxHighlighter({
      codeStringWithMarkup: 'alert("hello");\n',
      language: 'js',
      keepHighlights: true,
      block: true,
    });

    expect(testSyntaxHighlighter.render.outerHTML.replace('\n', '')).toBe(
      '<div class="mynah-syntax-highlighter"><pre class="keep-markup language-clike"><span class="token function"></span><code><span class="token function">alert</span><span class="token punctuation">(</span><span class="token string">"hello"</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre><div class="mynah-syntax-highlighter-copy-buttons"></div></div>'
    );
  });

  it('should show buttons if showCopyButtons true and related events are connected', () => {
    const testSyntaxHighlighter = new SyntaxHighlighter({
      codeStringWithMarkup: 'alert("hello");\n',
      language: 'typescript',
      keepHighlights: true,
      codeBlockActions: {
        copy: {
          id: 'copy',
          label: 'Copy'
        },
        'insert-at-cursor': {
          id: 'insert-at-cursor',
          label: 'Insert at cursor'
        },
      },
      onCopiedToClipboard: () => {},
      onCodeBlockAction: () => {},
      block: true,
    });
    expect(testSyntaxHighlighter.render.querySelectorAll('button')?.length).toBe(2);
    expect(testSyntaxHighlighter.render.querySelectorAll('button')?.[0]?.textContent).toBe('Copy');
    expect(testSyntaxHighlighter.render.querySelectorAll('button')?.[1]?.textContent).toBe('Insert at cursor');
  });
});
