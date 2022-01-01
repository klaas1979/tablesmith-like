import * as peggy from 'peggy';
import fs from 'fs';
import TSTable from '../src/module/tstable';
import TSParserFactory from '../src/module/parser/tsparserfactory';

describe('Tablesmith Peggy parser#parse', () => {
  let parser: peggy.Parser;
  let table: TSTable;
  let options: { pf: TSParserFactory };
  beforeAll(() => {
    const peggyGrammar = fs.readFileSync('src/module/parser/tablesmith.pegjs', 'utf8');
    parser = peggy.generate(peggyGrammar);
  });

  beforeEach(() => {
    table = new TSTable('name');
    options = { pf: new TSParserFactory(table) };
  });

  it('simple grammar with one Group and no functions', () => {
    parser.parse('# comment\n:Start\n1,One', options);
    expect(table.getGroups().length).toBe(1);
    expect(table.getGroups()[0].getRanges()[0].getLower()).toBe(1);
    expect(table.getGroups()[0].getRanges()[0].getUpper()).toBe(1);
    expect(table.getGroups()[0].getRanges()[0].getExpression()).toBe('One');
  });
});
