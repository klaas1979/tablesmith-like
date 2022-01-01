import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

// describe('Parsing {If~', () => {
//   beforeEach(() => {
//     tablesmith.reset();
//     filename = 'simpletable';
//   });

//   it('simple if evaluation', () => {
//     simpleTable = '\n:Start\n1,{If~1=1?true/false}\n';
//     tablesmith.addTable(filename, simpleTable);
//     expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
//   });
// });
