import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {Dice~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('3d6+3 roll with modifier', () => {
    simpleTable = ':Start\n1,{Dice~3d6+3}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~3d6+3}');
  });

  it('1d4+3d6+4d8 chained rolls', () => {
    simpleTable = ':Start\n1,{Dice~1d4+3d6+4d8}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1d4+3d6+4d8}');
  });

  it('1+2 addition', () => {
    simpleTable = ':Start\n1,{Dice~1+2}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1+2}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('2-1 subtraction', () => {
    simpleTable = ':Start\n1,{Dice~2-1}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~2-1}');
    expect(tablesmith.evaluate(`[${filename}.]`)).toBe('1');
  });

  it('3*6 multiplication', () => {
    simpleTable = ':Start\n1,{Dice~3*6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~3*6}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('18');
  });

  it('18/6 division', () => {
    simpleTable = ':Start\n1,{Dice~18/6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~18/6}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':Start\n1,{Dice~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~((5+5)/10)d(10-9)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});

describe('Parsing {Calc~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('((5+5)/10) brackets', () => {
    simpleTable = ':Start\n1,{Calc~((5+5)/10)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Calc~((5+5)/10)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':Start\n1,{Calc~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Calc~((5+5)/10)d(10-9)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});

describe('Parsing nested Math in Dice~ or Calc~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('{Dice~{Dice~3d1}d{Dice~1d1}}', () => {
    simpleTable = ':Start\n1,{Dice~{Dice~3d1}d{Dice~1d1}}\n';
    tablesmith.addTable(filename, simpleTable);
    const term = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(term).toBe('{Dice~{Dice~3d1}d{Dice~1d1}}');
    const total = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.evaluate();
    expect(total).toBe('3');
  });

  it('with whitespaces and linebreaks', () => {
    simpleTable = ':Start\n1,{  Dice~\n_{\n_Dice~\n_3d1   } d\n_{Dice~\n_1\n_d1}\n_}\n';
    tablesmith.addTable(filename, simpleTable);
    const term = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(term).toBe('{Dice~{Dice~3d1}d{Dice~1d1}}');
    const total = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.evaluate();
    expect(total).toBe('3');
  });
});

describe('Abs~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct abs expression', () => {
    simpleTable = ':Start\n1,{Abs~-10}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Abs~-10}');
  });

  it('negative integer', () => {
    simpleTable = ':Start\n1,{Abs~-10}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10');
  });

  it('positive integer', () => {
    simpleTable = ':Start\n1,{Abs~10}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10');
  });

  it('negative float', () => {
    simpleTable = ':Start\n1,{Abs~-10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10.101');
  });

  it('positive float', () => {
    simpleTable = ':Start\n1,{Abs~10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10.101');
  });
});

describe('Ceil~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct abs expression', () => {
    simpleTable = ':Start\n1,{Ceil~1.5}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Ceil~1.5}');
  });

  it('negative integer', () => {
    simpleTable = ':Start\n1,{Ceil~-1}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-1');
  });

  it('positive integer', () => {
    simpleTable = ':Start\n1,{Ceil~10}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10');
  });

  it('negative float', () => {
    simpleTable = ':Start\n1,{Ceil~-10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-10');
  });

  it('positive float', () => {
    simpleTable = ':Start\n1,{Ceil~10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('11');
  });
});

describe('Floor~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct abs expression', () => {
    simpleTable = ':Start\n1,{Floor~1.5}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Floor~1.5}');
  });

  it('negative integer', () => {
    simpleTable = ':Start\n1,{Floor~-1}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-1');
  });

  it('positive integer', () => {
    simpleTable = ':Start\n1,{Floor~10}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10');
  });

  it('negative float', () => {
    simpleTable = ':Start\n1,{Floor~-10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-11');
  });

  it('positive float', () => {
    simpleTable = ':Start\n1,{Floor~10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10');
  });
});

describe('Trunc~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct trunc expression', () => {
    simpleTable = ':Start\n1,{Trunc~1.5}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Trunc~1.5}');
  });

  it('negative float', () => {
    simpleTable = ':Start\n1,{Trunc~-10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-10');
  });

  it('positive float', () => {
    simpleTable = ':Start\n1,{Trunc~10.101}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('10');
  });
});

describe('Sqrt~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct trunc expression', () => {
    simpleTable = ':Start\n1,{Sqrt~9}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Sqrt~9}');
  });

  it('integer', () => {
    simpleTable = ':Start\n1,{Sqrt~9}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });
});

describe('Round~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct round expression', () => {
    simpleTable = ':Start\n1,{Round~2,2.1234}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Round~2,2.1234}');
  });

  it('zero places and rounding up', () => {
    simpleTable = ':Start\n1,{Round~0,2.923456}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('3 places and rounding down', () => {
    simpleTable = ':Start\n1,{Round~3,2.123456}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('2.123');
  });
});

describe('Min~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct min expression', () => {
    simpleTable = ':Start\n1,{Min~2,2.1234}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Min~2,2.1234}');
  });

  it('first smaller returns', () => {
    simpleTable = ':Start\n1,{Min~0,2.923456}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });

  it('second smaller returns', () => {
    simpleTable = ':Start\n1,{Min~3,2.123456}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('2.123456');
  });
});

describe('Max~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct max expression', () => {
    simpleTable = ':Start\n1,{Max~2,2.1234}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Max~2,2.1234}');
  });

  it('second bigger returns', () => {
    simpleTable = ':Start\n1,{Max~0,2.923456}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('2.923456');
  });

  it('first bigger returns', () => {
    simpleTable = ':Start\n1,{Max~3,2.123456}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });
});

describe('Mod~ (modulo or remainder)', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct max expression', () => {
    simpleTable = ':Start\n1,{Mod~3,2}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Mod~3,2}');
  });

  it('3 / 2 remainder = 1', () => {
    simpleTable = ':Start\n1,{Mod~3,2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('2 / 2 remainder = 0', () => {
    simpleTable = ':Start\n1,{Mod~2,2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });
});

describe('Power~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('correct power expression', () => {
    simpleTable = ':Start\n1,{Power~2^4}\n';
    tablesmith.addTable(filename, simpleTable);
    const expression = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(expression).toBe('{Power~2^4}');
  });

  it('2 power 4 with comma as separator', () => {
    simpleTable = ':Start\n1,{Power~2,4}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('16');
  });

  it('2 power 4 with power "^" as separator', () => {
    simpleTable = ':Start\n1,{Power~2^4}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('16');
  });
});
