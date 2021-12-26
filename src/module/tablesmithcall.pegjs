/* Global initializer to add supporting functions for the parser. */
{{
  function toInt(text) {
    return Number.parseInt(text);
  }
}}

Call
  = "[" table:Name? "."? group:Name Modifier? "]" { options.table = table; options.group = group; }

Name
  = $[a-z0-9]i+
  
Modifier
  = modType:ModifierType _ modifier:int { if (modType == '=') {
                                            options.fixedResult = true;
                                            options.modifier = toInt(`${modifier}`);
                                          } else {
                                            options.modifier = toInt(`${modType}${modifier}`);
                                          }
                                        }

ModifierType
  = $[=+-]

int
 = $([0-9]*)

_ "Whitspace"
  = [\t ]*