/* Global initializer to add supporting functions for the parser. */
{{
  function toInt(text) {
    return Number.parseInt(text);
  }
}}

Call
  = _ "[" table:Name "."? group:Name?"]" _ { options.table = table; options.group = group; }

Name
  = $[a-z0-9 _]i+

_ "Whitspace"
  = [\t ]*