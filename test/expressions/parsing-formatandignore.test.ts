import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';
import { html2text } from '../../src/module/tablesmith/parser/html2text';

let filename: string;
let simpleTable: string;

describe('Parsing Html-Formatted tables', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'html';
  });

  it('<p>, </p> and <br/> result in a line break', () => {
    simpleTable = '<p>:Start<br />1,{Bold~One}</p>';
    const result = html2text.convert(simpleTable);
    expect(result).toBe('\n:Start\n1,{Bold~One}\n');
  });

  it('escaped char >', () => {
    expect(html2text.convert('&gt;')).toBe('>');
  });
  it('escaped char <', () => {
    expect(html2text.convert('&lt;')).toBe('<');
  });
  it('escaped char &', () => {
    expect(html2text.convert('&amp;')).toBe('&');
  });
  it('escaped char "', () => {
    expect(html2text.convert('&quot;')).toBe('"');
  });

  it("escaped char '", () => {
    expect(html2text.convert('&apos;')).toBe("'");
  });

  it('bold expression correct simple text', () => {
    simpleTable = '<p>:Start<br />1,{Bold~One}</p>';
    tablesmith.addTable(filename, simpleTable, 'html');
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });
});

describe('Parsing text ignore stff', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'text';
  });

  it('emtpyline with spaces and tab ignored', () => {
    simpleTable = '#stuff before\n  \t \n:Start\n  \t \n1,{Bold~One}';
    tablesmith.addTable(filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });
});
