import { getTablesmithApi, TABLESMITH_ID } from './foundry/helper';
import { Logger } from './foundry/logger';
import { libWrapper } from './foundry/shims/libwrappershim';

/**
 * Wrap the enrichHTML method of TextEditor to enhance it with links to Tablesmith calls.
 */
export function wrapEnrichHTML(): void {
  libWrapper.register(TABLESMITH_ID, 'TextEditor.enrichHTML', TSTextEditor.enrichHtmlWrapper, 'WRAPPER');
  addEventListener('click', async (event) => {
    const el = event.target;
    if (el) {
      // @ts-expect-error: Interface is missing the types
      if (el.nodeName === 'A' && el.classList.contains('entity-link') && el.dataset.type === 'Tablesmith') {
        Logger.debug(false, 'Clickint Tablesmith link', el);
        // @ts-expect-error: Interface is missing the types
        await getTablesmithApi().evaluateTable(el.dataset.call, { lenient: true, toDialog: true });
      }
    }
  });
}

/**
 * Generic options type to fix Github build error:
 * [10:16:56] Error: /home/runner/work/tablesmith-like/tablesmith-like/src/module/enrichhtml-wrapper.ts(41,18):
 * semantic error TS2339: Property 'async' does not exist on type 'Partial<EnrichOptions>'.
 */
type EnrichOptionsGeneric = {
  [key: string]: unknown;
};
class TSTextEditor extends TextEditor {
  static rgx = new RegExp(`@(Tablesmith|TS)\\[([^\\]]+)\\](?:{([^}]+)})?`, 'g');

  /**
   * Checks draw for Tablesmith results evaluates them and registers results for wrapped getChatText.
   * @param this instance of this.
   * @param wrapped the method that is wrapped, to call it.
   * @param options for call.
   * @returns result of draw.
   */
  static enrichHtmlWrapper(
    this: TextEditor,
    // eslint-disable-next-line @typescript-eslint/ban-types
    wrapped: (content: string, options?: Partial<EnrichOptionsGeneric>) => Promise<string> | string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    content: string,
    options?: Partial<EnrichOptionsGeneric>,
  ): Promise<string> | string {
    if (options?.async) {
      const enriched = wrapped(content, options) as Promise<string>;
      const asyncEnrichHTML = enriched.then(
        (enrichedString: string) => {
          return TSTextEditor.replaceTablesmithLinks(enrichedString);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reason: any) => reason,
      );
      return asyncEnrichHTML;
    } else {
      return TSTextEditor.replaceTablesmithLinks(wrapped(content, options) as string);
    }
  }

  static replaceTablesmithLinks(innerHTML: string): string {
    const html = document.createElement('div');
    html.innerHTML = innerHTML;
    const text = TextEditor._getTextNodes(html);
    // @ts-expect-error: Wrong type definition
    TextEditor._replaceTextContent(text, TSTextEditor.rgx, TSTextEditor.createTablesmithLink);
    return html.innerHTML;
  }

  static createTablesmithLink(...match: RegExpMatchArray): Node {
    Logger.debug(false, 'createTablesmithLink', match);
    const a = document.createElement('a');
    a.classList.add('entity-link', 'content-link');
    a.setAttribute('data-type', 'Tablesmith');
    a.setAttribute('data-call', match[2]);
    a.innerHTML = `<i class="fas fa-code"></i> ${match[3]}`;
    return a;
  }
}
