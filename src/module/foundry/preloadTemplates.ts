export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    // Add paths to "modules/tablesmith-like/templates"
  ];

  return loadTemplates(templatePaths);
}
