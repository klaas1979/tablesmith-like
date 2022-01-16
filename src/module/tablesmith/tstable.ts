import { evalcontext } from './expressions/evaluationcontextinstance';
import TSGroup from './tsgroup';

export const enum TableParameterType {
  PROMPT,
  LIST,
  MULTI_LIST,
}
/**
 * Parameter for Tables, containing all relevant data.
 */
export class TableParameter {
  variable: string;
  type: TableParameterType;
  prompt: string;
  defaultValue: string;
  constructor(variable: string, defaultValue: string, prompt: string, multiList: boolean, options: string[]) {
    this.variable = variable;
    if (options.length == 0) {
      this.type = TableParameterType.PROMPT;
    } else if (multiList) {
      this.type = TableParameterType.MULTI_LIST;
    } else {
      this.type = TableParameterType.LIST;
    }
    if (this.type != TableParameterType.PROMPT) {
      const defaultNumber = Number.parseInt(defaultValue);
      if (Number.isNaN(defaultNumber) || defaultNumber < 1 || defaultNumber > options.length)
        throw `Default value '${defaultValue}' must be integer for (multi-)list Parameter between 1 and ${options.length}`;
    }
    this.defaultValue = defaultValue;
    this.prompt = prompt;
  }
}

/**
 * A single table or tablesmith file, tables can contain many groups to be rolled upon.
 */
export class TSTable {
  groups: TSGroup[];
  name: string;
  variables: { name: string; value: string | undefined }[];
  parameters: TableParameter[];

  constructor(name: string) {
    this.groups = [];
    this.name = name;
    this.variables = [];
    this.parameters = [];
  }

  /**
   * Returns table's name.
   * @returns name of the Table, normally the filename.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Returns table's Groups.
   * @returns Array of all groups in table.
   */
  getGroups(): TSGroup[] {
    return this.groups;
  }

  /**
   * Searches for Group with given name and returns it.
   * @param name of group to search.
   * @returns Group for name or undefined if not contained.
   */
  groupForName(name: string): TSGroup | undefined {
    return this.groups.find((group) => group.name === name);
  }

  /**
   * Declares a parameter for a variable.
   * @param parameter to add to this table.
   */
  declareParameter(parameter: TableParameter) {
    const variable = this.variables.find((variable) => {
      return variable.name == parameter.variable;
    });
    if (!variable) throw `Missing variable declaration '${parameter.variable}' for parameter '${parameter}!'`;
    if (this.getParameter(parameter.variable)) throw `Parameter for variable '${parameter.variable}' already defined!`;
    this.parameters.push(parameter);
  }

  /**
   * Parameter for given variable name, may be null if not defined.
   * @param variable to retrieve Parameter for.
   * @returns Array of parameters defined for this table.
   */
  getParameter(variable: string): TableParameter | undefined {
    return this.parameters.find((param) => {
      return param.variable == variable;
    });
  }

  /**
   * Parameters for the table.
   * @returns Array of parameters defined for this table.
   */
  getParameters(): TableParameter[] {
    return this.parameters;
  }

  /**
   * Declares a variale in this table with optional default value.
   * @param variablename to add to this table.
   * @param value default value to initialize the variable with.
   */
  declareVariable(variablename: string, value: string | undefined) {
    this.variables.push({ name: variablename, value: value });
    this.setVariableInEvalContext(variablename, value);
  }

  /**
   * Sets variable in Evalcontext to given value.
   * @param variablename to set for this table.
   * @param value to set to variable.
   */
  private setVariableInEvalContext(variablename: string, value: string | undefined) {
    evalcontext.assignVar(this.name, variablename, value);
  }

  /**
   * Adds empty Group with given name.
   * @param name of new group, must be unique or throws.
   * @param rangeAsProbabilty should range values added to the group by interpreted as probability values 'true' for yes.
   * @returns TSGroup the newly created and added group.
   * @param nonRepeating should results on this group be only be drawn once, in multiply evaluatios.
   */
  addGroup(name: string, rangeAsProbabilty: boolean, nonRepeating: boolean): TSGroup {
    if (this.groupForName(name)) throw `Group name already defined got '${name}'`;
    const tsGroup = new TSGroup(name, rangeAsProbabilty, nonRepeating);
    this.groups.push(tsGroup);
    return tsGroup;
  }

  /**
   * Resets the evaluationcontext to be ready for a new evaluation of this table.
   */
  resetEvaluationContext(): void {
    this.variables.forEach((tuple) => {
      this.setVariableInEvalContext(tuple.name, tuple.value);
    });

    this.groups.forEach((group) => {
      group.reset();
    });
  }
}
