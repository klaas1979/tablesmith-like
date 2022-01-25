import { parse } from '../../../../build/parser/peggyhtml2text';

class Html2Text {
  convert(call: string): string {
    const result = parse(call);
    // replace nbsp char 160 to normal space
    return result.join('').replace(String.fromCharCode(160), ' ');
  }
}

export const html2text = new Html2Text();
