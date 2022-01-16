import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { TableParameter, TableParameterType } from '../../src/module/tablesmith/tstable';

let filename: string;
let simpleTable: string;

describe('Parsing Parameter', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parameter type PROMPT', () => {
    simpleTable = '%varname%,\n@varname,default-value,Prompt\n:Start\n1,%varname%\n';
    const table = tablesmith.addTable(filename, simpleTable);
    const parameter = new TableParameter('varname', 'default-value', 'Prompt', false, []);
    const result = table.getParameter('varname');
    expect(result).toEqual(parameter);
    expect(result?.type).toBe(TableParameterType.PROMPT);
  });

  it('parameter type LIST', () => {
    simpleTable = '%varname%,\n@varname,1,Prompt,1,2,3\n:Start\n1,%varname%\n';
    const table = tablesmith.addTable(filename, simpleTable);
    const parameter = new TableParameter('varname', '1', 'Prompt', false, ['1', '2', '3']);
    const result = table.getParameter('varname');
    expect(result).toEqual(parameter);
    expect(result?.type).toBe(TableParameterType.LIST);
  });

  it('parameter type MULTI_LIST', () => {
    simpleTable = '%varname%,\n@*varname,1,Prompt,1,2,3\n:Start\n1,%varname%\n';
    const table = tablesmith.addTable(filename, simpleTable);
    const parameter = new TableParameter('varname', '1', 'Prompt', true, ['1', '2', '3']);
    const result = table.getParameter('varname');
    expect(result).toEqual(parameter);
    expect(result?.type).toBe(TableParameterType.MULTI_LIST);
  });

  it('parameter type LIST default not integer error', () => {
    simpleTable = '%varname%,\n@varname,nonumber,Prompt,1,2,3\n:Start\n1,%varname%\n';
    expect(() => {
      tablesmith.addTable(filename, simpleTable);
    }).toThrowError();
  });

  it('parameter type LIST default 0, first param is numbered 1', () => {
    simpleTable = '%varname%,\n@varname,0,Prompt,1,2,3\n:Start\n1,%varname%\n';
    expect(() => {
      tablesmith.addTable(filename, simpleTable);
    }).toThrowError();
  });

  it('parameter type LIST default 4, max param 3', () => {
    simpleTable = '%varname%,\n@varname,4,Prompt,1,2,3\n:Start\n1,%varname%\n';
    expect(() => {
      tablesmith.addTable(filename, simpleTable);
    }).toThrowError();
  });
});
