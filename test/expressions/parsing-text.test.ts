import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('_ line breaks', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('line break not printed', async () => {
    simpleTable = ':Start\n1,1\n_2';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('12');
  });

  it('line break trailing spaces not trimmed', async () => {
    simpleTable = ':Start\n1,1  \n_2';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('1  2');
  });

  it('no spaces around group calls', async () => {
    simpleTable = ':Start\n1,[A][B]\n:A\n1,A\n:B\n1,B';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('AB');
  });

  it('comment above line break', async () => {
    simpleTable = ':Start\n1,1\n# comment\n_2';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('12');
  });
});

describe('{Find~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Find~2,One,12345One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Find~2,One,12345One}',
    );
  });

  it('finds first match', async () => {
    simpleTable = ':Start\n1,{Find~2,One,12345One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('6');
  });
  it('start is first char to check', async () => {
    simpleTable = ':Start\n1,{Find~6,One,12345OneOne}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('6');
  });

  it('uses start', async () => {
    simpleTable = ':Start\n1,{Find~7,One,12345OneOne}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('9');
  });

  it('not found 0', async () => {
    simpleTable = ':Start\n1,{Find~10,One,12345OneOne}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('0');
  });
});

describe('{Replace~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Replace~a,@,textatext}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Replace~a,@,textatext}',
    );
  });

  it('replaces matches', async () => {
    simpleTable = ':Start\n1,{Replace~aa,@@,text aa aa text}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('text @@ @@ text');
  });
  it('no match, nothing changes', async () => {
    simpleTable = ':Start\n1,{Replace~bb,@@,text aa aa text}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('text aa aa text');
  });
});

describe('{CommaReplace~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{CommaReplace~0,@,1,2,3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{CommaReplace~0,@,1,2,3}',
    );
  });

  it('replaces comma for type=0', async () => {
    simpleTable = ':Start\n1,{CommaReplace~0,@,1,2,3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('1@2@3');
  });

  it('replaces text to comma for type=1', async () => {
    simpleTable = ':Start\n1,{CommaReplace~1,@,1@2@3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('1,2,3');
  });

  it('no match, nothing changes', async () => {
    simpleTable = ':Start\n1,{CommaReplace~0,@,123}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('123');
  });

  it('unknown type results in error', async () => {
    simpleTable = ':Start\n1,{CommaReplace~2,@,123}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).getErrorMessage();
    expect(result).toContain('Error: ');
  });
});

describe('{Trim~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Trim~    textatext    }\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Trim~textatext    }');
  });

  it('trims', async () => {
    simpleTable = ':Start\n1,{Trim~    textatext    }\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('textatext');
  });
});

describe('{Cap~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Cap~the fox}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Cap~the fox}');
  });

  it('lets numbers as is', async () => {
    simpleTable = ':Start\n1,{Cap~12. foxes}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('12. foxes');
  });

  it('caps first', async () => {
    simpleTable = ':Start\n1,{Cap~the fox}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('The fox');
  });
});

describe('{CapEachWord~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{CapEachWord~the fox}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{CapEachWord~the fox}',
    );
  });

  it('lets numbers as is', async () => {
    simpleTable = ':Start\n1,{CapEachWord~12. foxes}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('12. Foxes');
  });

  it('caps first', async () => {
    simpleTable = ':Start\n1,{CapEachWord~the fox}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('The Fox');
  });
});

describe('{LCase~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{LCase~All Will be LOWER}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{LCase~All Will be LOWER}',
    );
  });

  it('all to lower', async () => {
    simpleTable = ':Start\n1,{LCase~All Will be LOWER}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('all will be lower');
  });
});

describe('{UCase~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{UCase~All Will be UPPER}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{UCase~All Will be UPPER}',
    );
  });

  it('all to lower', async () => {
    simpleTable = ':Start\n1,{UCase~All Will be UPPER}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('ALL WILL BE UPPER');
  });
});

describe('{VowelStart~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{VowelStart~All}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{VowelStart~All}');
  });

  ['a', 'A', 'e', 'E', 'I', 'I', 'o', 'O', 'u', 'U'].forEach((vowel) => {
    it(`vowel '${vowel}'`, async () => {
      simpleTable = `:Start\n1,{VowelStart~${vowel}}\n`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
      expect(result).toBe('1');
    });
  });
  it('non vowel', async () => {
    simpleTable = ':Start\n1,{VowelStart~B}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('0');
  });
});

