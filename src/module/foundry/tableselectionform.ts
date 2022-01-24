import { tablesmith } from '../tablesmith/tablesmithinstance';
import { TableParameter, TSTable } from '../tablesmith/tstable';
import { tstables } from '../tablesmith/tstables';
import { TABLESMITH_ID } from './helper';
import { Logger } from './logger';
import { TableCallValues } from './tablecallvalues';

const TABLESMITH_SELECTOR = `modules/${TABLESMITH_ID}/templates/tablesmithselector.hbs`;

interface TableSelectionOptions extends FormApplication.Options {
  someCustomOption?: boolean;
}

/**
 * Data class used within the Form.
 */
class FormData {
  selected: TSTable | undefined;
  parameters: TableParameter[];
  tables: TSTable[];
  result: string;
  constructor() {
    this.parameters = [];
    this.tables = [];
    this.result = '';
  }
}

const tableCallValues = new TableCallValues();
const data = new FormData();

/**
 * Selection form for a Tablesmith call.
 */
class TableSelectionForm extends FormApplication<TableSelectionOptions, FormData, TableCallValues> {
  /**
   * Adds additional options to default options.
   */
  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      width: '720',
      id: 'tablesmith-selector',
      template: TABLESMITH_SELECTOR,
      title: 'Tablesmith', // getGame().i18n.localize('TABLESMITH.evaluation-form') <- Game not initialized
      closeOnSubmit: false,
      submitOnChange: true,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

    return mergedOptions;
  }

  async getData(): Promise<FormData> {
    data.tables = tstables.getTSTables();
    if (!data.selected) {
      this._selectTable(undefined);
    }
    // data.parameters <- to store parameter in, read from selected table and set to default on init then to selected
    return data;
  }

  /**
   * Selects given table and set parameters for form.
   * @param table table or name to select, if undefined selects first table in list of tables.
   */
  protected _selectTable(table: TSTable | string | undefined): void {
    table = !table ? data.tables[0] : table;
    const tstable =
      typeof table == 'string'
        ? data.tables.find((tab) => {
            return tab.name == table;
          })
        : table;
    if (!tstable) throw `Cannot select table '${table}', not found in loaded tables`;

    if (data.selected != tstable) {
      data.selected = tstable;
      data.parameters = tstable.parameters.map((param) => {
        return Object.create(param);
      });
    }
  }

  protected async _updateObject(event: Event, formData?: Map<string, string>) {
    // foundry.utils.expandObject(formData); <- for later
    if (formData) {
      Logger.debug(false, 'formData', formData);
      const keyValues = Object.entries(formData) as [string, string][];
      this._selectTable(
        keyValues.find(([key]) => {
          return key == 'tablename';
        })?.[1],
      );
      data.result = '';
      this._updateParameters(keyValues);
      Logger.debug(false, 'data updated', data);
    }
    this.render();
  }

  _updateParameters(keyValues: [string, string][]): void {
    keyValues.forEach(([key, value]) => {
      const found = data.parameters.find((param) => {
        return param.variable == key;
      });

      if (found) {
        Logger.debug(false, 'setDefaultValue', found.variable, value);
        found.setDefaultValue(value);
      }
    });
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
        this._evaluateTable();
        break;
      default:
        Logger.error(true, 'Unknown action', action);
    }
  }

  _evaluateTable() {
    Logger.debug(false, 'Evaluating table');
    if (data.selected) {
      data.result = tablesmith.evaluate(`[${data.selected.name}]`, this._mapParameter());
      this.render();
    } else Logger.warn(false, 'No table selected!');
  }
  _mapParameter() {
    return data.parameters.map((param) => {
      return { name: param.variable, value: param.defaultValue };
    });
  }
}

export const tableSelectionForm = new TableSelectionForm(tableCallValues);
