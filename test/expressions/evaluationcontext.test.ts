import EvaluationContext from '../../src/module/tablesmith/expressions/evaluationcontext';

describe('Evalcontext#roll', () => {
  let resultCount: Array<number>;
  let sides: number;
  let evalcontext: EvaluationContext;
  beforeEach(() => {
    sides = 10;
    resultCount = [];
    for (let i = 0; i < sides; i++) {
      resultCount.push(0);
    }
    evalcontext = new EvaluationContext();
  });

  it('simple text is returned as is', () => {
    for (let i = 0; i < 1000; i++) {
      const roll = evalcontext.roll(sides);
      resultCount[roll - 1] = resultCount[roll - 1] + 1;
    }
    for (let i = 0; i < resultCount.length; i++) {
      expect(resultCount[i]).toBeGreaterThan(0);
    }
  });
});
