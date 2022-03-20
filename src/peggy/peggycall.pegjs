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
  = '[' _ table:Name group:('.' @Name)? _ Modifier? _ params:Params? _ ']' count:Count? {
        if (options == undefined) throw Error('Could not parse Call no options provided!');
        options.tablename = table;
        if (group && group.length > 0) options.groupname = group;
        options.parameters = params;
        if (count && count.length > 0) options.rollCount = count;
      }

Params
  = '(' head:Name? tail:(_ "," _ @Name?)* ')' { return [head, ...tail]; }

Modifier
  = modType:ModifierType _ modifier:int {
          if (options == undefined) throw Error('Could not parse Call no options provided!');
          options.modifier = modType;
          options.modifierValue = toInt(modifier);
        }

ModifierType
  = $[=+-]

Count
  = ':' first:[1-9] tail:[0-9]* { return [first, ...tail].join(''); }

Name
  = $[a-z0-9 _-]i+

_ "Whitespace"
  = [\t ]*

int
 = $([0-9]+)