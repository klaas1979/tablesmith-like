import { tablesmith } from '../tablesmith/tablesmithinstance';
import { TableParameter, TSTable } from '../tablesmith/tstable';
import { TABLESMITH_ID } from './helper';
import { Logger } from './logger';

const TABLESMITH_PARAMS = `modules/${TABLESMITH_ID}/templates/paraminput.hbs`;

/**
 * Data class used within the Form.
 */
export class FormData {
  table: TSTable;
  parameters: TableParameter[];
  constructor(table: TSTable) {
    this.table = table;
    this.parameters = this.table.parameters.map((param) => {
      return Object.create(param);
    });
  }
  /**
   * Parameters as needed for Table evaluation.
   * @returns Array of Maps of key value objects with parameter values.
   */
  mapParameter(): { name: string; value: string }[] {
    return this.parameters.map((param) => {
      return { name: param.variable, value: param.defaultValue };
    });
  }
  updateParameters(keyValues: [string, string][]): void {
    keyValues.forEach(([key, value]) => {
      const found = this.parameters.find((param) => {
        return param.variable == key;
      });

      if (found) {
        Logger.debug(false, 'setDefaultValue', found.variable, value);
        found.setDefaultValue(value);
      }
    });
  }
}

/**
 * Parameter Input for a Table call.
 */
class ParamInputForm extends FormApplication<FormApplication.Options, FormData, FormData> {
  data: FormData;
  constructor(data: FormData, options?: FormApplication.Options) {
    super(data, options);
    this.data = data;
  }
  /**
   * Adds additional options to default options.
   */
  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      id: 'tablesmith-param-input',
      template: TABLESMITH_PARAMS,
      title: 'Tablesmith Parameters', // getGame().i18n.localize('TABLESMITH.evaluation-form') <- Game not initialized
      closeOnSubmit: true,
      submitOnChange: false,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

    return mergedOptions;
  }

  async getData(): Promise<FormData> {
    return this.data;
  }

  protected async _updateObject(event: Event, formData?: Map<string, string>) {
    // foundry.utils.expandObject(formData); <- for later
    if (formData) {
      Logger.debug(false, 'formData', formData);
      const keyValues = Object.entries(formData) as [string, string][];
      this.data.updateParameters(keyValues);
      Logger.debug(false, 'data updated', this.data);
    }
    this.render();
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);
    Logger.debug(false, 'Listeners', this);
    html.on('click', '[data-action]', this._handleButtonClick.bind(this));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _handleButtonClick(event: { currentTarget: any }) {
    const clickedElement = $(event.currentTarget);
    const action = clickedElement.data().action;
    switch (action) {
      case 'evaluate':
        this._paramsSet();
        break;
      default:
        Logger.error(true, 'Unknown action', action);
    }
  }

  async _paramsSet() {
    Logger.debug(false, 'Submitting data');
    await this.submit();
    Logger.debug(false, 'Final data', this.data);
    tablesmith.evaluate(`[${this.data.table.name}]`, this.data.mapParameter());
    this.close();
  }
}

export default ParamInputForm;
