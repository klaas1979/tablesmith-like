import EvaluationContext from './expressions/evaluationcontext';
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
  selectedMultiList: string[] = [];
  options: { index: number; value: string }[];
  constructor(variable: string, defaultValue: string, prompt: string, multiList: boolean, options: string[]) {
    this.variable = variable;
    this.prompt = prompt;
    this.defaultValue = defaultValue;
    this.options = options.map((option, index) => {
      return { index: index + 1, value: option };
    });
    if (options.length == 0) {
      this.type = TableParameterType.PROMPT;
    } else if (multiList) {
      this.type = TableParameterType.MULTI_LIST;
      this._initSelectedMultiList();
      this.validateMultiListValue();
    } else {
      this.type = TableParameterType.LIST;
      this.validateListValue();
    }
  }
  private validateListValue(): void {
    const defaultNumber = Number.parseInt(this.defaultValue);
    if (Number.isNaN(defaultNumber) || defaultNumber < 1 || defaultNumber > this.options.length)
      throw Error(
        `Default value '${this.defaultValue}' must be integer for list Parameter between 1 and ${this.options.length}`,
      );
  }
  private validateMultiListValue() {
    if (this.defaultValue.length != this.options.length)
      throw Error(
        `Default value '${this.defaultValue}' for multi-list Parameter must be binary of length '${this.options.length}'`,
      );
    for (let i = 0; i < this.defaultValue.length; i++) {
      const num = Number.parseInt(this.defaultValue[i]);
      if (Number.isNaN(num) || num < 0 || num > 1)
        throw Error(
          `Default value '${this.defaultValue}' for multi-list Parameter must be binary of length '${this.options.length}'`,
        );
    }
  }

  /**
   * Sets default value for this parameter, checking validity.
   * @param value to set to.
   */
  setDefaultValue(value: string | string[]) {
    switch (this.type) {
      case TableParameterType.PROMPT:
        if (typeof value != 'string') throw Error(`Type must be string, not a '${typeof value}' cannot set value!`);
        this.defaultValue = value;
        break;
      case TableParameterType.LIST:
        if (typeof value != 'string') throw Error(`Type must be string, not a '${typeof value}' cannot set value!`);
        this.defaultValue = value;
        this.validateListValue();
        break;
      case TableParameterType.MULTI_LIST:
        if (typeof value == 'string') throw Error(`Type must be string[], not a '${typeof value}' cannot set value!`);
        let result = '';
        for (let i = 0; i < this.options.length; i++) {
          const isSelected = value.find((selected) => {
            return selected == `${i + 1}`;
          });
          result += isSelected ? '1' : '0';
        }
        this.defaultValue = result;
        this.selectedMultiList = value;
        this.validateMultiListValue();
        break;
      default:
        throw Error(`Setting value for Type '${this.type}' not implemented!`);
    }
  }

  /**
   * Inits array of selected options in Multi List parameter from defaultValue.
   */
  _initSelectedMultiList(): void {
    const result: string[] = [];
    for (let i = 0; i < this.defaultValue.length; i++) {
      if (this.defaultValue[i] == '1') result.push(`${i + 1}`);
    }
    this.selectedMultiList = result;
  }

  /**
   * Checks for type.
   * @returns true if is Prompt, false otherwise.
   */
  isPrompt(): boolean {
    return this.type == TableParameterType.PROMPT;
  }

  /**
   * Checks for type.
   * @returns true if is List, false otherwise.
   */
  isList(): boolean {
    return this.type == TableParameterType.LIST;
  }

  /**
   * Checks for type.
   * @returns true if is Multi-List, false otherwise.
   */
  isMultiList(): boolean {
    return this.type == TableParameterType.MULTI_LIST;
  }
}

/**
 * A single table or tablesmith file, tables can contain many groups to be rolled upon.
 */
export class TSTable {
  groups: TSGroup[];
  folder: string;
  name: string;
  variables: { name: string; value: string | undefined }[];
  parameters: TableParameter[];

  constructor(folder: string, name: string) {
    this.groups = [];
    this.folder = folder;
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
    if (!variable) throw Error(`Missing variable declaration '${parameter.variable}' for parameter '${parameter}!'`);
    if (this.getParameter(parameter.variable))
      throw Error(`Parameter for variable '${parameter.variable}' already defined!`);
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
   * Sets parameters to given values for evaluation.
   * @param context the EvaluationContext to set parameters to.
   * @param params to set for evaluation.
   */
  setParametersForEvaluationByName(
    context: EvaluationContext,
    params: { name: string; value: string | undefined }[],
  ): void {
    for (const param of params) {
      context.assignVar(this.name, param.name, param.value);
    }
  }

  /**
   * Sets parameters to given values for evaluation by index.
   * @param context the EvaluationContext to set parameters to.
   * @param params to set for evaluation.
   */
  setParametersForEvaluationByIndex(context: EvaluationContext, params: string[]): void {
    if (params.length > 0) {
      if (this.parameters.length != params.length)
        throw Error(
          `Cannot set parameters by index, length do not match, needed=${this.parameters.length} got length=${
            params.length
          } values='${params.join(',')}'`,
        );
      const clone = [...params].reverse();
      for (const parameter of this.parameters) {
        const value = clone.pop();
        if (value) context.assignVar(this.name, parameter.variable, value);
      }
    }
  }

  /**
   * Declares a variale in this table with optional default value.
   * @param variablename to add to this table.
   * @param value default value to initialize the variable with.
   */
  declareVariable(variablename: string, value: string | undefined) {
    this.variables.push({ name: variablename, value: value });
  }

  /**
   * Adds empty Group with given name.
   * @param name of new group, must be unique or throws.
   * @param rangeAsProbabilty should range values added to the group by interpreted as probability values 'true' for yes.
   * @returns TSGroup the newly created and added group.
   * @param nonRepeating should results on this group be only be drawn once, in multiply evaluatios.
   */
  addGroup(name: string, rangeAsProbabilty: boolean, nonRepeating: boolean): TSGroup {
    if (this.groupForName(name)) throw Error(`Group name already defined got '${name}'`);
    const tsGroup = new TSGroup(name, rangeAsProbabilty, nonRepeating);
    this.groups.push(tsGroup);
    return tsGroup;
  }

  /**
   * Resets the evaluationcontext to be ready for a new evaluation of this table.
   */
  prepareEvaluationContext(context: EvaluationContext): void {
    this.variables.forEach((tuple) => {
      context.assignVar(this.name, tuple.name, tuple.value);
    });

    this.groups.forEach((group) => {
      group.reset();
    });
  }
}
