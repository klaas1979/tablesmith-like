import CallResult from '../../tablesmith/callresult';

/**
 * Call Result Paginator, holding the data of call results.
 */
export default class CallResultPaginator {
  results: CallResult[] = [];
  index = 0;
  disableNext = true;
  disablePrev = true;
  disableTrash = true;
  numStart = '';
  numEnd = '';
  numPrev = '';
  numNext = '';
  numTrash = '';
  maxLength: number;

  constructor(maxLength = 25) {
    this.maxLength = maxLength;
  }

  /**
   * Result for current stored index.
   * @returns CallResult at current index.
   */
  current(): CallResult | undefined {
    return this.results[this.index];
  }

  /**
   * Adds result, ensures max length and sets added result as next one to display.
   * @param result to add to Paginator.
   */
  addResult(result: CallResult): void {
    this.results.unshift(result);
    while (this.results.length > this.maxLength) this.results.pop();
    this.index = 0;
    this._updateFields();
  }

  /**
   * Updates disable flags for pagination and numbers for display.
   */
  _updateFields() {
    this.disableNext = this.results.length === 0 || this.index === this.results.length - 1;
    this.disablePrev = this.results.length === 0 || this.index === 0;
    this.disableTrash = this.results.length === 0;
    this.numStart = this.results.length === 0 ? '' : '1';
    this.numEnd = this.results.length === 0 ? '' : `${this.results.length}`;
    this.numNext = this.disableNext ? '' : `${this.index + 2}`;
    this.numPrev = this.disablePrev ? '' : `${this.index}`;
    this.numTrash = this.disableTrash ? '' : `${this.index + 1}`;
  }

  /**
   * Removes result at current indext.
   */
  trash(): CallResult {
    this.results.splice(this.index, 1);
    if (this.index > 0) this.index -= 1;
    this._updateFields();
    return this.results[this.index];
  }

  /**
   * Changes current result to start of result queue and returns it.
   * @returns CallResult at next.
   */
  start(): CallResult {
    this.index = 0;
    this._updateFields();
    return this.results[this.index];
  }

  /**
   * Changes current result to end of results queue and returns it.
   * @returns CallResult at next.
   */
  end(): CallResult {
    this.index = this.results.length - 1;
    this._updateFields();
    return this.results[this.index];
  }

  /**
   * Changes current result to prev and returns it.
   * @returns CallResult at prev.
   */
  prev(): CallResult {
    if (this.index > 0) this.index -= 1;
    this._updateFields();
    return this.results[this.index];
  }

  /**
   * Changes current result to next and returns it.
   * @returns CallResult at next.
   */
  next(): CallResult {
    if (this.index < this.results.length - 1) this.index += 1;
    this._updateFields();
    return this.results[this.index];
  }
}
