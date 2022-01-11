/* Global initializer to add supporting functions for the parser. */
{{
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple helper parsing Text to base 10 int.
 * @returns number parsed int.
 */
function toInt(text) {
  return Number.parseInt(text, 10);
}
}}

GroupFunction
  = '[' _ table:Name group:('.' @Name)? _ Modifier? _ ']' {
        if (options == undefined) throw 'Could not parse Call no options provided!';
        options.table = table;
        options.group = group;
      }
  
Modifier
  = modType:ModifierType _ modifier:int {
          if (options == undefined) throw 'Could not parse Call no options provided!';
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