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
      const before = input.substring(Math.max(0, loc.start.offset - 100), loc.start.offset);
      const start = loc.start.offset;
      let end = loc.end.offset;
      let content = input.substring(start, end);
      if (end - start > 200) {
        content = input.substring(start, start + 100) + '||<||stripped||>||' + input.substring(end - 100, end);
      }
      const after = input.substring(loc.end.offset, Math.min(input.length, loc.end.offset + 100));
      const errorLocation = `Lines from ${loc.start.line} to ${loc.end.line}', columns from ${loc.start.column} to ${loc.end.column}, FileOffset from ${loc.start.offset} to ${loc.end.offset} \nText:>>>>\n${before}||>|${content}|<||${after}\n<<<<`;
      throw Error(`Error '${actionError}' at location '${errorLocation}'`);
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
  = type:[:;] repeat:'!'? name:Name LineEnd { errorHandling(() => {
            let rangeAsProbability = type === ';';
            let nonRepeating = repeat === '!';
            options?.pf.addGroup(name, rangeAsProbability, nonRepeating);
          }); }


/* Range is a single line in a group donating the lower and upper end for the result, i.e. 1-2,Result */
GroupContent
  = RangeValue Expression+ LineEnd?
  / BeforeValue Expression+ LineEnd?
  / AfterValue Expression+ LineEnd?
  / Comment
/* Only the range expression with the colon ',' */
RangeValue
  = (int __ '-' __)? up:int __ [,] { errorHandling(() => {
            options?.pf.addRange(toInt(up));
          }); }
/* Only the before expression  */
BeforeValue
  = '<' { errorHandling(() => {
            options?.pf.addBefore();
          }); }
