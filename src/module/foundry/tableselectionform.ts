import { tablesmith } from '../tablesmith/tablesmithinstance';
import { TableParameter, TSTable } from '../tablesmith/tstable';
import { tstables } from '../tablesmith/tstables';
import { getGame, TABLESMITH_ID } from './helper';
import JournalTables from './journaltables';
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
  chatResults: boolean;
  result: string;
  constructor() {
    this.parameters = [];
    this.tables = [];
    this.result = '';
    this.chatResults = true;
  }
}

/**
 * Selection form for a Tablesmith call.
 */
export default class TableSelectionForm extends FormApplication<TableSelectionOptions, FormData, TableCallValues> {
  data = new FormData();
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
      title: getGame().i18n.localize('TABLESMITH.evaluation-form'),
      closeOnSubmit: false,
      submitOnChange: true,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    return mergedOptions;
  }

  async getData(): Promise<FormData> {
    this.data.tables = tstables.getTSTables();
    if (!this.data.selected) {
      this._selectTable(undefined);
    }
    // data.parameters <- to store parameter in, read from selected table and set to default on init then to selected
    return this.data;
  }

  /**
   * Selects given table and set parameters for form.
   * @param table table or name to select, if undefined selects first table in list of tables.
   */
  protected _selectTable(table: TSTable | string | undefined): void {
    table = !table ? this.data.tables[0] : table;
    const tstable =
      typeof table == 'string'
        ? this.data.tables.find((tab) => {
            return tab.name == table;
          })
        : table;
    if (!tstable) throw `Cannot select table '${table}', not found in loaded tables`;

    if (this.data.selected != tstable) {
      this.data.selected = tstable;
      this.data.parameters = tstable.parameters.map((param) => {
        return Object.create(param);
      });
    }
  }

  protected async _updateObject(event: Event, formData?: Map<string, string>) {
    // foundry.utils.expandObject(formData); <- for later
    if (formData) {
      Logger.debug(false, 'formData', formData);
      const entries = Object.entries(formData) as [string, string][];
      this.data.chatResults =
        entries.find(([key]) => {
          return key == 'chatResults';
        })?.[1] +
          '' ==
        'true';
      this._selectTable(
        entries.find(([key]) => {
          return key == 'tablename';
        })?.[1],
      );
      this.data.result = '';
      this._updateParameters(entries);
      Logger.debug(false, 'data updated', this.data);
    }
    this.render(true);
  }

  _updateParameters(keyValues: [string, string][]): void {
    keyValues.forEach(([key, value]) => {
      const found = this.data.parameters.find((param) => {
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
      case 'reload-tables':
        this._reloadTables();
        break;
      default:
        Logger.error(true, 'Unknown action', action);
    }
  }

  _evaluateTable() {
    Logger.debug(false, 'Evaluating table', this.data);
    if (this.data.selected) {
      this.data.result = tablesmith.evaluate(`[${this.data.selected.name}]`, this._mapParameter());
      this.render(true);
      if (this.data.chatResults) {
        const chatMessage = new ChatMessage({ flavor: `Table: ${this.data.selected.name}`, content: this.data.result });
        ui.chat?.postOne(chatMessage);
      }
    } else Logger.warn(false, 'No table selected!');
  }
  _mapParameter() {
    return this.data.parameters.map((param) => {
      return { name: param.variable, value: param.defaultValue };
    });
  }

  _reloadTables() {
    JournalTables.reloadTablesFromJournal();
    this.render(true);
    ui.notifications?.info(getGame().i18n.localize('TABLESMITH.tables-reloaded'));
  }
}