describe('{AorAn~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{AorAn~Fox}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{AorAn~Fox}');
  });

  ['a', 'A', 'e', 'E', 'I', 'I', 'o', 'O', 'u', 'U'].forEach((vowel) => {
    it(`vowel '${vowel}'`, async () => {
      simpleTable = `:Start\n1,{AorAn~${vowel}}\n`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
      expect(result).toBe(`an ${vowel}`);
    });
  });
  it('non vowel', async () => {
    simpleTable = ':Start\n1,{AorAn~B}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('a B');
  });
});

describe('{Length~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Length~123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Length~123456789}');
  });

  it('returns length', async () => {
    simpleTable = ':Start\n1,{Length~123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('9');
  });
});

describe('{Left~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Left~5,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Left~5,123456789}');
  });

  it('0 chars empty string', async () => {
    simpleTable = ':Start\n1,{Left~0,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('');
  });

  it('returns leftmost', async () => {
    simpleTable = ':Start\n1,{Left~5,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('12345');
  });
});

describe('{Char~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Char~5,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Char~5,123456789}');
  });

  it('index 0 empty string', async () => {
    simpleTable = ':Start\n1,{Char~0,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('');
  });

  it('last index', async () => {
    simpleTable = ':Start\n1,{Char~9,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('9');
  });

  it('index above length error', async () => {
    simpleTable = ':Start\n1,{Char~10,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).getErrorMessage();
    expect(result).toContain('Error: ');
  });

  it('char at index', async () => {
    simpleTable = ':Start\n1,{Char~5,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('5');
  });
});

describe('{Right~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Right~5,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Right~5,123456789}');
  });

  it('0 chars empty string', async () => {
    simpleTable = ':Start\n1,{Right~0,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('');
  });

  it('-1 error', async () => {
    simpleTable = ':Start\n1,{Right~-1,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).getErrorMessage();
    expect(result).toContain('Error: ');
  });

  it('longer than string error', async () => {
    simpleTable = ':Start\n1,{Right~10,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).getErrorMessage();
    expect(result).toContain('Error: ');
  });

  it('returns rightmost chars', async () => {
    simpleTable = ':Start\n1,{Right~5,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('56789');
  });
});

describe('{Mid~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Mid~3,2,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Mid~3,2,123456789}');
  });

  it('0 chars empty string', async () => {
    simpleTable = ':Start\n1,{Mid~0,3,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('');
  });

  it('-1 error', async () => {
    simpleTable = ':Start\n1,{Mid~-1,3,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).getErrorMessage();
    expect(result).toContain('Error: ');
  });

  it('longer than string error', async () => {
    simpleTable = ':Start\n1,{Mid~7,4,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).getErrorMessage();
    expect(result).toContain('Error: ');
  });

  it('right edge', async () => {
    simpleTable = ':Start\n1,{Mid~2,8,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('89');
  });

  it('left edge', async () => {
    simpleTable = ':Start\n1,{Mid~2,1,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('12');
  });

  it('mid chars', async () => {
    simpleTable = ':Start\n1,{Mid~3,3,123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('345');
  });
});

describe('{Split~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = '%vs%,1,2,3\n%v1%,\n%v2%,\n%v3%,\n:Start\n1,{Split~vs,",",v1,v2,v3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Split~vs,",",v1,v2,v3}',
    );
  });

  it('quotation can be used before and after', async () => {
    simpleTable = '%vs%,1,2,3\n%v1%,\n%v2%,\n%v3%,\n:Start\n1,"{Split~vs,",",v1,v2,v3}%v3% %v2% %v1%"\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('"3 2 1"');
  });

  it('splits into vars', async () => {
    simpleTable = '%vs%,1,2,3\n%v1%,\n%v2%,\n%v3%,\n:Start\n1,{Split~vs,",",v1,v2,v3}%v3% %v2% %v1%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('3 2 1');
  });

  it('splits into vars, missing values not set', async () => {
    simpleTable =
      '%vs%,1,2,3\n%v1%,\n%v2%,\n%v3%,\n%v4%,missing\n:Start\n1,{Split~vs,",",v1,v2,v3}%v4% %v3% %v2% %v1%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('missing 3 2 1');
  });

  it('splits into vars, missing vars tail ommitted', async () => {
    simpleTable = '%vs%,1,2,3\n%v1%,\n%v2%,\n:Start\n1,{Split~vs,",",v1,v2}%v2% %v1%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('2 1');
  });
});
