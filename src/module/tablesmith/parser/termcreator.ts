import TSExpression from '../expressions/tsexpression';

export type TermCreator = (a: TSExpression, b: TSExpression) => TSExpression;
