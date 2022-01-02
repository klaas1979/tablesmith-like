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
  = '%' name:Name '%,' value:PlainText? { errorHandling(() => {
            options.pf.declareVariable(name, value);
          }); }

/* A group is a subtable, all Tablesmith stuff starting with :Name to be called and rolled */
Group
  = GroupName GroupContent+

/* The name for a group, this is the name without dot. */
GroupName
  = [:]name:Name EmptyLine { errorHandling(() => {
            options.pf.addGroup(name);
          }); }

/* Range is a single line in a group donating the lower and upper end for the result, i.e. 1-2,Result */
GroupContent
  = RangeValue Expression+ EmptyLine?
  / BeforeValue Expression+ EmptyLine?
  / AfterValue Expression+ EmptyLine?

/* Only the range expression with the colon ',' */
RangeValue
  = (int __ '-' __)? up:int __ [,] { errorHandling(() => {
            options.pf.addRange(toInt(up));
          }); }

/* Only the before expression  */
BeforeValue
  = '<' _ { errorHandling(() => {
            options.pf.addBefore();
          }); }

/* Only the after expression  */
AfterValue
  = '>' _ { errorHandling(() => {
            options.pf.addAfter();
          }); }

VariableGet
  = '%' tablename:(@Name '.')? varname:VariableName '%' { errorHandling(() => {
            options.pf.createVariableGet(tablename, varname);
          }); }

VariableSet
  = VariableSetIdentifier tablename:(@Name '.')? varname:VariableName type:$[-+=*/\\<>&] VariableSetExpressions VariableSetIdentifier { errorHandling(() => {
            options.pf.createVariableSet(tablename, varname, type);
          }); }

VariableSetIdentifier
  = '|' { errorHandling(() => {
            options.pf.toggleVariableAssigment();
          }); }

/* The simplest Expression is a test value that is returned as is, without further processing. */
Value
  = text:PlainText { errorHandling(() => {
            options.pf.createText(text);
          }); }

/* Call of another group within this Table or within another. Table */
GroupFunction
  = '[' _ table:(@Name '.')? group:Name _ Modifier? _ ']' { errorHandling(() => {
            options.pf.createGroupCall(table, group);
          }); }
  
Modifier
  = modType:ModifierType _ modifier:int { errorHandling(() => {
            options.pf.addGroupCallModifier(modType, toInt(`${modifier}`));
          }); }

ModifierType
  = $[=+-]

/* This are all supported functions from Tablesmith */
TsFunction
  = TSConditionalFunctions
  / TSLogicalFunctions
  / TSMathFunction
  / GroupAndTableFunctions
  / TSFormatFunctions

TSConditionalFunctions
  = IfSlash _ BooleanExpression _ IfQuestionmark _ IfExpressionTextSlash _ (IfSlashSeparator _ IfExpressionTextSlash? _)? '}' { errorHandling(() => {
            options.pf.createIf();
          }); }
  / IfColon _ BooleanExpression _ IfQuestionmark _ IfExpressionTextColon _ (IfColonSeparator _ IfExpressionTextColon? _)?'}' { errorHandling(() => {
            options.pf.createIf();
          }); }
  / WhileStart _ WhileExpression _ BlockSeparator _ Expression _ '}' { errorHandling(() => {
            options.pf.createWhile();
          }); }
  / LoopStart _ LoopExpression _ BlockSeparator _ Expression _ '}' { errorHandling(() => {
            options.pf.createLoop();
          }); }
  / SelectStart _ SelectExpression _ (BlockSeparator _ SelectExpressionTextComma _)+ SelectExpressionTextComma? _ '}' { errorHandling(() => {
            options.pf.createSelect();
          }); }

WhileStart
  = '{While~' { errorHandling(() => {
            options.pf.startWhile();
          }); }

WhileExpression
  = IfExpressionPart (_ BooleanOperator _ IfExpressionPart)?

BlockSeparator
  = ',' { errorHandling(() => {
            options.pf.startIteratorBlock();
          }); }

LoopStart
  = '{' _ 'Loop~' { errorHandling(() => {
            options.pf.startLoop();
          }); }

