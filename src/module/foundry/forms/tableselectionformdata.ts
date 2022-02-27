import CallResult from '../../tablesmith/callresult';
import { TableParameter, TSTable } from '../../tablesmith/tstable';
import { tstables } from '../../tablesmith/tstables';
import { Logger } from '../logger';
import { TableCallValues } from '../tablecallvalues';

/**
 * Data class used within the Form.
 */
export default class TableSelectionFormData {
  folder: { name: string } = { name: '' };
  folders: Array<{ name: string }> = [];
  tables: TSTable[] = [];
  callValues: TableCallValues = new TableCallValues();
  parameters: TableParameter[] = [];
  results: CallResult | undefined;

  constructor(
    options: { folders: string[]; callValues: TableCallValues } = { folders: [], callValues: new TableCallValues() },
  ) {
    this.callValues = options.callValues;
    this.folders = options.folders.map((f) => {
      return { name: f };
    });
    if (this.folders.length > 0) this.setFoldername(this.folders[0].name);
    if (!this.callValues.table && this.tables.length > 0) this.setTablename(this.tables[0].name);
    else this._initParameters();
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
    this._initParameters();
  }

  private _initParameters() {
    if (this.callValues.table)
      this.parameters = this.callValues.table.parameters.map((param) => {
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

  /**
   * Maps parameters at 'parameters' to callvalues parameters at 'callValues.parameters'.
   */
  mapParametersToCallValues(): void {
    this.callValues.parameters = this.parameters.map((param) => {
      return param.defaultValue;
    });
  }
}
