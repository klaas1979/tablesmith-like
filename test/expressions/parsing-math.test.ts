import EvaluationContext from '../../src/module/tablesmith/expressions/evaluationcontext';
import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;
let evalcontext: EvaluationContext;

describe('Parsing {Calc~} and {Dice~} allowed parts', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    evalcontext = new EvaluationContext();
  });

  it('~[num]d[num] group call as Term', () => {
    simpleTable = ':Start\n1,{Dice~[num]d[num]}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~[num]d[num]}');
  });
});

describe('Parsing {Dice~} binding order', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  [
    ['{Calc~1}', '1'],
    ['{Calc~1+2}', '3'],
    ['{Calc~2-1}', '1'],
    ['{Calc~1+2-3}', '0'],
    ['{Calc~2*3}', '6'],
    ['{Calc~6/3}', '2'],
    ['{Calc~9/3*2/6}', '1'],
    ['{Calc~6d1}', '6'],
    ['{Calc~2*3-4}', '2'],
    ['{Calc~1+2*3-4}', '3'],
    ['{Dice~1+4/2-3}', '0'],
    ['{Dice~1+4d1-3}', '2'],
    ['{Dice~10*10d1/10}', '10'],
    ['{Dice~(10-9)*2}', '2'],
    ['{Dice~(10-9)*(2+1)}', '3'],
    ['{Dice~(10-9)d(3-2)}', '1'],
  ].forEach((tuple) => {
    it(`${tuple[0]} = ${tuple[1]}`, async () => {
      const term = tuple[0];
      const result = tuple[1];
      simpleTable = `:Start\n1,${term}\n`;
      tablesmith.addTable('folder', filename, simpleTable);
      const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
      expect(expression).toBe(term);
      expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe(result);
    });
  });
});

describe('Parsing {Dice~} and {Calc~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('uppercase 1D4', () => {
    simpleTable = ':Start\n1,{Dice~1D4}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1d4}');
  });

  ['3d6+3', '1d4+3d6+4d8', '((5+5)/10)d(10-9)'].forEach((term) => {
    [`{Calc~${term}}`, `{Dice~${term}}`].forEach((tsCall) => {
      // eslint-disable-next-line jest/valid-title
      it(tsCall, async () => {
        simpleTable = `:Start\n1,${tsCall}\n`;
        tablesmith.addTable('folder', filename, simpleTable);
        const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
        expect(expression).toBe(tsCall);
        expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBeTruthy();
      });
    });
  });
});

describe('Parsing nested Math in Dice~ or Calc~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('{Dice~{Dice~3d1}d{Dice~1d1}}', async () => {
    simpleTable = ':Start\n1,{Dice~{Dice~3d1}d{Dice~1d1}}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const term = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(term).toBe('{Dice~{Dice~3d1}d{Dice~1d1}}');
    const total = await tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.evaluate(evalcontext);
    expect(total?.asString()).toBe('3');
  });

  it('with whitespaces and linebreaks', async () => {
    simpleTable = ':Start\n1,{  Dice~\n_{\n_Dice~\n_3d1   } d\n_{Dice~\n_1\n_d1}\n_}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const term = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(term).toBe('{Dice~{Dice~3d1}d{Dice~1d1}}');
    const total = await tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.evaluate(evalcontext);
    expect(total?.asString()).toBe('3');
  });
});

describe('Abs~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct abs expression', () => {
    simpleTable = ':Start\n1,{Abs~-10}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Abs~-10}');
  });

  it('negative integer', async () => {
    simpleTable = ':Start\n1,{Abs~-10}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10');
  });

  it('positive integer', async () => {
    simpleTable = ':Start\n1,{Abs~10}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10');
  });

  it('negative float', async () => {
    simpleTable = ':Start\n1,{Abs~-10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10.101');
  });

  it('positive float', async () => {
    simpleTable = ':Start\n1,{Abs~10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10.101');
  });
});

