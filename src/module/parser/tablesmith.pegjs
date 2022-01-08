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
  = type:[:;] repeat:'!'? name:Name EmptyLine { errorHandling(() => {
            let rangeAsProbability = type === ';';
            let nonRepeating = repeat === '!';
            options.pf.addGroup(name, rangeAsProbability, nonRepeating);
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
  = StartVariableGet VariableIdentifier '%' { errorHandling(() => {
            options.pf.createVariable();
          }); }
StartVariableGet
  = '%' { errorHandling(() => {
            options.pf.startVariable('get');
          }); }


VariableSet
  = StartVariableSet VariableIdentifier VariableSetType VariableSetExpressions '|' { errorHandling(() => {
            options.pf.createVariable();
          }); }
StartVariableSet
  = '|' { errorHandling(() => {
            options.pf.startVariable('set');
          }); }
VariableSetType
  = type:$[-+=*/\\<>&] { errorHandling(() => {
            options.pf.stackString(type);
            options.pf.stackParameter();
          }); }


/* Call of another group within this Table or within another. Table */
GroupCall
  = StartGroupCall _ VariableIdentifier _ Modifier? _ ']' { errorHandling(() => {
            options.pf.createGroupCall();
          }); }
StartGroupCall
  = '[' { errorHandling(() => {
            options.pf.startGroupCall();
          }); }
Modifier
  = modType:ModifierType _ modifier:int { errorHandling(() => {
            options.pf.stackString(modType);
            options.pf.stackString(modifier);
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
            options.pf.createFunction();
          }); }
  / IfColon _ BooleanExpression _ IfQuestionmark _ IfExpressionTextColon _ (IfColonSeparator _ IfExpressionTextColon? _)? '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / WhileStart _ WhileExpression _ ParamSeparatorComma _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / LoopStart _ LoopExpression _ ParamSeparatorComma _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / SelectStart _ SelectExpression _ (ParamSeparatorComma _ ExpressionTextNoComma _)+ ExpressionTextNoComma? _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }

WhileStart
  = '{' name:'While' '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }
WhileExpression
  = IfExpressionPart (_ BooleanOperator _ IfExpressionPart)?

LoopStart
  = '{' _ name:'Loop' '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }
LoopExpression
  = IfExpressionPart

SelectStart
  = '{' _ name:'Select' '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }
SelectExpression
  = IfExpressionPart

TSLogicalFunctions
  = StartLogicalExpression _ BooleanExpression (_ LogicalExpressionSeparator _ BooleanExpression)+ _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / IsNumber _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
StartLogicalExpression
  = '{' name:('Or' / 'And' / 'Xor') '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }
LogicalExpressionSeparator
  = ',' { errorHandling(() => {
            options.pf.stackParameter();
          }); }

IfSlash
  = '{' name:'If' '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }

IfColon
  = '{' name:'IIf' '~' { errorHandling(() => {
            options.pf.startFunction(name);

          }); }

BooleanOperator
  = op:(@'!=' / @'<=' / @'>=' / @[=<>]) { errorHandling(() => {
            options.pf.setBooleanComparisonOperator(op);
          }); }

IfQuestionmark
  = '?' { errorHandling(() => {
            options.pf.stackParameter();
          }); }

IfSlashSeparator
  = '/' { errorHandling(() => {
            options.pf.stackParameter();
          }); }

IfColonSeparator
  = ':' { errorHandling(() => {
            options.pf.stackParameter();
          }); }

IsNumber
  = '{' _ name:'IsNumber' '~'{ errorHandling(() => {
            options.pf.startFunction(name);
          }); }

/* Expressions are all supported values or results for a Range. The Tablesmith functions are defined here. */
Expression
  = GroupCall Value? _ Expression*
  / TsFunction Value? _ Expression*
  / VariableGet Value? _ Expression*
  / VariableSet Value? _ Expression*
  / Value Expression*

/* Expressions that are allowed in a set Variable expression. */
VariableSetExpressions
  = GroupCall VariableSetExpressions*
  / TsFunction VariableSetExpressions*
  / VariableGet VariableSetExpressions*
  / Value VariableSetExpressions*

BooleanExpression
  = IfExpressionPart _ BooleanOperator _ IfExpressionPart

/* Expressions that are allowed in the boolean part before the "?". */
IfExpressionPart
  = GroupCall IfExpressionPart*
  / TsFunction IfExpressionPart*
  / VariableGet IfExpressionPart*
  / ValueIfPart IfExpressionPart*


VariableIdentifier
  = GroupCall VariableIdentifier*
  / TsFunction VariableIdentifier*
  / VariableGet VariableIdentifier*
  / ValueVariableIdentifier VariableIdentifier*

/* Expressions that are allowed in true or false part after the "?" for a slash "/" If. */
IfExpressionTextSlash
  = GroupCall IfExpressionTextSlash*
  / TsFunction IfExpressionTextSlash*
  / VariableGet IfExpressionTextSlash*
  / ValueIfSlash IfExpressionTextSlash*

/* Expressions that are allowed in true or false part after the "?" for a colon ":" If. */
IfExpressionTextColon
  = GroupCall IfExpressionTextColon*
  / TsFunction IfExpressionTextColon*
  / VariableGet IfExpressionTextColon*
  / ValueIfColon IfExpressionTextColon*

/* Expressions where text is not matching "," that are allowed as value in a Select. */
ExpressionTextNoComma
  = GroupCall ExpressionTextNoComma*
  / TsFunction ExpressionTextNoComma*
  / VariableGet ExpressionTextNoComma*
  / ValueNoComma ExpressionTextNoComma*

/* Expressions where text is not matching "," that are allowed as value in a Select. */
ExpressionTextNoCommaNorPower
  = GroupCall ExpressionTextNoCommaNorPower*
  / TsFunction ExpressionTextNoCommaNorPower*
  / VariableGet ExpressionTextNoCommaNorPower*
  / ValueNoCommaNorPower ExpressionTextNoCommaNorPower*

GroupAndTableFunctions
  = GroupAndTableFunctionsZeroParams _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / GroupAndTableFunctionsOneParam _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / GroupAndTableFunctionsManyParams _ ExpressionTextNoComma _ (GroupLockParameter)+ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }

GroupAndTableFunctionsZeroParams
  = '{' _ name:'LastRoll' '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }

GroupAndTableFunctionsOneParam
  = '{' _ name:(@'Reset' / @'Count') '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }

GroupAndTableFunctionsManyParams
  = '{' _ name:(@'Unlock' / @'Lockout' / @'MaxVal' / @'MinVal') '~' { errorHandling(() => {
            options.pf.startFunction(name);
          }); }

GroupLockParameter
  = ParamSeparatorComma _ ExpressionTextNoComma _ 

ParamSeparatorComma
  = ',' { errorHandling(() => {
            options.pf.stackParameter();
          }); }

TSMathFunction
  = Dice _ MathExpression _ '}' { errorHandling(() => {
            options.pf.createDice();
          }); }
  / Calc _ MathExpression _ '}' { errorHandling(() => { 
            options.pf.createCalc();
          }); }
  / MathOneParamFunctions
  / MathTwoParamFunctions
  / MathPowerFunction // has '^' as separator in TS definition

Dice = '{' _ 'Dice~'  { errorHandling(() => {
            options.pf.mathBuilder.stackExpressionContext();
          }); }

Calc = '{' _ 'Calc~'  { errorHandling(() => {
            options.pf.mathBuilder.stackExpressionContext();
          }); }

MathOneParamFunctions
  = '{' _ MathOneParamFunctionsNames _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }

MathTwoParamFunctions
  = '{' _ MathTwoParamFunctionsNames _ ExpressionTextNoComma _ MathParamSeparator _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }

