import { tablesmith } from '../../tablesmith/tablesmithinstance';
import { tstables } from '../../tablesmith/tstables';
import ChatResults from '../chatresults';
import { displayTableParseErrors } from './displayparseerrors';
import { getGame, TABLESMITH_ID } from '../helper';
import JournalTables from '../journaltables';
import { Logger } from '../logger';
import { TableCallValues } from '../tablecallvalues';
import TableSelectionFormData from './tableselectionformdata';
import CallResult from '../../tablesmith/callresult';

const TABLESMITH_SELECTOR = `modules/${TABLESMITH_ID}/templates/tablesmithselector.hbs`;

interface TableSelectionOptions extends FormApplicationOptions {
  someCustomOption?: boolean;
}

/**
 * Selection form for a Tablesmith call.
 */
export default class TableSelectionForm extends FormApplication<
  TableSelectionOptions,
  TableSelectionFormData,
  TableCallValues
> {
  data: TableSelectionFormData;
  constructor(tableCallValues: TableCallValues, options?: TableSelectionOptions) {
    super(tableCallValues, options);
    this.data = new TableSelectionFormData({ folders: tstables.folders, callValues: new TableCallValues() });
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

  async getData(): Promise<TableSelectionFormData> {
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
      this.data.results = new CallResult(this.data.callValues);
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
      this.data.mapParametersToCallValues();

      this.data.results = await tablesmith.evaluate(this.data.callValues);
      this.render();
      if (this.data.chatResults) {
        new ChatResults().chatResults(this.data.callValues, this.data.results);
      }
    } else Logger.warn(false, 'No table selected!');
  }

  _reloadTables() {
    const errors = JournalTables.reloadTablesFromJournal();
    this.render();
    if (errors.length > 0) displayTableParseErrors();
    else ui.notifications?.info(getGame().i18n.localize('TABLESMITH.tables-reloaded'));
  }
}