describe('Ceil~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct abs expression', () => {
    simpleTable = ':Start\n1,{Ceil~1.5}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Ceil~1.5}');
  });

  it('negative integer', async () => {
    simpleTable = ':Start\n1,{Ceil~-1}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-1');
  });

  it('positive integer', async () => {
    simpleTable = ':Start\n1,{Ceil~10}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10');
  });

  it('negative float', async () => {
    simpleTable = ':Start\n1,{Ceil~-10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-10');
  });

  it('positive float', async () => {
    simpleTable = ':Start\n1,{Ceil~10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('11');
  });
});

describe('Floor~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct abs expression', () => {
    simpleTable = ':Start\n1,{Floor~1.5}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Floor~1.5}');
  });

  it('negative integer', async () => {
    simpleTable = ':Start\n1,{Floor~-1}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-1');
  });

  it('positive integer', async () => {
    simpleTable = ':Start\n1,{Floor~10}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10');
  });

  it('negative float', async () => {
    simpleTable = ':Start\n1,{Floor~-10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-11');
  });

  it('positive float', async () => {
    simpleTable = ':Start\n1,{Floor~10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10');
  });
});

describe('Trunc~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct trunc expression', () => {
    simpleTable = ':Start\n1,{Trunc~1.5}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Trunc~1.5}');
  });

  it('negative float', async () => {
    simpleTable = ':Start\n1,{Trunc~-10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-10');
  });

  it('positive float', async () => {
    simpleTable = ':Start\n1,{Trunc~10.101}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('10');
  });
});

describe('Sqrt~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct trunc expression', () => {
    simpleTable = ':Start\n1,{Sqrt~9}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Sqrt~9}');
  });

  it('integer', async () => {
    simpleTable = ':Start\n1,{Sqrt~9}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('3');
  });
});

describe('Round~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct round expression', () => {
    simpleTable = ':Start\n1,{Round~2,2.1234}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Round~2,2.1234}');
  });

  it('zero places and rounding up', async () => {
    simpleTable = ':Start\n1,{Round~0,2.923456}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('3');
  });

  it('3 places and rounding down', async () => {
    simpleTable = ':Start\n1,{Round~3,2.123456}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('2.123');
  });
});

describe('Min~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct min expression', () => {
    simpleTable = ':Start\n1,{Min~2,2.1234}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Min~2,2.1234}');
  });

  it('first smaller returns', async () => {
    simpleTable = ':Start\n1,{Min~0,2.923456}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('second smaller returns', async () => {
    simpleTable = ':Start\n1,{Min~3,2.123456}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('2.123456');
  });

  it('can have 2+ arguments', async () => {
    simpleTable = ':Start\n1,{Min~3,2.123456,1,0,1.5,2.3,100}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });
});

describe('Max~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct max expression', () => {
    simpleTable = ':Start\n1,{Max~2,2.1234}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Max~2,2.1234}');
  });

  it('second bigger returns', async () => {
    simpleTable = ':Start\n1,{Max~0,2.923456}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('2.923456');
  });

  it('first bigger returns', async () => {
    simpleTable = ':Start\n1,{Max~3,2.123456}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('3');
  });

  it('can have 2+ arguments', async () => {
    simpleTable = ':Start\n1,{Max~3,2.123456,1,0,1.5,2.3,100}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('100');
  });
});

describe('Mod~ (modulo or remainder)', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct max expression', () => {
    simpleTable = ':Start\n1,{Mod~3,2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Mod~3,2}');
  });

  it('3 / 2 remainder = 1', async () => {
    simpleTable = ':Start\n1,{Mod~3,2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('2 / 2 remainder = 0', async () => {
    simpleTable = ':Start\n1,{Mod~2,2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });
});

describe('Power~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct power expression', () => {
    simpleTable = ':Start\n1,{Power~2^4}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = tstables.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Power~2^4}');
  });

  it('2 power 4 with comma as separator', async () => {
    simpleTable = ':Start\n1,{Power~2,4}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('16');
  });

  it('2 power 4 with power "^" as separator', async () => {
    simpleTable = ':Start\n1,{Power~2^4}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('16');
  });
});
