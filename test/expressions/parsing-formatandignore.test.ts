import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';
import { html2text } from '../../src/module/tablesmith/parser/html2text';
import { TSTable } from '../../src/module/tablesmith/tstable';

let filename: string;
let simpleTable: string;

describe('Parsing Html-Formatted tables escaped chars', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'html';
  });

  it('<p>, </p> and <br/> result in a line break', () => {
    simpleTable = '<p>:Start<br />1,{Bold~One}</p>';
    const result = html2text.convert(simpleTable);
    expect(result).toBe(':Start\n1,{Bold~One}\n');
  });
  it('newline to space', () => {
    expect(html2text.convert('\n')).toBe('');
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
  it('br expression correct simple text', () => {
    simpleTable = '<p>:Start<br />1,{Bold~One}</p>';
    tablesmith.addTable('folder', filename, simpleTable, 'html');
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });
});

describe('Parsing html line breaks', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'html';
  });
  it('newline in html is deleted and needs no _', () => {
    simpleTable = '#stuff before<br/>:Start<br/>1,{Bold~One\n}';
    tablesmith.addTable('folder', filename, simpleTable, 'html');
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });
  it('Multi p and br become a single newline', () => {
    simpleTable = ':Start<br/><br/><br/>1,<p>{Bold~</p><br/><p>_One}</p>';
    tablesmith.addTable('folder', filename, simpleTable, 'html');
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });

  it('Multi Line html', () => {
    simpleTable = '<p> </p>\n<p>:Start</p>\n<p>1,One</p>\n<p>_1<br />_2</p>\n<p>_3</p>\n<p>2,two</p>';
    tablesmith.addTable('folder', filename, simpleTable, 'html');
    expect(tstables.getLastTSTable()?.groupForName('Start')?.firstRange()?.getExpression()).toBe('One123');
  });
});

describe('Parsing text ignore stuff', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'text';
  });

  it('empty line beginning', () => {
    simpleTable = '  \n  \n:Start\n1,One';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.addTable('folder', filename, simpleTable)).toBeInstanceOf(TSTable);
  });

  it('empty lines between comments', () => {
    simpleTable = '\n\n\n#comment\n\n\n:Start\n1,One';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.addTable('folder', filename, simpleTable)).toBeInstanceOf(TSTable);
  });

  it('empty lines between var declarations', () => {
    simpleTable = '\n\n\n%var1%,\n\n\n%var2%,\n\n\n:Start\n1,One';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.addTable('folder', filename, simpleTable)).toBeInstanceOf(TSTable);
  });

  it('empty lines between groups', () => {
    simpleTable = ':Start\n1,One\n\n\n:next\n1,One';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.addTable('folder', filename, simpleTable)).toBeInstanceOf(TSTable);
  });

  it('emtpyline with spaces and tab ignored', () => {
    simpleTable = '#stuff before\n  \t \n:Start\n#\tcomment\t\n1,{Bold~One}';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });
});