LoopExpression
  = IfExpressionPart

SelectStart
  = '{' _ 'Select~' { errorHandling(() => {
            options.pf.startSelect();
          }); }

SelectExpression
  = IfExpressionPart

TSLogicalFunctions
  = StartLogicalExpression _ BooleanExpression _ LogicalExpressionSeparator _ BooleanExpression _ '}' { errorHandling(() => {
            options.pf.createLogicalExpression();
          }); }

StartLogicalExpression
  = '{' name:('Or' / 'And' / 'Xor') '~' { errorHandling(() => {
            options.pf.startLogicalExpression(name);
          }); }

LogicalExpressionSeparator
  = ',' { errorHandling(() => {
            options.pf.startNextBooleanExpression();
          }); }

IfSlash
  = '{' name:'If' '~' { errorHandling(() => {
            options.pf.startIf(name);

          }); }

IfColon
  = '{' name:'IIf' '~' { errorHandling(() => {
            options.pf.startIf(name);

          }); }

BooleanOperator
  = op:(@'!=' / @'<=' / @'>=' / @[=<>]) { errorHandling(() => {
            options.pf.setBooleanComparisonOperator(op);
          }); }

IfQuestionmark
  = '?' { errorHandling(() => {
            options.pf.startIfTrueValue();
          }); }

IfSlashSeparator
  = '/' { errorHandling(() => {
            options.pf.startIfFalseValue();
          }); }

IfColonSeparator
  = ':' { errorHandling(() => {
            options.pf.startIfFalseValue();
          }); }

/* Expressions are all supported values or results for a Range. The Tablesmith functions are defined here. */
Expression
  = GroupFunction Value? _ Expression*
  / TsFunction Value? _ Expression*
  / VariableGet Value? _ Expression*
  / VariableSet Value? _ Expression*
  / Value Expression*

/* Expressions that are allowed in a set Variable expression. */
VariableSetExpressions
  = GroupFunction VariableSetExpressions*
  / TsFunction VariableSetExpressions*
  / VariableGet VariableSetExpressions*
  / Value VariableSetExpressions*

BooleanExpression
  = IfExpressionPart _ BooleanOperator _ IfExpressionPart

/* Expressions that are allowed in the boolean part before the "?". */
IfExpressionPart
  = GroupFunction IfExpressionPart*
  / TsFunction IfExpressionPart*
  / VariableGet IfExpressionPart*
  / ValueIfPart IfExpressionPart*

/* Expressions that are allowed in true or false part after the "?" for a slash "/" If. */
IfExpressionTextSlash
  = GroupFunction IfExpressionTextSlash*
  / TsFunction IfExpressionTextSlash*
  / VariableGet IfExpressionTextSlash*
  / ValueIfSlash IfExpressionTextSlash*

/* Expressions that are allowed in true or false part after the "?" for a colon ":" If. */
IfExpressionTextColon
  = GroupFunction IfExpressionTextColon*
  / TsFunction IfExpressionTextColon*
  / VariableGet IfExpressionTextColon*
  / ValueIfColon IfExpressionTextColon*

/* Expressions that are allowed as value in a Select. */
SelectExpressionTextComma
  = GroupFunction SelectExpressionTextComma*
  / TsFunction SelectExpressionTextComma*
  / VariableGet SelectExpressionTextComma*
  / ValueSelect SelectExpressionTextComma*

ValueIfPart
  = text:PlainTextIfPart { errorHandling(() => {
            options.pf.createText(text);
          }); }

ValueIfSlash
  = text:PlainTextIfSlash { errorHandling(() => {
            options.pf.createText(text);
          }); }

ValueIfColon
  = text:PlainTextIfColon { errorHandling(() => {
            options.pf.createText(text);
          }); }

ValueSelect
  = text:PlainTextSelect { errorHandling(() => {
            options.pf.createText(text);
          }); }

GroupAndTableFunctions
  = '{' _ 'LastRoll~' _ '}' { errorHandling(() => {
            options.pf.createLastRoll();
          }); }

