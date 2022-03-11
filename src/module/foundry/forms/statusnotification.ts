/**
 * Status message display
 * @param status The msg to display.
 */
export async function promptStatus(status: string): Promise<void> {
  ui.notifications?.info(status);
}
