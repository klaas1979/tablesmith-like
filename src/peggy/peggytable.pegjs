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
      const start = loc.start.offset;
      let end = loc.end.offset;
      if (end - start > 200) {
        end = start + 200;
      }
      const content = input.substring(start, end);
      const after = input.substring(loc.end.offset, Math.max(input.length, loc.end.offset + 15));
      const errorLocation = `Lines from ${loc.start.line} to ${loc.end.line}', columns from ${loc.start.column} to ${loc.end.column}, FileOffset from ${loc.start.offset} to ${loc.end.offset} \nText:>>>>\n${before}||>|${content}|<||${after}\n<<<<`;
      throw `Error '${actionError}' at location '${errorLocation}'`;
    }
  }
}

/* A Tablesmith file as starting point, it is called Table */
Table
  = (Ignore / TableContent)+

/** Content allowed in Table in general are variables or groups */
TableContent
  = VariableDeclaration
  / ParameterDeclaration
  / Group

VariableDeclaration
  = !'/' '%' name:Name '%,' value:PlainText? { errorHandling(() => {
            options?.pf.declareVariable(name, value);
          }); }

ParameterDeclaration
  = '@' multi:(@'*')? name:Name ',' _ defVal:ParamOption ',' _ prompt:ParamOption tail:(_ ',' _ @ParamOption)* { errorHandling(() => {
            options?.pf.declareParameter(name, defVal, prompt, multi == '*', tail);
          }); }

/* A group is a subtable, all Tablesmith stuff starting with :Name to be called and rolled */
Group
  = GroupName GroupContent+
/* The name for a group, this is the name without dot. */
GroupName
  = type:[:;] repeat:'!'? name:Name EmptyLine { errorHandling(() => {
            let rangeAsProbability = type === ';';
            let nonRepeating = repeat === '!';
            options?.pf.addGroup(name, rangeAsProbability, nonRepeating);
          }); }


/* Range is a single line in a group donating the lower and upper end for the result, i.e. 1-2,Result */
GroupContent
  = RangeValue Expression+ EmptyLine?
  / BeforeValue Expression+ EmptyLine?
  / AfterValue Expression+ EmptyLine?
  / Ignore
/* Only the range expression with the colon ',' */
RangeValue
  = (int __ '-' __)? up:int __ [,] { errorHandling(() => {
            options?.pf.addRange(toInt(up));
          }); }
/* Only the before expression  */
BeforeValue
  = '<' _ { errorHandling(() => {
            options?.pf.addBefore();
          }); }
/* Only the after expression  */
AfterValue
  = '>' _ { errorHandling(() => {
            options?.pf.addAfter();
          }); }


VariableGet
  = StartVariableGet VariableIdentifier '%' { errorHandling(() => {
            options?.pf.createVariable();
          }); }
StartVariableGet
  = !'/' '%' { errorHandling(() => {
            options?.pf.startVariable('get');
          }); }


VariableSet
  = StartVariableSet VariableIdentifier VariableSetType VariableSetExpressions '|' { errorHandling(() => {
            options?.pf.createVariable();
          }); }
StartVariableSet
  = '|' { errorHandling(() => {
            options?.pf.startVariable('set');
          }); }
VariableSetType
  = type:$[-+=*/\\<>&] { errorHandling(() => {
            options?.pf.stackString(type);
            options?.pf.stackParameter();
          }); }


/* Call of another group within this Table or within another. Table */
GroupCall
  = StartGroupCall _ VariableIdentifier _ Modifier? _ CallParameters? _ !'/' ']' { errorHandling(() => {
            options?.pf.createGroupCall();
          }); }
StartGroupCall
  = !'/' '[' { errorHandling(() => {
            options?.pf.startGroupCall();
          }); }
Modifier
  = modType:ModifierType _ modifier:int { errorHandling(() => {
            options?.pf.stackString(modType);
            options?.pf.stackString(modifier);
          }); }
ModifierType
  = $[=+-]
CallParameters
  = StartCallParams _ ExpressionTextNoCommaNorCurlyBraces _ (ParamSeparatorComma _ ExpressionTextNoCommaNorCurlyBraces)* _ ')'
StartCallParams
  = '(' { errorHandling(() => {
            options?.pf.stackParameter();
          }); }