/* Only the after expression  */
AfterValue
  = '>' { errorHandling(() => {
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
  = StartGroupCall _ GroupIdentifier _ Modifier? _ CallParameters? _ !'/' ']' { errorHandling(() => {
            options?.pf.createGroupCall();
          }); }
StartGroupCall
// ignore ~ reload toggle for the moment
  = !'/' '[' rerollable:'~'? { errorHandling(() => {
            options?.pf.startGroupCall(rerollable === '~');
          }); }
Modifier
  = modType:ModifierType _ Expression { errorHandling(() => {
            options?.pf.stackString(modType);
          }); }
ModifierType
  = type:[=+-] { errorHandling(() => {
            options?.pf.stackParameter();
          });
          return type; }
CallParameters
  = StartCallParams _ ExpressionTextNoCommaNorCurlyBraces _ (ParamSeparatorComma _ ExpressionTextNoCommaNorCurlyBraces)* _ ')'
StartCallParams
  = '(' { errorHandling(() => {
            options?.pf.stackParameter();
          }); }

/* This are all supported functions from Tablesmith */
TsFunction
  = TSMathFunction
  / IfSlash _ BooleanExpression _ IfQuestionmark _ IfExpressionTextSlash _ (IfSlashSeparator _ IfExpressionTextSlash? _)? !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / IfColon _ BooleanExpression _ IfQuestionmark _ IfExpressionTextColon _ (IfColonSeparator _ IfExpressionTextColon? _)? !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / WhileStart _ WhileExpression _ ParamSeparatorComma _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / LoopStart _ IfExpressionPart _ ParamSeparatorComma _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / SelectStart _ IfExpressionPart _ (ParamSeparatorComma _ ExpressionTextNoComma _)+ ExpressionTextNoComma? _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / StartLogicalExpression _ BooleanExpression (_ ParamSeparatorComma _ BooleanExpression)+ _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsZeroParams _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsOneParam _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsTwoParams _ ExpressionTextNoComma _ ParamSeparatorComma _ ExpressionTextNoComma _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsThreeParams _ ExpressionTextNoComma _ ParamSeparatorComma _ ExpressionTextNoComma _ ParamSeparatorComma _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / FunctionsManyParams _ ExpressionTextNoComma _ (GroupLockParameter)+ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / SplitStart _ ExpressionTextNoComma _ ParamSeparatorComma _ ExpressionTextQuotation _ (GroupLockParameter)+ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / DSFindStart _ ExpressionTextNoComma _ ParamSeparatorComma _ ExpressionTextNoComma _ ParamSeparatorComma _ BooleanExpression _ (_ ParamSeparatorComma _ BooleanExpression _ )* !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

DSFindStart
  = !'/' '{' name:'DSFind'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

SplitStart
  = !'/' '{' name:'Split'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

WhileStart
  = !'/' '{' name:'While'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }
WhileExpression
  = IfExpressionPart (_ BooleanOperator _ IfExpressionPart)?

LoopStart
  = !'/' '{' _ name:'Loop'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

SelectStart
  = !'/' '{' _ name:'Select'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

StartLogicalExpression
  = !'/' '{' name:(@'Or'i / @'And'i / @'Xor'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

IfSlash
  = !'/' '{' name:'If'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

IfColon
  = !'/' '{' name:'IIf'i '~' { errorHandling(() => {
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
  = _ GroupCall Value? Expression*
  / _ TsFunction Value? Expression*
  / _ VariableGet Value? Expression*
  / _ VariableSet Value? Expression*
  / _ Value Expression*

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
  / VariableSet IfExpressionPart*
  / ValueIfPart IfExpressionPart*

GroupIdentifier
  = GroupCall GroupIdentifier*
  / TsFunction GroupIdentifier*
  / VariableGet GroupIdentifier*
  / VariableSet GroupIdentifier*
  / ValueGroupIdentifier GroupIdentifier*

  VariableIdentifier
  = GroupCall VariableIdentifier*
  / TsFunction VariableIdentifier*
  / ValueVariableIdentifier VariableIdentifier*

/* Expressions that are allowed in true or false part after the "?" for a slash "/" If. */
IfExpressionTextSlash
  = GroupCall IfExpressionTextSlash*
  / TsFunction IfExpressionTextSlash*
  / VariableGet IfExpressionTextSlash*
  / VariableSet IfExpressionTextSlash*
  / ValueIfSlash IfExpressionTextSlash*

/* Expressions that are allowed in true or false part after the "?" for a colon ":" If. */
IfExpressionTextColon
  = GroupCall IfExpressionTextColon*
  / TsFunction IfExpressionTextColon*
  / VariableGet IfExpressionTextColon*
  / VariableSet IfExpressionTextColon*
  / ValueIfColon IfExpressionTextColon*

/* Expressions where text is not matching "," that are allowed as value in a Select. */
ExpressionTextNoComma
  = GroupCall ExpressionTextNoComma*
  / TsFunction ExpressionTextNoComma*
  / VariableGet ExpressionTextNoComma*
  / VariableSet ExpressionTextNoComma*
  / ValueNoComma ExpressionTextNoComma*

/* Expressions where text is not matching "," that are allowed as value in a Select. */
ExpressionTextQuotation
  = GroupCall ExpressionTextQuotation*
  / TsFunction ExpressionTextQuotation*
  / VariableGet ExpressionTextQuotation*
  / VariableSet ExpressionTextQuotation*
  / ValueQuotation ExpressionTextQuotation*

ExpressionTextNoCommaNorPower
  = GroupCall ExpressionTextNoCommaNorPower*
  / TsFunction ExpressionTextNoCommaNorPower*
  / VariableGet ExpressionTextNoCommaNorPower*
  / VariableSet ExpressionTextNoCommaNorPower*
  / ValueNoCommaNorPower ExpressionTextNoCommaNorPower*

ExpressionTextNoCommaNorCurlyBraces
  = GroupCall ExpressionTextNoCommaNorCurlyBraces*
  / TsFunction ExpressionTextNoCommaNorCurlyBraces*
  / VariableGet ExpressionTextNoCommaNorCurlyBraces*
  / VariableSet ExpressionTextNoCommaNorCurlyBraces*
  / ValueNoCommaNorCurlyBraces ExpressionTextNoCommaNorCurlyBraces*

FunctionsZeroParams
  = !'/' '{' _ name:(@'CR'i / @'LastRoll'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsOneParam
  = !'/' '{' _ name:(@'AorAn'i / @'Bold'i / @'CapEachWord'i / @'Cap'i / @'Count'i / @'DSCount'i / @'DSRandomize'i
  / @'IsNumber'i / @'Italic'i / @'LCase'i / @'Length'i / @'Msg'i / @'Note'i / @'Picture'i / @'Reset'i
  / @'Status'i / @'Trim'i / @'UCase'i / @'VowelStart'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsTwoParams
  = !'/' '{' _ name:(@'Char'i / @'Color'i / @'DSRead'i / @'DSRemove'i / @'DSWrite'i
  / @'InputText'i / @'Line'i / @'Left'i / @'Param'i / @'Right'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsThreeParams
  = !'/' '{' _ name:(@'CommaReplace'i / @'DSCalc'i / @'DSGet'i / @'Find'i / @'Generate'i / @'Mid'i
  / @'Replace'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

FunctionsManyParams
  = !'/' '{' _ name:(@'DSAddNR'i / @'DSAdd'i / @'DSCreate'i / @'DSReadOrCreate'i / @'DSSet'i
  / @'InputList'i / @'Lockout'i / @'MaxVal'i / @'MinVal'i / @'Unlock'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

GroupLockParameter
  = ParamSeparatorComma _ ExpressionTextNoComma _ 

ParamSeparatorComma
  = ',' { errorHandling(() => {
            options?.pf.stackParameter();
          }); }

TSMathFunction
  = DiceOrCalc _ MathExpression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }
  / MathOneParamFunctions
  / MathTwoParamFunctions
  / MathManyParamFunctions
  / MathPowerFunction // has '^' as separator in TS definition

DiceOrCalc = !'/' '{' _ name:(@'Dice'i / @'Calc'i) '~'  { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathOneParamFunctions
  = !'/' '{' _ MathOneParamFunctionsNames _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathTwoParamFunctions
  = !'/' '{' _ MathTwoParamFunctionsNames _ ExpressionTextNoComma _ ParamSeparatorComma _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathManyParamFunctions
  = !'/' '{' _ MathManyParamFunctionsNames _ ExpressionTextNoComma _ (ParamSeparatorComma _ ExpressionTextNoComma)+ _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathOneParamFunctionsNames
  = name:(@'Abs'i / @'Ceil'i / @'Floor'i / @'Trunc'i / @'Sqrt'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathTwoParamFunctionsNames
  = name:(@'Round'i / @'Mod'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathManyParamFunctionsNames
  = name:(@'Min'i / @'Max'i) '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathPowerFunction
  = !'/' '{' _ MathPower _ ValueNoCommaNorPower _ MathPowerSeparator _ Expression _ !'/' '}' { errorHandling(() => {
            options?.pf.createFunction();
          }); }

MathPower = name:'Power'i '~' { errorHandling(() => {
            options?.pf.startFunction(name);
          }); }

MathPowerSeparator = [,^] { errorHandling(() => { // has only '^' in definition but use both for convenience
            options?.pf.stackParameter();
          }); }

MathExpression
  = MathTerm (_ MathSum _ MathTerm)*  { errorHandling(() => { 
            options?.pf.createMathSum();
          }); }

MathSum
  = op:(@'+' / @'-') { errorHandling(() => { 
            options?.pf.addMathTerm(op);
          }); }

MathTerm
  = MathFactor (_ MathMult _ MathFactor)* { errorHandling(() => { 
            options?.pf.createMathMult();
          }); }
  
MathMult
  = op:(@'d'i / @'*' / @'/') { errorHandling(() => { 
            options?.pf.addMathTerm(op);
          }); }

MathFactor
  = OpenBracket _ MathExpression _ ')' { errorHandling(() => {
            options?.pf.closeBracket();
          }); }
  / MathFactorExpression

MathFactorExpression
  = _ GroupCall MathFactorExpression*
  / _ TsFunction  MathFactorExpression*
  / _ VariableGet MathFactorExpression*
  / _ ValueMathFactorExpression MathFactorExpression*

OpenBracket
  = '(' { errorHandling(() => {
            options?.pf.openBracket();
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
 = text:([^{}[\]%|/\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ { return text.join(''); }

ValueIfPart
  = text:PlainTextIfPart { errorHandling(() => {
            options?.pf.createText(text);
          }); }

PlainTextIfPart
 = text:([^!=<>,?/{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ { return text.join(''); }

ValueVariableIdentifier
  = text:PlainTextVariableExpression { errorHandling(() => {
            options?.pf.createText(text);
          }); }

PlainTextVariableExpression
 = text:([^-+\\*&.=<>,?/(){}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}')+ { return text.join(''); }

 ValueGroupIdentifier
  = text:PlainTextGroupExpression { errorHandling(() => {
            options?.pf.createText(text);
          }); }

PlainTextGroupExpression
 = text:([^-+\\*&!=<>,?/(){}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}')+ { return text.join(''); }

ValueMathFactorExpression
  = text:PlainTextValueMathFactorExpression { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an If with slash "/", no escaped chars, because escape
sign is the same as the separator for If {If~}. */
PlainTextValueMathFactorExpression
 = text:[0-9]+ { return text.join(''); }

ValueIfSlash
  = text:PlainTextIfSlash { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an If with slash "/", no escaped chars, because escape
sign is the same as the separator for If {If~}. */
PlainTextIfSlash
 = text:([^/{}[\]%|\n])+ { return text.join(''); }

ValueIfColon
  = text:PlainTextIfColon { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an If with colon ":" {IIf~}. */
 PlainTextIfColon
 = text:([^:/{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ { return text.join(''); }

ValueNoComma
  = text:PlainTextNoComma { errorHandling(() => {
            options?.pf.createText(text);
          }); }

 /** Text that is allowed within an selections where a comma ',' happens. */
 PlainTextNoComma
 = text:([^,/{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ { return text.join(''); }

ValueQuotation
  = text:PlainTextQuotation { errorHandling(() => {
            options?.pf.createText(text);
          }); }

 /** Text that is allowed within an selections where a comma ',' happens. */
 PlainTextQuotation
 = '"' text:([^/"{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ '"' { return text.join(''); }

ValueNoCommaNorPower
  = text:PlainTextNoCommaNorPower { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an selections where a comma ',' or power '^' happens. */
PlainTextNoCommaNorPower
 = text:([^^,/{}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ { return text.join(''); }

 ValueNoCommaNorCurlyBraces
  = text:PlainTextNoCommaNorCurlyBraces { errorHandling(() => {
            options?.pf.createText(text);
          }); }

/** Text that is allowed within an selections where a comma ',' or power '()' happens. */
PlainTextNoCommaNorCurlyBraces
 = text:([^,(){}[\]%|\n] / '/' @'%' / '/' @'[' / '/' @']' / '/' @'{' / '/' @'}' / @'/')+ { return text.join(''); }

/* Simple name without Dot or special characters. */
VariableName
  = $[a-z0-9_]i+

/* Simple used for tables and groups without some special characters reserved for function calls. */
Name
  = $[a-z0-9 _:]i+

int
 = $([0-9]+)

/** A break within a before, after or Range of a group to make the table more human readable. */
_'Multi Line Whitespace with _'
= __ ([\n] Comment* '_' __)?

__ 'Whitspace'
  = spaces:[\t \u00A0]*

/* Stuff to ignore within a Table file. */
Ignore
  = (LineEnd / Comment)+

LineEnd
 = __ '\n' __

/* The only allowed comments in Tablesmith */
Comment
  = [#][^\n]*[\n]