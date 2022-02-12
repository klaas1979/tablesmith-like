import { getGame, TABLESMITH_ID } from '../helper';
import { Logger } from '../logger';
import { TableCallValues } from '../tablecallvalues';
import TableSelectionFormData from './tableselectionformdata';

const TABLESMITH_PARAMS = `modules/${TABLESMITH_ID}/templates/paraminput.hbs`;

/**
 * Parameter Input for a Table call.
 */
class ParamInputForm extends FormApplication<FormApplicationOptions, TableSelectionFormData, TableSelectionFormData> {
  data: TableSelectionFormData;
  resolve: (value: unknown) => void;
  private constructor(data: TableSelectionFormData, resolve: (value: unknown) => void) {
    super(data);
    this.data = data;
    this.resolve = resolve;
  }

  /**
   * Gathers parameters for given call Values if needed.
   * @param callValues to gather parameter input for.
   * @returns boolean true, if prameters set, false if input was aborted.
   */
  static async gather(callValues: TableCallValues): Promise<boolean> {
    try {
      if (callValues.needsParameters()) {
        const data = new TableSelectionFormData({ folders: [], callValues: callValues });
        const fromPromise = new Promise((resolve) => {
          const form = new ParamInputForm(data, resolve);
          form.render(true);
        });
        await fromPromise;
      }
      return true;
    } catch (error) {
      return false;
    }
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
      title: getGame().i18n.localize('TABLESMITH.parameter-input'),
      closeOnSubmit: true,
      submitOnChange: false,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

    return mergedOptions;
  }

  async getData(): Promise<TableSelectionFormData> {
    return this.data;
  }

  protected async _updateObject(event: Event, formData?: Map<string, string>) {
    if (formData) {
      const expanded = foundry.utils.expandObject(formData);
      Logger.debug(false, 'formData and expanded', formData, expanded);
      this.data.updateParameters(expanded['parameters']);
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
    await this.submit();
    this.data.mapParametersToCallValues();
    this.close();
    Logger.debug(false, 'Final data', this.data);
    this.resolve(this.data);
  }
}

export default ParamInputForm;