/* This are all supported functions from Tablesmith */
TsFunction
  = TSMathFunction
  / IfSlash _ BooleanExpression _ IfQuestionmark _ IfExpressionTextSlash _ (IfSlashSeparator _ IfExpressionTextSlash? _)? '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / IfColon _ BooleanExpression _ IfQuestionmark _ IfExpressionTextColon _ (IfColonSeparator _ IfExpressionTextColon? _)? '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / WhileStart _ WhileExpression _ ParamSeparatorComma _ Expression _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / LoopStart _ LoopExpression _ ParamSeparatorComma _ Expression _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / SelectStart _ SelectExpression _ (ParamSeparatorComma _ ExpressionTextNoComma _)+ ExpressionTextNoComma? _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / StartLogicalExpression _ BooleanExpression (_ ParamSeparatorComma _ BooleanExpression)+ _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsZeroParams _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsOneParam _ Expression _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsTwoParams _ ExpressionTextNoComma _ ParamSeparatorComma _ ExpressionTextNoComma _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsManyParams _ ExpressionTextNoComma _ (GroupLockParameter)+ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

WhileStart
  = '{' name:'While' '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }
WhileExpression
  = IfExpressionPart (_ BooleanOperator _ IfExpressionPart)?

LoopStart
  = '{' _ name:'Loop' '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }
LoopExpression
  = IfExpressionPart

SelectStart
  = '{' _ name:'Select' '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }
SelectExpression
  = IfExpressionPart

StartLogicalExpression
  = '{' name:(@'Or' / @'And' / @'Xor') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

IfSlash
  = '{' name:'If' '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

IfColon
  = '{' name:'IIf' '~' { errorHandling(() => {
            options?.pf.startFunction(name);

          }); }

BooleanOperator
  = op:(@'!=' / @'<=' / @'>=' / @[=<>]) { errorHandling(() => {
            options?.pf.setBooleanComparisonOperator(op);
          }); }

IfQuestionmark
  = '?' { errorHandling(() => {
            options?.pf.stackParameter();
          }); }

IfSlashSeparator
  = '/' { errorHandling(() => {
            options?.pf.stackParameter();
          }); }