MathOneParamFunctionsNames
  = 'Abs~' { errorHandling(() => {
            options.pf.startFunction('Abs');
          }); }
  / 'Ceil~' { errorHandling(() => {
            options.pf.startFunction('Ceil');
          }); }
  / 'Floor~' { errorHandling(() => {
            options.pf.startFunction('Floor');
          }); }
  / 'Trunc~' { errorHandling(() => {
            options.pf.startFunction('Trunc');
          }); }
  / 'Sqrt~' { errorHandling(() => {
            options.pf.startFunction('Sqrt');
          }); }

MathTwoParamFunctionsNames
  = 'Round~' { errorHandling(() => {
            options.pf.startFunction('Round');
          }); }
  / 'Min~' { errorHandling(() => {
            options.pf.startFunction('Min');
          }); }
  / 'Max~' { errorHandling(() => {
            options.pf.startFunction('Max');
          }); }
  / 'Mod~' { errorHandling(() => {
            options.pf.startFunction('Mod');
          }); }

MathPowerFunction
  = '{' _ MathPower _ ValueNoCommaNorPower _ MathPowerSeparator _ Expression _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }

MathPower = 'Power~' { errorHandling(() => {
            options.pf.startFunction('Power');
          }); }

MathPowerSeparator = [,^] { errorHandling(() => { // has only '^' in definition but use both for convenience
            options.pf.stackParameter();
          }); }

