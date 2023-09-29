import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { SuggestionCard } from './suggestion-card';

export class SuggestionSkeleton {
  readonly render: ExtendedHTMLElement;

  constructor () {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-skeleton-wrapper' ],
      persistent: true,
      children: [
        new SuggestionCard({
          suggestion: {
            title: 'Lorem ipsum dolor sit',
            url: '#mynahisawesome.com/mynah',
            body: `<p>Lorem ipsum dolor sit amet</p>
                            <p>Nunc sit amet nulla sit amet est rhoncus ornare. In sodales tristique finibus.</p>
                            <pre><code>lorem sit amet</code></pre>`,
          },
        }).render.addClass('mynah-card-skeleton'),
        new SuggestionCard({
          suggestion: {
            title: 'Lorem ipsum dolor sit',
            url: '#mynahismorenadmoreawesome.com/mynah',
            body: `<p>Lorem ipsum dolor sit amet</p>
                            <pre><code>sit amet
                            loremasdasdsadasdasdasd
                            asd</code></pre>`,
          },
        }).render.addClass('mynah-card-skeleton'),
      ],
    });
  }
}