TSMathFunction
  = Dice _ MathExpression _ '}' { errorHandling(() => {
            options.pf.createDice();
          }); }
  / Calc _ MathExpression _ '}' { errorHandling(() => { 
            options.pf.createCalc();
          }); }
  / SingleParamMath

Dice = '{' _ 'Dice~'  { errorHandling(() => {
            options.pf.mathBuilder.stackExpressionContext();
          }); }

Calc = '{' _ 'Calc~'  { errorHandling(() => {
            options.pf.mathBuilder.stackExpressionContext();
          }); }

SingleParamMath
  = '{' _ SingleParamMathFunctions _ Expression _ '}' { errorHandling(() => {
            options.pf.createMathFunction();
          }); }

SingleParamMathFunctions
  = 'Abs~' { errorHandling(() => {
            options.pf.startMath('Abs');
          }); }
  / 'Ceil~' { errorHandling(() => {
            options.pf.startMath('Ceil');
          }); }
  / 'Floor~' { errorHandling(() => {
            options.pf.startMath('Floor');
          }); }

MathExpression
  = MathTerm (_ MathSum _ MathTerm)*

MathSum
  = '+' { errorHandling(() => { 
            options.pf.mathBuilder.addAddition();
          }); }
  / '-' { errorHandling(() => { 
            options.pf.mathBuilder.addSubtraction();
          }); }

MathTerm
  = MathFactor (_ MathMult _ MathFactor)* 
  
MathMult
  = 'd'  { errorHandling(() => {
            options.pf.mathBuilder.addDice();
          }); }
  / '*' { errorHandling(() => { 
            options.pf.mathBuilder.addMultiplication();
          }); }
  / '/' { errorHandling(() => { 
            options.pf.mathBuilder.addDivision();
          }); }

MathFactor
  = TSMathFunction
  / OpenBracket _ MathExpression _ ')' { errorHandling(() => {
            options.pf.mathBuilder.closeBracket();
          }); }
  / number:int { errorHandling(() => {
            options.pf.mathBuilder.addNumber(toInt(number));
          }); }
  / '%' tablename:(@Name '.')? varname:Name '%'{ errorHandling(() => {
            options.pf.mathBuilder.addVariableGet(tablename, varname);
          }); }

OpenBracket
  = '(' { errorHandling(() => {
            options.pf.mathBuilder.openBracket();
          }); }

TSFormatFunctions
  = _ StartBold Expression  '}' { errorHandling(() => { 
            options.pf.createBold();
          }); }
  / _ '{' _ 'Line~' _ align:Align _ ',' _ width:int? _ '}' { errorHandling(() => {
            options.pf.createLine(align, width);
          }); }
  / _ '{CR~' _ '}' { errorHandling(() => {
            options.pf.createNewline();
          }); }

StartBold
  = '{' _ 'Bold~' { errorHandling(() => { 
            options.pf.startBold();
          }); }

/** Matches all text that is printed verbose, without special chars that are key chars for the DSL. */
PlainText
 = $[^{}[\]%|\n]+

PlainTextIfPart
 = $[^!=<>,?/{}[\]%|\n]+

/** Text that is allowed within an If with slash "/" {If~}. */
PlainTextIfSlash
 = $[^/{}[\]%|\n]+

/** Text that is allowed within an If with colon ":" {IIf~}. */
 PlainTextIfColon
 = $[^:{}[\]%|\n]+

 /** Text that is allowed within an Select. */
 PlainTextSelect
 = $[^,{}[\]%|\n]+

Align
 = $'center' / $'left' / $'right'

/* Simple name without Dot or special characters. */
VariableName
  = $[a-z0-9_]i+

/* Simple name without Dot or special characters. */
Name
  = $[a-z0-9 _]i+

int
 = $([0-9]+)

/** A break within a before, after or Range of a group to make the table more human readable. */
_ 'Multi Line Whitespace with _'
= __ ([\n] '_' __)?

__ 'Whitspace'
  = [\t ]*

/* Stuff to ignore within a Table file. */
Ignore
  = EmptyLine* Comment* EmptyLine*

EmptyLine
 = _ [\n]

/* The only allowed comments in Tablesmith */
Comment
  = [#][^\n]*[\n]