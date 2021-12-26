/* Global initializer to add supporting functions for the parser. */
{{
  function toInt(text) {
    return Number.parseInt(text, 10);
  }
}}

/* Per parse initializer, called each parse to configure and setup stuff for each run. */
{
  
}

/* A Tablesmith file as starting point, it is called Table */
Table
  = (Ignore Group)+

/* A group is a subtable, all Tablesmith stuff starting with :Name to be called and rolled */
Group
  = GroupName Range+

/* The name for a group, this is the name without dot.
   TODO name for calls to other tables. */
GroupName
  = [:]name:Name EmptyLine { options.table.addGroup(name); }

/* Range is a single line in a group donating the lower and upper end for the result, i.e. 1-2,Result */
Range
  = RangeValue line:Line EmptyLine? 

/* Only the range expression with the colon ',' */
RangeValue
  = (int _ "-" _)? up:int Colen { options.table.addRange(toInt(up)); }

/* Separates the range lower-upper value from it's Expression */
Colen
  = _ [,]

/* Lines are contained in groups, Tablesmith allows lines to be split by starting the next line with an underscore "_" */
Line
  = head:Expression tail:(EmptyLine "_" @Expression)*

/* Expressions are all supported values or results for a Range. The Tablesmith functions are defined here. */
Expression
  = GroupFunction Expression*
  / TsFunction Expression*
  / Value Expression*

/* The simplest Expression is a test value that is returned as is, without further processing. */
Value
  = text:PlainText { options.table.addExpressionToRange(options.expressionFactory.createText(text)); }

/* Call of another group within this Table or within another. Table */
GroupFunction
  = "[" table:(@Name ".")? group:Name Modifier? "]" {  options.table.addExpressionToRange(options.expressionFactory.groupCall(table, group)); }
  
Modifier
  = modType:ModifierType _ modifier:int { options.expressionFactory.addGroupCallModifier(modType, toInt(`${modifier}`)); }

ModifierType
  = $[=+-]

/* This are all supported functions from Tablesmith */
TsFunction
  = _ "{Dice~" _ MathExpression _ "}" { options.table.addExpressionToRange(options.expressionFactory.create()); }
  / _ "{Calc~" _ MathExpression _ "}" { options.table.addExpressionToRange(options.expressionFactory.create()); }
  / _ "{Bold~" text:Value "}" { options.table.addExpressionToRange(options.expressionFactory.createBold(text)); }
  / _ "{CR~" _ "}" { options.table.addExpressionToRange(options.expressionFactory.createNewline()); }

MathExpression
  = MathTerm (_ MathSum _ MathTerm)*

MathSum
  = "+" { options.expressionFactory.addAddition(); }
  / "-" { options.expressionFactory.addSubtraction(); }

MathTerm
  = MathFactor (_ MathMult _ MathFactor)* 
  
MathMult
  = "d" { options.expressionFactory.addDice(); }
  / "*" { options.expressionFactory.addMultiplication(); }
  / "/" { options.expressionFactory.addDivision(); }

MathFactor
  = OpenBracket _ MathExpression _ CloseBracket
  / _ number:int { options.expressionFactory.addNumber(toInt(number)); }

OpenBracket
  = "(" { options.expressionFactory.openBracket(); }

CloseBracket
  = ")" { options.expressionFactory.closeBracket(); }

PlainText
 = $[^{}[\]\n]+

/* Simple name without Dot or special characters. */
Name
  = $[a-z0-9 _]i+

int
 = $([0-9]+)

_ "Whitspace"
  = [\t ]*

/* Stuff to ignore within a Table file. */
Ignore
  = EmptyLine* Comment* EmptyLine*

EmptyLine
 = _ [\n]

/* The only allowed comments in Tablesmith */
Comment
  = [#][^\n]*[\n]