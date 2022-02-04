import { tablesmith } from '../tablesmith/tablesmithinstance';
import { TableParameter, TSTable } from '../tablesmith/tstable';
import { tstables } from '../tablesmith/tstables';
import ChatResults from './chatresults';
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
  folder: { name: string } = { name: '' };
  folders: Array<{ name: string }> = [];
  tables: TSTable[] = [];
  callValues: TableCallValues = new TableCallValues();
  parameters: TableParameter[] = [];
  chatResults = true;
  results: string[] = [];

  constructor(folders: string[]) {
    this.folders = folders.map((f) => {
      return { name: f };
    });
    if (this.folders.length > 0) this.setFoldername(folders[0]);
    if (this.tables.length > 0) this.setTablename(this.tables[0].name);
  }

  /**
   * Handles setting of folder including change of underlying tables.
   * @param name of selected folder.
   */
  setFoldername(name: string) {
    if (this.foldersContains(name)) {
      this.folder.name = name;
      this.tables = tstables.tablesForFolder(name);
    }
  }

  /**
   * Checks if folder is contained in data.
   * @param folder to check if contained.
   * @returns true if folders contains a folder with given name, false otherwise.
   */
  foldersContains(folder: { name: string } | string): boolean {
    const name = typeof folder == 'string' ? folder : folder.name;
    return (
      this.folders.find((f) => {
        return name == f.name;
      }) != undefined
    );
  }

  setTablename(tablename: string): void {
    const table = this.findTable(tablename);
    if (table) {
      if (table != this.callValues.table) {
        this._updateTable(table);
      }
    } else if (this.tables.length > 0) {
      this._updateTable(this.tables[0]);
    }
  }
  private _updateTable(table: TSTable) {
    this.callValues.tablename = table.name;
    this.callValues.table = table;
    this.parameters = table.parameters.map((param) => {
      return Object.create(param);
    });
  }

  /**
   * Checks if tablename is contained in data.
   * @param tablename to check if contained.
   * @returns table if it is contained, undefined if not.
   */
  findTable(tablename: string): TSTable | undefined {
    return this.tables.find((t) => {
      return tablename == t.name;
    });
  }

  /**
   * Updates parameters for selection and input in form.
   * @param parameters to update values from.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateParameters(parameters: any | undefined): void {
    Logger.debug(false, 'start updateParameters', parameters);
    if (parameters) {
      this.parameters.forEach((param) => {
        const value = parameters[param.variable];
        if (value) {
          param.setDefaultValue(value);
        }
      });
    }
    Logger.debug(false, 'end updateParameters');
  }
}

/**
 * Selection form for a Tablesmith call.
 */
export default class TableSelectionForm extends FormApplication<TableSelectionOptions, FormData, TableCallValues> {
  data: FormData;
  constructor(tableCallValues: TableCallValues, options?: TableSelectionOptions) {
    super(tableCallValues, options);
    this.data = new FormData(tstables.folders);
  }
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
    Logger.debug(false, 'getData', this.data);
    return this.data;
  }

  protected async _updateObject(event: Event, formData?: Map<string, string>) {
    if (formData) {
      const expanded = foundry.utils.expandObject(formData);
      Logger.debug(false, 'expandedFormData', expanded);
      this.data.chatResults = expanded['chatResults'];
      this.data.setFoldername(expanded['folder']['name']);
      this.data.setTablename(expanded['callValues']['tablename']);
      this.data.callValues.rollCount = expanded['callValues']['rollCount'];
      this.data.results = [];
      this.data.updateParameters(expanded['parameters']);
      Logger.debug(false, 'updatedFormData', this.data);
    }
    this.render();
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);
    Logger.debug(false, 'Listeners', this, this.data);
    html.on('click', '[data-action]', this._handleButtonClick.bind(this));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _handleButtonClick(event: { currentTarget: any }) {
    const clickedElement = $(event.currentTarget);
    const action = clickedElement.data().action;
    switch (action) {
      case 'evaluate':
        Logger.debug(false, 'pre evaluateTable call', this.data.callValues);
        this._evaluateTable();
        break;
      case 'reload-tables':
        this._reloadTables();
        break;
      default:
        Logger.error(true, 'Unknown action', action);
    }
  }

  async _evaluateTable() {
    Logger.debug(false, 'Evaluating table', this.data);
    if (this.data.callValues.table) {
      this.data.callValues.parameters = this._mapParameter();
      const results = await tablesmith.evaluate(this.data.callValues);
      this.data.results = typeof results == 'string' ? [results] : results;
      this.render();
      if (this.data.chatResults) {
        new ChatResults().chatResults(this.data.callValues, this.data.results);
      }
    } else Logger.warn(false, 'No table selected!');
  }
  _mapParameter(): string[] {
    return this.data.parameters.map((param) => {
      return param.defaultValue;
    });
  }

  _reloadTables() {
    JournalTables.reloadTablesFromJournal();
    this.render();
    ui.notifications?.info(getGame().i18n.localize('TABLESMITH.tables-reloaded'));
  }
}
