/* Global initializer to add supporting functions for the parser. */
{{
  /**
   * Simple helper parsing Text to base 10 int.
   * @returns number parsed int.
   */
  function toInt(text) {
    return Number.parseInt(text, 10);
  }
}}

/* Per parse initializer, called each parse to configure and setup stuff for each run. */
{
  /**
   * ErrorHandlung helper catches exceptions from actionCallback and creates error from Peggy with location
   * information. This needs to be defined in the per Parser context, to have access to the error-Function.
   * @param actionCallback to execute and handle errors for.
   */
  function errorHandling(actionCallback) {
    try {
      actionCallback();
    } catch (actionError) {
      const loc = location();
      const before = input.substring(Math.max(0, loc.start.offset - 15), loc.start.offset);
      const content = input.substring(loc.start.offset, loc.end.offset);
      const after = input.substring(loc.end.offset, Math.max(input.length, loc.end.offset + 15));
      const errorLocation = `Lines from ${loc.start.line} to ${loc.end.line}', columns from ${loc.start.column} to ${loc.end.column}, FileOffset from ${loc.start.offset} to ${loc.end.offset} \nText:>>>>\n${before}||>|${content}|<||${after}\n<<<<`;
      throw `Error '${actionError}' at location '${errorLocation}'`;
    }
  }
}

/* A Tablesmith file as starting point, it is called Table */
Table
  = (Ignore TableContent)+

/** Content allowed in Table in general are variables or groups */
TableContent
  = VariableDeclaration
  / Group

VariableDeclaration
  = "%" name:Name "%," value:PlainText? { errorHandling(() => {
            options.table.declareVariable(name, value);
          }); }

/* A group is a subtable, all Tablesmith stuff starting with :Name to be called and rolled */
Group
  = GroupName GroupContent+

/* The name for a group, this is the name without dot.
   TODO name for calls to other tables. */
GroupName
  = [:]name:Name EmptyLine { errorHandling(() => {
            options.table.addGroup(name);
          }); }

/* Range is a single line in a group donating the lower and upper end for the result, i.e. 1-2,Result */
GroupContent
  = RangeValue line:Line EmptyLine?
  / BeforeValue  line:Line EmptyLine?
  / AfterValue  line:Line EmptyLine?

/* Only the range expression with the colon ',' */
RangeValue
  = (int _ "-" _)? up:int Colen { errorHandling(() => {
            options.table.addRange(toInt(up));
          }); }

/* Only the before expression  */
BeforeValue
  = "<" _ { errorHandling(() => {
            options.table.addBefore();
          }); }

/* Only the after expression  */
AfterValue
  = ">" _ { errorHandling(() => {
            options.table.addAfter();
          }); }

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
  / VariableGet Expression*
  / Value Expression*

VariableGet
  = "%" tablename:(@Name ".")? varname:Name "%"{ errorHandling(() => {
            options.table.addExpression(options.expressionFactory.createVariableGet(tablename, varname));
          }); }

/* The simplest Expression is a test value that is returned as is, without further processing. */
Value
  = text:PlainText { errorHandling(() => {
            options.table.addExpression(options.expressionFactory.createText(text));
          }); }

/* Call of another group within this Table or within another. Table */
GroupFunction
  = "[" table:(@Name ".")? group:Name Modifier? "]" { errorHandling(() => {
            options.table.addExpression(options.expressionFactory.groupCall(table, group));
          }); }
  
Modifier
  = modType:ModifierType _ modifier:int { errorHandling(() => {
            options.expressionFactory.addGroupCallModifier(modType, toInt(`${modifier}`));
          }); }

ModifierType
  = $[=+-]

/* This are all supported functions from Tablesmith */
TsFunction
  = TSMathFunction
  / _ "{Bold~" text:PlainText "}"  { errorHandling(() => { 
            options.table.addExpression(options.expressionFactory.createBold(text));
          }); }
  / _ "{Line~" _ align:Align _ "," _ width:(@int _ "%")? _ "}" { errorHandling(() => {
            options.table.addExpression(options.expressionFactory.createLine(align, width));
          }); }
  / _ "{CR~" _ "}" { errorHandling(() => {
            options.table.addExpression(options.expressionFactory.createNewline());
          }); }

TSMathFunction
  = _ Dice _ MathExpression _ "}" { errorHandling(() => {
            options.table.addExpression(options.expressionFactory.createDice());
          }); }
  / _ Calc _ MathExpression _ "}" { errorHandling(() => { 
            options.table.addExpression(options.expressionFactory.createCalc());
          }); }
  / _ "{LastRoll~" _ "}" { errorHandling(() => {
            options.table.addExpression(options.expressionFactory.createLastRoll());
          }); }

Dice = "{Dice~"  { errorHandling(() => {
            options.expressionFactory.stackExpressionContext();
          }); }

Calc = "{Calc~"  { errorHandling(() => {
            options.expressionFactory.stackExpressionContext();
          }); }

MathExpression
  = MathTerm (_ MathSum _ MathTerm)*

MathSum
  = "+" { errorHandling(() => { 
            options.expressionFactory.addAddition();
          }); }
  / "-" { errorHandling(() => { 
            options.expressionFactory.addSubtraction();
          }); }

MathTerm
  = MathFactor (_ MathMult _ MathFactor)* 
  
MathMult
  = "d"  { errorHandling(() => {
            options.expressionFactory.addDice();
          }); }
  / "*" { errorHandling(() => { 
            options.expressionFactory.addMultiplication();
          }); }
  / "/" { errorHandling(() => { 
            options.expressionFactory.addDivision();
          }); }

MathFactor
  = TSMathFunction
  / OpenBracket _ MathExpression _ CloseBracket
  / _ number:int { errorHandling(() => {
            options.expressionFactory.addNumber(toInt(number));
          }); }
  / "%" tablename:(@Name ".")? varname:Name "%"{ errorHandling(() => {
            options.expressionFactory.addVariableGet(tablename, varname);
          }); }

OpenBracket
  = "(" { errorHandling(() => {
            options.expressionFactory.openBracket();
          }); }

CloseBracket
  = ")" { errorHandling(() => {
            options.expressionFactory.closeBracket();
          }); }

PlainText
 = $[^{}[\]\n]+

Align
 = $"center" / $"left" / $"right"

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