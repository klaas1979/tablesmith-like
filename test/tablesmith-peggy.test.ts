import * as peggy from 'peggy';
import fs from 'fs';

import TSTable from '../src/module/tstable';
import TSExpressionFactory from '../src/module/expressions/tsexpressionsfactory';

describe('Tablesmith Peggy parser#parse', () => {
  let parser: peggy.Parser;
  let options: { table: TSTable; expressionFactory: TSExpressionFactory };
  beforeAll(() => {
    const peggyGrammar = fs.readFileSync('src/module/tablesmith.pegjs', 'utf8');
    parser = peggy.generate(peggyGrammar);
  });

  beforeEach(() => {
    const table = new TSTable('name');
    options = { table: table, expressionFactory: new TSExpressionFactory() };
  });

  it('simple grammar with one Group and no functions', () => {
    parser.parse('# comment\n:Start\n1,One', options);
    expect(options.table.getGroups().length).toBe(1);
    expect(options.table.getGroups()[0].getRanges()[0].getLower()).toBe(1);
    expect(options.table.getGroups()[0].getRanges()[0].getUpper()).toBe(1);
    expect(options.table.getGroups()[0].getRanges()[0].getExpression()).toBe('One');
  });
});
