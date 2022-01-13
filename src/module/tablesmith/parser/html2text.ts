import { parse } from '../../../../build/parser/peggyhtml2text';

class Html2Text {
  convert(call: string): string {
    const result = parse(call);
    return result.join('');
  }
}

export const html2text = new Html2Text();