MathParamSeparator
  = ','  { errorHandling(() => {
            options.pf.stackParameter();
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
            options.pf.createFunction();
          }); }
  / _ StartLine _ ExpressionTextNoComma _ ParamSeparatorComma _ ExpressionTextNoComma _ '}' { errorHandling(() => {
            options.pf.createFunction();
          }); }
  / _ '{' _ name:'CR' '~' _ '}' { errorHandling(() => {
            options.pf.startFunction(name);
            options.pf.createFunction();
          }); }

StartBold
  = '{' _ name:'Bold' '~' { errorHandling(() => { 
            options.pf.startFunction(name);
          }); }

StartLine
  = '{' _ name:'Line' '~' { errorHandling(() => { 
            options.pf.startFunction(name);
          }); }

/* The simplest Expression is a test value that is returned as is, without further processing. */
Value
  = text:PlainText { errorHandling(() => {
            options.pf.createText(text);
          }); }
/** Matches all text that is printed verbose, without special chars that are key chars for the DSL. */
PlainText
 = $[^{}[\]%|\n]+

ValueIfPart
  = text:PlainTextIfPart { errorHandling(() => {
            options.pf.createText(text);
          }); }

PlainTextIfPart
 = $[^!=<>,?/{}[\]%|\n]+

ValueVariableIdentifier
  = text:PlainTextSetExpression { errorHandling(() => {
            options.pf.createText(text);
          }); }

PlainTextSetExpression
 = $[^-+\\*&!=<>,?/{}[\]%|\n]+

ValueIfSlash
  = text:PlainTextIfSlash { errorHandling(() => {
            options.pf.createText(text);
          }); }

/** Text that is allowed within an If with slash "/" {If~}. */
PlainTextIfSlash
 = $[^/{}[\]%|\n]+

ValueIfColon
  = text:PlainTextIfColon { errorHandling(() => {
            options.pf.createText(text);
          }); }

/** Text that is allowed within an If with colon ":" {IIf~}. */
 PlainTextIfColon
 = $[^:{}[\]%|\n]+

ValueNoComma
  = text:PlainTextNoComma { errorHandling(() => {
            options.pf.createText(text);
          }); }

 /** Text that is allowed within an selections where a comma ',' happens. */
 PlainTextNoComma
 = $[^,{}[\]%|\n]+

ValueNoCommaNorPower
  = text:PlainTextNoCommaNorPower { errorHandling(() => {
            options.pf.createText(text);
          }); }

/** Text that is allowed within an selections where a comma ',' or power '^' happens. */
PlainTextNoCommaNorPower
 = $[^^,{}[\]%|\n]+

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