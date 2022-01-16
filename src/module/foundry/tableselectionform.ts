import { tablesmith } from '../tablesmith/tablesmithinstance';
import { TSTable } from '../tablesmith/tstable';
import { tstables } from '../tablesmith/tstables';
import { TABLESMITH_ID } from './helper';
import { Logger } from './logger';
import TableCallValues from './tablecallvalues';

const TABLESMITH_SELECTOR = `modules/${TABLESMITH_ID}/templates/tablesmithselector.hbs`;

interface TableSelectionOptions extends FormApplication.Options {
  someCustomOption?: boolean;
}

/**
 * Data class used within the Form.
 */
class FormData {
  selected: string;
  tables: TSTable[];
  result: string;
  constructor() {
    this.selected = '';
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
    return data;
  }

  protected async _updateObject(event: Event, formData?: { tablename: string }) {
    // foundry.utils.expandObject(formData); <- for later
    if (formData) {
      data.selected = formData.tablename;
      Logger.debug(false, 'data', data);
    }
    this.render();
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);
    html.on('click', '[data-action]', this._handleButtonClick.bind(this));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _handleButtonClick(event: { currentTarget: any }) {
    const clickedElement = $(event.currentTarget);
    const action = clickedElement.data().action;
    if (action == 'evaluate') {
      data.result = tablesmith.evaluate(`[${data.selected}]`);
      this.render();
    } else {
      Logger.error(true, 'Unknown action', action);
    }
  }
}

export const tableSelectionForm = new TableSelectionForm(tableCallValues);
