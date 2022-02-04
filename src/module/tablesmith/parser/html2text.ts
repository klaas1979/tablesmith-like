import { parse, SyntaxError } from '../../../../build/parser/peggyhtml2text';

class Html2Text {
  convert(call: string): string {
    try {
      const result = parse(call);
      // replace nbsp char 160 to normal space
      return result.join('').replace(String.fromCharCode(160), ' ');
    } catch (error) {
      const se = error as SyntaxError;
      if (se.location) {
        const loc = se.location;
        const before = call.substring(Math.max(0, loc.start.offset - 100), loc.start.offset);
        const start = loc.start.offset;
        const end = loc.end.offset;
        let content = call.substring(start, end);
        if (end - start > 200) {
          content = call.substring(start, start + 100) + '||<||stripped||>||' + call.substring(end - 100, end);
        }
        const after = call.substring(loc.end.offset, Math.min(call.length, loc.end.offset + 100));
        const errorLocation = `Lines from ${loc.start.line} to ${loc.end.line}', columns from ${loc.start.column} to ${loc.end.column}, FileOffset from ${loc.start.offset} to ${loc.end.offset} \nText:>>>>\n${before}||>|${content}|<||${after}\n<<<<`;
        throw Error(`Error '${se}' at location '${errorLocation}'`);
      }
      throw error;
    }
  }
}

export const html2text = new Html2Text();
