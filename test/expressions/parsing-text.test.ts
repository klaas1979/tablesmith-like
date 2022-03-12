import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

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