IfColonSeparator
  = ':' { errorHandling(() => {
            options?.pf.stackParameter();
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

ExpressionTextNoCommaNorPower
  = GroupCall ExpressionTextNoCommaNorPower*
  / TsFunction ExpressionTextNoCommaNorPower*
  / VariableGet ExpressionTextNoCommaNorPower*
  / ValueNoCommaNorPower ExpressionTextNoCommaNorPower*

ExpressionTextNoCommaNorCurlyBraces
  = GroupCall ExpressionTextNoCommaNorCurlyBraces*
  / TsFunction ExpressionTextNoCommaNorCurlyBraces*
  / VariableGet ExpressionTextNoCommaNorCurlyBraces*
  / ValueNoCommaNorCurlyBraces ExpressionTextNoCommaNorCurlyBraces*

FunctionsZeroParams
  = '{' _ name:(@'CR' / @'LastRoll') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsOneParam
  = '{' _ name:(@'Bold' / @'Count' / @'IsNumber' / @'Reset') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsTwoParams
  = '{' _ name:(@'Line' / @'Param') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsManyParams
  = '{' _ name:(@'Unlock' / @'Lockout' / @'MaxVal' / @'MinVal') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

GroupLockParameter
  = ParamSeparatorComma _ ExpressionTextNoComma _ 

ParamSeparatorComma
  = ',' { errorHandling(() => {
            options?.pf.stackParameter();
          }); }

TSMathFunction
  = Dice _ MathExpression _ '}' { errorHandling(() => {
            options?.pf.createDice();
          }); }
  / Calc _ MathExpression _ '}' { errorHandling(() => { 
            options?.pf.createCalc();
          }); }
  / MathOneParamFunctions
  / MathTwoParamFunctions
  / MathManyParamFunctions
  / MathPowerFunction // has '^' as separator in TS definition

Dice = '{' _ 'Dice~'  { errorHandling(() => {
            options?.pf.mathBuilder.stackExpressionContext();
          }); }

Calc = '{' _ 'Calc~'  { errorHandling(() => {
            options?.pf.mathBuilder.stackExpressionContext();
          }); }

MathOneParamFunctions
  = '{' _ MathOneParamFunctionsNames _ Expression _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathTwoParamFunctions
  = '{' _ MathTwoParamFunctionsNames _ ExpressionTextNoComma _ ParamSeparatorComma _ Expression _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathManyParamFunctions
  = '{' _ MathManyParamFunctionsNames _ ExpressionTextNoComma _ (ParamSeparatorComma _ ExpressionTextNoComma)+ _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathOneParamFunctionsNames
  = name:(@'Abs' / @'Ceil' / @'Floor' / @'Trunc' / @'Sqrt') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathTwoParamFunctionsNames
  = name:(@'Round' / @'Mod') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathManyParamFunctionsNames
  = name:(@'Min' / @'Max') '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathPowerFunction
  = '{' _ MathPower _ ValueNoCommaNorPower _ MathPowerSeparator _ Expression _ '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathPower = name:'Power' '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathPowerSeparator = [,^] { errorHandling(() => { // has only '^' in definition but use both for convenience
            options?.pf.stackParameter();
          }); }

MathExpression
  = MathTerm (_ MathSum _ MathTerm)*

MathSum
  = '+' { errorHandling(() => { 
            options?.pf.mathBuilder.addAddition();
          }); }
  / '-' { errorHandling(() => { 
            options?.pf.mathBuilder.addSubtraction();
          }); }

MathTerm
  = MathFactor (_ MathMult _ MathFactor)* 
  
MathMult
  = 'd'  { errorHandling(() => {
            options?.pf.mathBuilder.addDice();
          }); }
  / '*' { errorHandling(() => { 
            options?.pf.mathBuilder.addMultiplication();
          }); }
  / '/' { errorHandling(() => { 
            options?.pf.mathBuilder.addDivision();
          }); }

MathFactor
  = TSMathFunction
  / OpenBracket _ MathExpression _ ')' { errorHandling(() => {
            options?.pf.mathBuilder.closeBracket();
          }); }
  / number:int { errorHandling(() => {
            options?.pf.mathBuilder.addNumber(toInt(number));
          }); }
  / !'/' '%' tablename:(@Name '.')? varname:Name '%'{ errorHandling(() => {
            options?.pf.mathBuilder.addVariableGet(tablename, varname);
          }); }

OpenBracket
  = '(' { errorHandling(() => {
            options?.pf.mathBuilder.openBracket();
          }); }

 /** Text that is allowed within an selections where a comma ',' happens. */
ParamOption
 = $[^,\n]+

/* The simplest Expression is a test value that is returned as is, without further processing. */
Value
  = text:PlainText { errorHandling(() => {
            options?.pf.createText(text);
          }); }
/** Matches all text that is printed verbose, without special chars that are key chars for the DSL. */
PlainText
 = text:(@[^{}[\]%|/\n] / '/' @'%' / '/' @'[' / '/' @']' / @'/')+ { return text.join(''); }

ValueIfPart
  = text:PlainTextIfPart { errorHandling(() => {
            options?.pf.createText(text);
          }); }

PlainTextIfPart
 = text:(@[^!=<>,?/{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / @'/')+ { return text.join(''); }

ValueVariableIdentifier
  = text:PlainTextVariableExpression { errorHandling(() => {
            options?.pf.createText(text);
          }); }

PlainTextVariableExpression
 = text:([^-+\\*&!=<>,?/(){}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']')+ { return text.join(''); }

ValueIfSlash
  = text:PlainTextIfSlash { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an If with slash "/" {If~}. */
PlainTextIfSlash
 = text:([^/{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']')+ { return text.join(''); }

ValueIfColon
  = text:PlainTextIfColon { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an If with colon ":" {IIf~}. */
 PlainTextIfColon
 = text:([^:{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / @'/')+ { return text.join(''); }

ValueNoComma
  = text:PlainTextNoComma { errorHandling(() => {
            options?.pf.createText(text);
          }); }

 /** Text that is allowed within an selections where a comma ',' happens. */
 PlainTextNoComma
 = text:([^,{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / @'/')+ { return text.join(''); }

ValueNoCommaNorPower
  = text:PlainTextNoCommaNorPower { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an selections where a comma ',' or power '^' happens. */
PlainTextNoCommaNorPower
 = text:([^^,{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / @'/')+ { return text.join(''); }

 ValueNoCommaNorCurlyBraces
  = text:PlainTextNoCommaNorCurlyBraces { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an selections where a comma ',' or power '()' happens. */
PlainTextNoCommaNorCurlyBraces
 = text:([^,(){}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / @'/')+ { return text.join(''); }

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
  = (EmptyLine / Comment)+

EmptyLine
 = _ [\n]

/* The only allowed comments in Tablesmith */
Comment
  = [#][^\n]*[\n]