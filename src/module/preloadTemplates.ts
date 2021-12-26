export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    // Add paths to "modules/foundryvtt-tablesmith/templates"
  ];

  return loadTemplates(templatePaths);
}
