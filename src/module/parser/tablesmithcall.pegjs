/* Global initializer to add supporting functions for the parser. */
{{
  function toInt(text) {
    return Number.parseInt(text);
  }
}}

GroupFunction
  = '[' _ table:Name group:('.' @Name)? _ Modifier? _ ']' {
        options.table = table;
        options.group = group;
      }
  
Modifier
  = modType:ModifierType _ modifier:int {
          options.modType = modType;
          options.modNumber = toInt(modifier);
        }

ModifierType
  = $[=+-]

Name
  = $[a-z0-9 _]i+

_ "Whitespace"
  = [\t ]*

int
 = $([0-9]+)