import { TABLESMITH_ID } from './helper';

export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    `modules/${TABLESMITH_ID}/templates/paraminput.hbs`,
    `modules/${TABLESMITH_ID}/templates/paramspartial.hbs`,
    `modules/${TABLESMITH_ID}/templates/resultpartial.hbs`,
    `modules/${TABLESMITH_ID}/templates/tablesmithselector.hbs`,
  ];

  return loadTemplates(templatePaths);
}
