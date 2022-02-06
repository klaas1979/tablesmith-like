# Tablesmith like Tables <!-- omit in TOC -->

![CI](https://github.com/klaas1979/tablesmith-like/actions/workflows/node.js.yml/badge.svg) [![GitHub release](https://img.shields.io/github/release/klaas1979/tablesmith-like?include_prereleases=&sort=semver&color=blue)](https://github.com/klaas1979/tablesmith-like/releases/) [![issues - tablesmith-like](https://img.shields.io/github/issues/klaas1979/tablesmith-like)](https://github.com/klaas1979/tablesmith-like/issues) [![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/klaas1979/tablesmith-like/blob/main/LICENSE.txt)

Use Tablesmith-like tables in FoundryVTT and create complex nested tables. For more about Tablesmith see the [Tablesmiths Homepage](http://www.mythosa.net/p/tablesmith.html) and the [Forum for TableSmith](https://groups.io/g/tablesmith).

Tablesmith table syntax allows it to create anything from simple tables and nested tables as in Foundry, to complex linked tables with loops, conditionals, parameters and more. Results can be send to chat.

Tablesmith is useful for Character and NPC generation, Solo play, generating Encounters, Inns, Weather and whatever else is needed in your adventure. Within the forum is a files area with a lot tables ranging from simple name tables up to complex content generation of all kind.

## Table of Contents <!-- omit in TOC -->

- [Foundry integration](#foundry-integration)
  - [Call Syntax](#call-syntax)
  - [Foundry Table integration](#foundry-table-integration)
  - [Tablesmith Form](#tablesmith-form)
  - [Macro](#macro)
  - [Chat Commands](#chat-commands)
  - [API](#api)
- [Tablesmith Tables](#tablesmith-tables)
  - [Loaded tables](#loaded-tables)
  - [Tables in different Journals or Folders](#tables-in-different-journals-or-folders)
  - [Formatting Tips for Journal Tables](#formatting-tips-for-journal-tables)
- [Implemented Tablesmith Features](#implemented-tablesmith-features)
  - [Groups](#groups)
    - [Splitting Group Entries / Ranges](#splitting-group-entries--ranges)
    - [Dynamic Probabilities](#dynamic-probabilities)
    - [Defaults Pre- or Postfix](#defaults-pre--or-postfix)
  - [Variables](#variables)
    - [Scope](#scope)
    - [Using Variables](#using-variables)
    - [Assignment](#assignment)
- [Parameters](#parameters)
  - [Parameter Types](#parameter-types)
  - [Passing Parameters to Tables](#passing-parameters-to-tables)
- [Miscellaneous](#miscellaneous)
  - [Number of Rolls](#number-of-rolls)
  - [Re Roll Tag](#re-roll-tag)
  - [Printing Special Character](#printing-special-character)
  - [Pre-Generation Directives](#pre-generation-directives)
- [Tablesmith functions](#tablesmith-functions)
  - [Conditional](#conditional)
  - [Datasets](#datasets)
  - [Group and Tables](#group-and-tables)
  - [Interface](#interface)
  - [Logical](#logical)
  - [Math](#math)
  - [Miscellaneous Functions](#miscellaneous-functions)
  - [Formatting and Layout](#formatting-and-layout)
  - [Text](#text)
- [Special Appreciations](#special-appreciations)
- [Licensing](#licensing)

## Foundry integration

Basically Tablesmith Tables can be used in the following ways:

1. A **Group Call expression within a Table Result** of type text, that is dynamically evaluated.
2. With the **Tablesmith form** to select Tables and roll on them.
3. Using Chat commands `/ts` or `/tablesmith`.
4. **API** that is exposed on the module.

### Call Syntax

For all calls the tablename is not case sensitive for convenience. The following is all equal to find a table: `Simple`, `simple`, `SIMPLE`, `sImPle`, and so on. The call `[Simple(1,2)]:2` draws from the table `Simple`, two times (`:2`), setting the first parameter to `1` and the second to `2`. The syntax is:

```tab
# Minimal call, defaults to Group 'Start'
[Tablename]

# Call to other Group
[Tablename.Groupname]

# Call to table with params
[Tablename(params)]

# Full call with all options
[Tablename.Groupname(params)]:times
```

### Foundry Table integration

Any standard Table can call a Tablesmith table by using the Tablesmith Call syntax without any other text as *Result Details*. Only the chat message is altered and the call value is replaced with a rolled Tablesmith result. The `RollTable.draw` return value is left as is and contains the original data.

### Tablesmith Form

One macro contained within the added compendium opens the Tablesmith Form, where all loaded tables can be called.

### Macro

The module adds a compendium with simple macros to demonstrate the usage of the API within a Macro.

### Chat Commands

The chat commands `ts` and `tablesmith` can be used to call a table directly by using the standard call syntax as parameter. The enclosing brackets `[]` can be ommitted for convenience.

### API

The main method to use in the API is `evaluateTable(expression: string)` where the expression is a valid Table call, that may donate the Group to call, define Parameters and the roll count. I.e. `evaluateTable('[Char.name(1,name)]:5')`.

## Tablesmith Tables

Tables are created as Journal entries. Journal entries provide an easy way to add and edit a long text document, as needed.

### Loaded tables

All Journal entries where there name ends with `.tab` are loaded. The resulting name is omitting the extension, i.e. `Monsters.tab` results in the Table name `Monsters`, not that Tablenames are case insensitive so the table `simple`and `Simple` are the same and will overwrite each other.
Each table is placed in a folder named after the folder they are contained in. If a table is in no folder it is placed in a `Default` folder.

### Tables in different Journals or Folders

Note that the tablename must be unique over all folders and journals as of now.

### Formatting Tips for Journal Tables

For long tables it is recommended to use `SHIFT+Enter` instead of `Enter` to save some space. This is purely cosmetic, the parser has no problem with mixed newlines.

## Implemented Tablesmith Features

Following are all implemented features of Tablesmith 5.2 and explanations about possible changes and incompatibilites.

### Groups

Groups have the format `:GroupName` for a group with ranges where the number declares their final value or the format `;GroupName` for groups with probability ranges, where the number declares the probability.

```tab
# Standard group
:Group
1,One
2,Two
3-4,Three-Four
```

results in the same table as:

```tab
;Group
1,One
1,Two
2,Three-Four
```

#### Splitting Group Entries / Ranges

Group entries can be split over multiply lines, by prefixing the next line with an underscore `_`.

```tab
:Group
1,First Second
```

is equal to

```tab
:Group
1,First
_ Second
```

#### Dynamic Probabilities

Dynamic Probabilities are not implemented.

#### Defaults Pre- or Postfix

Groups can contain a pre- and/or postfix, that is added to all results:

```tab
:Group
<,There are
>, in the woods
1, Orcs
2, Goblins
```

will result in:
`There are Orcs in the woods` or `There are Goblins in the woods`

### Variables

Variables must be declared before first use:
`%VariableName%,x` where the `%` donates beginning and end of the variable name and the `,` shows start of default value `x`. The default value may be omitted, but the `,`must be present.
Note that the variable default value is not evaluated. A group call to like `%var%,[Group]`will lead to the variable containing the string `[Group]` and not the evaluation of the group.

#### Scope

Variables are scoped to the context of the enclosing Table (not the group) so each Table file has its own context and can name variables the same.

#### Using Variables

Variables can be accessed by using the syntax `%variableName%`. The reference is replaced by the current value. References can be used in nearly any place, within functions and Group calls.

Variables in other tables can be referenced as well using the Syntax `%Tablename!Variablename%`, i.e. `%Char!name%` to reference the variable `name` in Table `Char`.

**Note:** As Tablesmith 5.2 provides no comphrehensive documentation where variables can be referenced this implementation may act differently.

#### Assignment

Variables can be assigned in Group entries by using the syntax `|variableName?X|`. The assignment is taking place and the assignment reference is replaced by an empty string, i.e. leaves no trace in the output. The variable name without `%` must belong to a declared variable. The `?`is the operator for the assignment:

- **|A+5|** - Adds 5 to "A" (Ex: If "A" was 3, it is now 8)
- **|hp-3|** - Subtracts 3 from "hp" (Ex: If "hp" was 4, it is now 1)
- **|gp*2|** - Multiplies "gp" by 2 (Ex: If "gp" was 50, it is now 100)
- **|dmg/2|** - Divides "dmg" by 2 (Ex: If "dmg" was 10, it is now 5)
- **|attr\2|** - Divides "attr" by 2, rounds fractions (Ex: If "attr" was 5, it is now 2)
- **|A>35|** - Assigns 35 to "A", if 35 is greater than A's value
- **|A<14|** - Assigns 14 to "A", if 14 is less than A's value
- **|A& III|** - Concatenates the text " III" to A's value (Ex: If "A" was "Smith", it is now "Smith III")
- **|A=orc|** - Sets "A" equal to the word "orc"

As with reference Variables in other tables may be assigned using the syntax  `|Tablename!Variablename?Value|`, i.e. `|Char!name=Brognar|` to assign the variable `name` the value `Brognar` in Table `Char`.

## Parameters

Tablesmith supports parameters for tables. This can be either passed internally or be gathered as user input before a table is evaluated.

### Parameter Types

Tablesmith supports three types of Parameters:

1. Text
2. List
3. Multi-List

### Passing Parameters to Tables

Parameters may be passed to tables in group calls. This is optional, but if you pass them, the list must match the number of parameters of the table. To pass parameters, you use parentheses after the call `[Table.Start(1,Amelia)]`

The called table is expected to have to parameters declared in the order as listed in parenthesis, i.e:

```tab
%number%,
@number,1,Times?,1,2,3
%name%,
@name,Brognar,Enter name:
```

The parameter `number` is assigned the `1` and the parameter `name` is assigned `Amelia`.

Other valid calls are:

- `[Table.Start(,Amelia)]` number default, name `Amelia`
- `[Table.Start(1,)]` number `1`, name default
- `[Table.Start(,)]` both default
- `[Table.Start]` both default

It is not possible to assign values to variables, without a parameter defined.

## Miscellaneous

### Number of Rolls

A Table call can donate how many rolls should be done by using the syntax `[TableCall]:X` where `TableCall` can be any valid call and `X` donates the number of roles to make.

### Re Roll Tag

The re roll Tag for a Table-Group call `[~Table.Group]` is not implemented.

### Printing Special Character

The custom build parser allows a lot of characters. For compatibility the following special characters must be escaped to be printed:

- percent sign `%` or
- square brackets `[` or `]`

Precede the character with the slash character `/`.

### Pre-Generation Directives

No pre generation directives are implemented.

## Tablesmith functions

The list below is grouped in line with the Tablesmith documentation and shows all implemented or not yet implemented functions that can be used. For a more in depth documentation see the Tablesmith documentation linked on the Tablesmith Homepage.

### Conditional

- If (Choose one option or another, ternary operator with *expr ? value 1 **/** value 1*)
- IIf (Choose one option or another, ternary operator with *expr ? value 1 **:** value 1*)
- Loop (Repeat something a number of times)
- Select (Choose one option of many)
- While (While loop)

### Datasets

**Not implemented:**

- DSAdd (Add item)
- DSCalc (Calculate on items)
- DSCount (Count items)
- DSCreate (Create dataset)
- DSFind (Find an item)
- DSGet (Get a value from an item)
- DSRandomize (Randomize items)
- DSRead (Read in a dataset file)
- DSRemove (Remove an item)
- DSRoll (Roll for an item)
- DSSet (Set a value in an item)
- DSSort (Sort items)
- DSWrite (Write dataset to a file)

### Group and Tables

- Count (Count group entries)
- LastRoll (Gets the last value generated on a group roll)
- Lockout (Lockout entries in a non-repeating group)
- MinVal (Minimum value of entry)
- MaxVal (Maximum value of entry)
- Reset (Reset group)
- Unlock (Unlock entry)

**Not implemented:**

- Stop (Stop table generation)
- Used (Used already)

### Interface

**Not implemented:**

- Generate (Generation link)
- InputList (Input a list option from the user)
- InputText (Input a value from the user)
- Iteration (Get the current roll the table is on)
- Msg (Message box)
- Note (Notation)
- Status (Display status)

### Logical

- And (Logical And) **Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2
- IsNumber (Determines if a value is a number or not)
- Or (Logical OR) **Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2
- Xor (Logical exclusive OR) **Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2

### Math

- Abs (Absolute value)
- Calc (Calculate)
- Ceil (Ceiling integer)
- Floor (Floor integer)
- Max (Maximum value) **Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2
- Min (Minimum value) **Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2
- Mod (Remainder)
- Power (Raise to a power) **Note**: *Calc* and *Dice* can use the Power sign '^'.
- Round (Rounding)
- Sqrt (Square root)
- Trunc (Truncate)

### Miscellaneous Functions

- Dice (Roll dice) **Extension**: accepts all Calc expressions and multiply dice not only a modificator (+, -) as inTablesmith 5.2. The 'd' binds first, only braces bind before. Is interchangeable with *Calc*
- Calc (Mathematical calculations with +, -, \*, /, ^ and braces) **Extension**: is interchangeable with *Dice*
- Param (Parameter item)

**Not implemented:**

- Debug (Debug)
- Extern (External call)
- GroupExists (Does a group exist)
- Log (Append to a log file)
- LogNew (Write to a new log file)
- OrderAsc (Order ascending)
- OrderDesc (Order descending)
- TableExists (Does a table exist)
- Version (Version)

### Formatting and Layout

- Bold (Boldface)
- CR (Carriage return)
- Line (Insert a horizontal line) **Note:** is printed in HTML, but does nothing in Foundry as the css formatting standard does not display anything.

**Not implemented:**

- Italic (Italicize text)
- Color (Color text)
- Picture (Display picture)

### Text

- AorAn (A or An)
- Cap (Capitalize)
- CapEachWord (Capitalize each word)
- Char (Retrieve a single character)
- CommaReplace (Replace or insert commas)
- Find (Find text within other text)
- LCase (Lower case)
- Left (Retrieve leftmost characters)
- Length (Get the length of some text)
- Mid (Retrieve middle characters)
- Ordinal (Ordinal number)
- Plural (Make string plural)
- PluralIf (Conditional make string plural)
- Replace (Replace text)
- UCase (Upper case)
- Right (Retrieve rightmost characters)
- Space (Insert spaces)
- Split (Split)
- Trim (Trim spaces)
- VowelStart (Vowel starts)

## Special Appreciations

- **Bruce Gulke** to create Tablesmith in the first place and give me a thumbs up to create this plugin. Check [Tablesmith](http://www.mythosa.net/p/tablesmith.html) out and buy him a coffee be licensing the shareware version.  
- **FoundryVTT Discord** for supporting with all my questions about Foundry development. Especially @ghost and @LukeAbby for helping me with all starting questions.
- **League of Extraordinary FoundryVTT Developers** and all the other people for cool support documentation and tools to make this development possible in the first place.
- Thanks to @ghost-fvtt for the ![foundry-factory](https://github.com/ghost-fvtt/foundry-factory) as bootstrapping start.

## Licensing

[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/klaas1979/tablesmith-like/blob/main/LICENSE.txt)

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).
