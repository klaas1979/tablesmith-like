# Documentation of all Functions <!-- omit in TOC -->

The list below is grouped in line with the Tablesmith documentation and shows all implemented or not yet implemented functions that can be used. All additional documentation about Tablesmith functions is derived or copied based on the [Tablesmith Documention by Bruce Gulke](http://www.mythosa.net/p/tablesmith.html). See the [downloadable documentation](https://www.dropbox.com/s/q9j207pszvm9fqu/TSHelp.html?dl=0).

All functions with the annotation *(Extension)* or not included in Tablesmith 5.2 but extensions that can only be used in Tablesmith-like.

## Table of Contents <!-- omit in TOC -->

- [Conditional Functions](#conditional-functions)
  - [If](#if)
  - [IIf](#iif)
  - [Loop](#loop)
  - [Select](#select)
  - [While](#while)
- [Datasets Functions](#datasets-functions)
  - [DSAdd](#dsadd)
  - [DSCalc](#dscalc)
  - [DSCount](#dscount)
  - [DSCreate](#dscreate)
  - [DSFind](#dsfind)
  - [DSGet](#dsget)
  - [DSRandomize](#dsrandomize)
  - [DSRead](#dsread)
  - [DSReadOrCreate (Extension)](#dsreadorcreate-extension)
    - [Format](#format)
    - [Description](#description)
    - [Example](#example)
  - [DSRemove](#dsremove)
  - [DSSet](#dsset)
  - [DSWrite](#dswrite)
- [Group and Tables Functions](#group-and-tables-functions)
  - [Count](#count)
  - [LastRoll](#lastroll)
  - [Lockout](#lockout)
  - [MinVal](#minval)
  - [MaxVal](#maxval)
  - [Reset](#reset)
  - [Unlock](#unlock)
- [Interface Functions](#interface-functions)
  - [InputList](#inputlist)
  - [InputText](#inputtext)
  - [Generate](#generate)
  - [Msg](#msg)
  - [Note](#note)
  - [Status](#status)
- [Logical Functions](#logical-functions)
  - [And](#and)
  - [IsNumber](#isnumber)
  - [Or](#or)
  - [Xor](#xor)
- [Math Functions](#math-functions)
  - [Abs](#abs)
  - [Ceil](#ceil)
  - [Floor](#floor)
  - [Max](#max)
  - [Min](#min)
  - [Mod](#mod)
  - [Power](#power)
  - [Round](#round)
  - [Sqrt](#sqrt)
  - [Trunc](#trunc)
- [Miscellaneous Functions](#miscellaneous-functions)
  - [Dice](#dice)
  - [Calc](#calc)
  - [Param](#param)
- [Formatting and Layout Functions](#formatting-and-layout-functions)
  - [Bold](#bold)
  - [Color](#color)
  - [CR](#cr)
  - [Italic](#italic)
  - [Line](#line)
  - [Picture](#picture)
- [Text Functions](#text-functions)
  - [AorAn](#aoran)
  - [Cap](#cap)
  - [CapEachWord](#capeachword)
  - [Char](#char)
  - [CommaReplace](#commareplace)
  - [Find](#find)
  - [LCase](#lcase)
  - [Left](#left)
  - [Length](#length)
  - [Mid](#mid)
  - [Replace](#replace)
  - [Right](#right)
  - [Split](#split)
  - [Trim](#trim)
  - [UCase](#ucase)
  - [VowelStart](#vowelstart)
- [Licensing](#licensing)

## Conditional Functions

### If

### IIf

### Loop

### Select

### While

## Datasets Functions

### DSAdd

### DSCalc

### DSCount

### DSCreate

### DSFind

(Find an item) Note: matchers `~` and `!~` behave like `=` and `!=` because the wildcards that are referred to in the basic Tablesmith documentation are not defined further. Different wildcard mechanisms exists, none was choosen as of now. Feel free to create a ticket with the wildcard system explained to get one implemented

### DSGet

### DSRandomize

### DSRead

### DSReadOrCreate (Extension)

#### Format

```Tab
{DSReadOrCreate~VarName,Storename,Field1,Default1,Field2,Default2,...Fieldx,Defaultx}
```

#### Description

Tries to read a DSStore from given file, if DSStore cannot be read uses it creates a new DSStore from provided create parameters.

See [DSCreate](#dscreate) and [DSRead](#dsread) for more information.

#### Example

```Tab
{DSCreate~monsters,monsterstore,name,unknown,hitdice,1,thaco,20}
```

Tries to read dataset from store with name `monsterstore` if it does not exists, creates
 a dataset with three fields - name, hitdice, and thaco. The default values for newly added items will be "unknown", 1, and 20, respectively. This dataset has been put into a variable named "monsters".

### DSRemove

### DSSet

### DSWrite

**Not implemented:**

- DSRoll (Roll for an item)
- DSSort (Sort items)

## Group and Tables Functions

### Count

### LastRoll

### Lockout

### MinVal

### MaxVal

### Reset

### Unlock

**Not implemented:**

- Stop (Stop table generation)
- Used (Used already)

## Interface Functions

### InputList

### InputText

### Generate

### Msg

### Note

### Status

**Not implemented:**

Iteration (Get the current roll the table is on)

## Logical Functions

### And

**Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2

### IsNumber

### Or

**Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2

### Xor

**Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2

## Math Functions

### Abs

### Ceil

### Floor

### Max

**Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2

### Min

**Extension**: accepts 2 to n parameters not just 2 as in Tablesmith 5.2

### Mod

### Power

**Note**: *Calc* and *Dice* can use the Power sign '^'

### Round

### Sqrt

### Trunc

## Miscellaneous Functions

### Dice

**Extension**: accepts all Calc expressions and multiply dice not only a modificator (+, -) as inTablesmith 5.2. The 'd' binds first, only braces bind before. Is interchangeable with *Calc*

### Calc

**Extension**: is interchangeable with *Dice*

### Param

**Not implemented:**

- Debug (Debug)
- Extern (External call)
- GroupExists (Does a group exist)
- Log (Append to a log file)
- LogNew (Write to a new log file)
- OrderAsc (Order ascending)
- TableExists (Does a table exist)
- Version (Version)

## Formatting and Layout Functions

### Bold

### Color

### CR

### Italic

### Line

**Note:** is printed in HTML, but does nothing in Foundry as the css formatting standard does not display anything

### Picture

**Note:** the easiest way to get the correct path is to use the *addImage* dialog in a journal and select the correct picture and copy the path from there (without adding the picture to the table)

## Text Functions

### AorAn

### Cap

### CapEachWord

### Char

### CommaReplace

### Find

### LCase

### Left

### Length

### Mid

### Replace

### Right

### Split

### Trim

### UCase

### VowelStart

**Not implemented:**

- Ordinal (Ordinal number)
- Plural (Make string plural)
- PluralIf (Conditional make string plural)
- Space (Insert spaces)

## Licensing

[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/klaas1979/tablesmith-like/blob/main/LICENSE.txt)

This **documentation** contains parts that are **not** licensed under MIT. These parts are copied and adapted from the [documentation of Bruce Gulke](http://www.mythosa.net/p/tablesmith.html) who gave the right to include the documentation within this project, granting no other rights as long as he and his work is referenced.
