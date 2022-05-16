import { tablesmith } from '../../tablesmith/tablesmithinstance';
import { tstables } from '../../tablesmith/tstables';
import ResultsTo from '../resultsto';
import { displayTableParseErrors } from './displayparseerrors';
import { getGame, saveFormLastTablename, TABLESMITH_ID } from '../helper';
import JournalTables from '../journaltables';
import { Logger } from '../logger';
import { TableCallValues } from '../tablecallvalues';
import TableSelectionFormData from './tableselectionformdata';
import CallResult from '../../tablesmith/callresult';
import CallResultPaginator from './callresultpaginator';

const TABLESMITH_SELECTOR = `modules/${TABLESMITH_ID}/templates/tablesmithselector.hbs`;

interface TableSelectionOptions extends FormApplicationOptions {
  evaluate?: boolean;
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
  constructor(tableCallValues: TableCallValues, paginator: CallResultPaginator, options?: TableSelectionOptions) {
    super(tableCallValues, options);
    this.data = new TableSelectionFormData({
      folders: tstables.folders,
      callValues: tableCallValues,
      paginator: paginator,
    });
  }
  /**
   * Adds additional options to default options.
   */
  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      width: 'auto',
      resizable: true,
      id: 'tablesmith-selector',
      template: TABLESMITH_SELECTOR,
      title: getGame().i18n.localize('TABLESMITH.evaluate.form'),
      closeOnSubmit: false,
      submitOnChange: true,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    return mergedOptions;
  }

  async close(options?: FormApplication.CloseOptions): Promise<void> {
    saveFormLastTablename(this.data.callValues.tablename);
    super.close(options);
  }

  async getData(): Promise<TableSelectionFormData> {
    Logger.debug(false, 'getData', this.data);
    return this.data;
  }

  protected async _updateObject(event: Event, formData?: Map<string, string>) {
    if (formData) {
      const expanded = foundry.utils.expandObject(formData);
      Logger.debug(false, 'expandedFormData', expanded);
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
    const elementData = clickedElement.data();
    const action = elementData.action;
    switch (action) {
      case 'evaluate':
        Logger.debug(false, 'pre evaluateTable call', this.data.callValues);
        this.evaluateTable();
        break;
      case 'start':
        Logger.debug(false, 'start');
        this._start();
        break;
      case 'end':
        Logger.debug(false, 'end');
        this._end();
        break;
      case 'prev':
        Logger.debug(false, 'prev');
        this._prev();
        break;
      case 'trash':
        Logger.debug(false, 'trash');
        this._trash();
        break;
      case 'next':
        Logger.debug(false, 'next');
        this._next();
        break;
      case 'group-reroll':
        this._rerollGroup(elementData);
        break;
      case 'enter-note':
        this._enterNote(elementData);
        break;
      case 'reload-tables':
        await this._reloadTables();
        break;
      case 'result-to-chat':
        await this._resultToChat();
        break;
      case 'result-to-journal':
        await this._resultToJournal();
        break;
      default:
        Logger.error(true, 'Unknown action', action, clickedElement.data());
    }
  }

  _start() {
    this.data.results = this.data.paginator.start();
    this.render();
  }

  _end() {
    this.data.results = this.data.paginator.end();
    this.render();
  }

  _prev() {
    this.data.results = this.data.paginator.prev();
    this.render();
  }

  _next() {
    this.data.results = this.data.paginator.next();
    this.render();
  }

  _trash() {
    this.data.results = this.data.paginator.trash();
    this.render();
  }

  async _rerollGroup(elementData: JQuery.PlainObject) {
    const resultIndex = Number.parseInt(elementData.index);
    const uuid = elementData.uuid;
    Logger.debug(false, 're roll group', resultIndex, uuid);
    const result = this.data.results?.results[resultIndex];
    const evalcontext = result?.evalcontext;
    const rerollable = evalcontext?.retrieveRerollable(uuid);
    Logger.debug(false, 're roll group', result, evalcontext, rerollable);
    if (rerollable) {
      await rerollable?.reroll();
      this.render();
    }
  }

  async _enterNote(elementData: JQuery.PlainObject) {
    const resultIndex = Number.parseInt(elementData.index);
    const uuid = elementData.uuid;
    Logger.debug(false, 'enter note', resultIndex, uuid);
    const result = this.data.results?.results[resultIndex];
    const evalcontext = result?.evalcontext;
    const note = evalcontext?.retrieveNote(uuid);
    Logger.debug(false, 'enter note', result, evalcontext, note);
    if (note) {
      await note?.reroll();
      this.render();
    }
  }

  /**
   * Evaluate table with current options.
   */
  async evaluateTable() {
    Logger.debug(false, 'Evaluating table', this.data);
    if (this.data.callValues.table) {
      this.data.mapParametersToCallValues();
      this.data.paginator.addResult(await tablesmith.evaluate(this.data.callValues));
      this.data.results = this.data.paginator.current();
      this.render();
    } else Logger.warn(false, 'No table selected!');
  }

  async _reloadTables() {
    const errors = await JournalTables.reloadTablesFromJournal();
    this.render();
    if (errors.length > 0) displayTableParseErrors();
    else ui.notifications?.info(getGame().i18n.localize('TABLESMITH.reload.tables-reloaded'));
  }

  async _resultToChat() {
    if (this.data.results) {
      new ResultsTo().chat(this.data.callValues, this.data.results);
    }
  }

  async _resultToJournal() {
    if (this.data.results) {
      new ResultsTo().journal(this.data.callValues, this.data.results);
    }
  }
}
