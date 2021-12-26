import { roller } from '../../src/module/expressions/rollerinstance';

describe('Roller#roll', () => {
  let resultCount: Array<number>;
  let sides: number;
  beforeEach(() => {
    sides = 10;
    resultCount = [];
    for (let i = 0; i < sides; i++) {
      resultCount.push(0);
    }
  });

  it('simple text is returned as is', () => {
    for (let i = 0; i < 1000; i++) {
      const roll = roller.roll(sides).total;
      resultCount[roll - 1] = resultCount[roll - 1] + 1;
    }
    for (let i = 0; i < resultCount.length; i++) {
      expect(resultCount[i]).toBeGreaterThan(0);
    }
  });
});
