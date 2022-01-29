/* Global initializer to add supporting functions for the parser. */
{{
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
}}

Content = (BalancedTag / SelfClosingTag / Text / EscapedChar)*

BalancedTag = startTag:StartTag content:Content endTag:EndTag {
    
    if (startTag == 'p') return `${content.join('')}\n`;
    return content.join('');
  }

SelfClosingTag = '<' _ name:TagName attributes:Attributes* _ '/>' {
  if (name == 'br') return '\n';
}
 
StartTag = '<' _ name:TagName attributes:Attributes* _ '>' { return name; }
EndTag = '</' _ name:TagName _ '>' { return name; }

Attributes = ' ' attributes:Attribute*
Attribute = (ValuedAttribute / ValuelessAttribute)
ValuedAttribute = name:AttributeName '=' value:AttributeValue
ValuelessAttribute = name:AttributeName
AttributeName = chars:[a-zA-Z0-9\-]+
AttributeValue = (QuotedAttributeValue / UnquotedAttributeValue)
QuotedAttributeValue = value:QuotedString
UnquotedAttributeValue = value:decimalDigit*
 
TagName = chars:[a-zA-Z0-9]+ { return chars.join(''); }

Text = chars:[^<>&\n]+  { return chars.join(''); }

EscapedChar
  = '\n'  { return ''; }
  / '&gt;' { return '>'; }
  / '&nbsp;' { return ' '; }
  / '&lt;'{ return '<'; }
  / '&amp;'{ return '&'; }
  / '&quot;'{ return '"'; }
  / '&apos;'{ return "'"; }

decimalDigit = [0-9]

QuotedString
  = "\"\"\"" d:(stringData / "'" / $("\"" "\""? !"\""))+ "\"\"\"" {
      return d.join('');
    }
  / "'''" d:(stringData / "\"" / "#" / $("'" "'"? !"'"))+ "'''" {
      return d.join('');
    }
  / "\"" d:(stringData / "'")* "\"" { return d.join(''); }
  / "'" d:(stringData / "\"" / "#")* "'" { return d.join(''); }
  stringData
    = [^"'\\#]
    / "\\0" !decimalDigit { '\0' }
    / "\\0" &decimalDigit { throw new SyntaxError ['string data'], 'octal escape sequence', offset(), line(), column() }
    / "\\b" { '\b' }
    / "\\t" { '\t' }
    / "\\n" { '\n' }
    / "\\v" { '\v' }
    / "\\f" { '\f' }
    / "\\r" { '\r' }
    / "\\" c:. { c }
    / c:"#" !"{" { c }
    
_ 'Whitespace'
  = [ ]*
