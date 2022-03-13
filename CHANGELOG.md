# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.9.1](https://github.com/klaas1979/tablesmith-like/compare/v1.9.0...v1.9.1) (2022-03-13)


### Bug Fixes

* Multiline with '_' can be mixed with comments ([c045c6e](https://github.com/klaas1979/tablesmith-like/commit/c045c6ea7e04f279513a606adfa676352b18c48f))
* Variable Set Expressions can be used at most places (was missing in parser) ([7a4fcca](https://github.com/klaas1979/tablesmith-like/commit/7a4fccad2df4b0fbaac4c07bb14ea82f449d2739))

## [1.9.0](https://github.com/klaas1979/tablesmith-like/compare/v1.8.0...v1.9.0) (2022-03-12)


### Features

* added Function Char ([3f5ea46](https://github.com/klaas1979/tablesmith-like/commit/3f5ea4604dcf0f204ac941a19a1e7baa05c29c74))
* added Function CommaReplace ([d7af0f8](https://github.com/klaas1979/tablesmith-like/commit/d7af0f88bcc76d9be7ddaab89c090c63b0a157f8))
* added Function Split ([9a43b07](https://github.com/klaas1979/tablesmith-like/commit/9a43b0714972b68146fcba0f9c23dab392d20dbd))
* added Funtions Left and Right ([0ce95b9](https://github.com/klaas1979/tablesmith-like/commit/0ce95b98344013d91a3d48f41756b4982ac385b6))
* Function Mid added ([1d7a2d9](https://github.com/klaas1979/tablesmith-like/commit/1d7a2d971433617c1950d2b51e5a5fba3f0032a8))

## [1.8.0](https://github.com/klaas1979/tablesmith-like/compare/v1.7.0...v1.8.0) (2022-03-11)


### Features

* added TS Function 'Note' to enter text into result ([4e9c77e](https://github.com/klaas1979/tablesmith-like/commit/4e9c77ef4d0942dc2c35963c7a806ada06e256bb))

## [1.7.0](https://github.com/klaas1979/tablesmith-like/compare/v1.6.0...v1.7.0) (2022-03-11)


### Features

* added TS Function 'Status' ([4777438](https://github.com/klaas1979/tablesmith-like/commit/4777438308bcaa2082168978026c20f21f65c912))
* Function names are case insensitive, to write easier tables withouth proper case. ([6e272c4](https://github.com/klaas1979/tablesmith-like/commit/6e272c4495a15587e156ef9b0666f079247d2408))

## [1.6.0](https://github.com/klaas1979/tablesmith-like/compare/v1.5.0...v1.6.0) (2022-03-06)


### Features

* added TS Function 'Cap' and 'CapEachWord' ([874d053](https://github.com/klaas1979/tablesmith-like/commit/874d0533f61ed43673277a0cf9177721d1f24828))
* added TS Function Italic ([fd46915](https://github.com/klaas1979/tablesmith-like/commit/fd469153d716d401e7be1126dd382e5e78470812))
* DSFind works for Datasets on DSGameStores (i.e. Actors, Scenes, Cards, ...) ([66de0fd](https://github.com/klaas1979/tablesmith-like/commit/66de0fd0c390e7ac207f45b8300562e55af9d07f))
* first stab on Datasets to Foundry game instance, i.e. on Actors, Journal or Items ([8abedb6](https://github.com/klaas1979/tablesmith-like/commit/8abedb61b59228bfa3c2cb11f2908fac0b5aeb30))
* GameDSStore provides data for DSCalc ([3369f3a](https://github.com/klaas1979/tablesmith-like/commit/3369f3addda5c303a30eb3fe0d33247fa5613f1c))
* TS Function 'Find' added ([b77785b](https://github.com/klaas1979/tablesmith-like/commit/b77785b659a17206882e621d47006f3cb41e237c))
* TS Function 'Length' ([f30a890](https://github.com/klaas1979/tablesmith-like/commit/f30a8902db5b673f69093eb5992ba2076a7ae07c))
* TS Function 'Replace' added ([459f890](https://github.com/klaas1979/tablesmith-like/commit/459f890589c92729040c5bd84d3ee4832f6b9e42))
* TS Function 'Trim' added ([392a31f](https://github.com/klaas1979/tablesmith-like/commit/392a31f8765433c1bb7306730b9649d2825e8293))
* TS Function 'UCase' added ([6a5de2f](https://github.com/klaas1979/tablesmith-like/commit/6a5de2f5b91e42b5ce7cebd783090fff3b09d300))
* TS Functions 'AorAn' and 'VowelStart' added ([7335d02](https://github.com/klaas1979/tablesmith-like/commit/7335d02235ee92e93415235bbaea996ab52c51c4))
* TSFunctions added 'Color' and 'Picture' ([38e6cbc](https://github.com/klaas1979/tablesmith-like/commit/38e6cbc09c1115e8b442d844dd2addff8c2e0ab8))


### Bug Fixes

* added simple macro to display all table parse errors ([8beaebd](https://github.com/klaas1979/tablesmith-like/commit/8beaebd2b9aeb7f722e4e8ad9afb396d4b60e005))

## [1.5.0](https://github.com/klaas1979/tablesmith-like/compare/v1.4.0...v1.5.0) (2022-02-27)


### Features

* Results can be added to a journal. API updated to have options for this. Base Journal can be configured via Module options. ([d090f33](https://github.com/klaas1979/tablesmith-like/commit/d090f3395791bfbde6c7c81825bc1d59417d29b1))


### Bug Fixes

* Error messages have a basic formatting with newlines rendered ([81d2d34](https://github.com/klaas1979/tablesmith-like/commit/81d2d34c1e17407310bb28dc987c1fb331bcd727))

## [1.4.0](https://github.com/klaas1979/tablesmith-like/compare/v1.3.0...v1.4.0) (2022-02-27)


### Features

* DSFind Function working ([815abdc](https://github.com/klaas1979/tablesmith-like/commit/815abdc7ab9b319280484556461ee3640dd77560))


### Bug Fixes

* non breaking space handled like normal space chars, sometimes needed for HTML output and strange parsing errors ([a58955b](https://github.com/klaas1979/tablesmith-like/commit/a58955b4fe9dfe646444320711b48662a6e796db))

## [1.3.0](https://github.com/klaas1979/tablesmith-like/compare/v1.2.0...v1.3.0) (2022-02-25)


### Features

* DSCalc added ([ec8d638](https://github.com/klaas1979/tablesmith-like/commit/ec8d638adafaf829a306af0e31e03561f3ced910))
* DSRandomize added ([caa4af9](https://github.com/klaas1979/tablesmith-like/commit/caa4af9b345f0c991013453918da5ff58d2a0928))
* DSRemove added ([d72b172](https://github.com/klaas1979/tablesmith-like/commit/d72b172954ebbf322fc7fc35f252785dae3c5042))
* DSSet added to Dataset functions ([8342e71](https://github.com/klaas1979/tablesmith-like/commit/8342e718b52478992ee887949d9fc928bee95bca))
* Example Tables for some TS-Functions added as compendium pack ([f9f932d](https://github.com/klaas1979/tablesmith-like/commit/f9f932dbfea1030eb3aa986a7152faedb7b4df42))
* First stab at Dataset with storage as individual Journal entries with data as Flag added (half of DS Functions still missing) ([3fe8391](https://github.com/klaas1979/tablesmith-like/commit/3fe8391bd1a742c0d254981734b812193e82851b))
* Generate Expression (rerollable Group call placeholder) added ([b28ece2](https://github.com/klaas1979/tablesmith-like/commit/b28ece282d6300751a7834710ea4c69355c2e304))
* minimal text in TSD Dataset file to give hints that it is a useful file ([a833f02](https://github.com/klaas1979/tablesmith-like/commit/a833f024e7f52b122a15271721e19c56f6038640))
* packs for Tables can be created from YAML files to easily create examples and include valueable tables ([5e9a738](https://github.com/klaas1979/tablesmith-like/commit/5e9a7388e09a6bcdcf008e6caa3f4497c2c49b26))
* Settings to indicate if the selection to chat results in Form should be by default true or false ([3b88d18](https://github.com/klaas1979/tablesmith-like/commit/3b88d185237630153a319704c616dcaa93d818d5))
* TS Function InputList (getting selection from user input) added ([f590c97](https://github.com/klaas1979/tablesmith-like/commit/f590c978581bd2e8145b4b757d46285a3fa18df0))
* TS-Function Msg (prompting a message) added ([bab55a3](https://github.com/klaas1979/tablesmith-like/commit/bab55a35b5dc10c86c901cf4a53d9ccc58eadf46))


### Bug Fixes

* rerolltag added to rerollable Groups for getExpression ([30b54e9](https://github.com/klaas1979/tablesmith-like/commit/30b54e99c0416bc431de13a3dc8efa59b5111f68))

## [1.2.0](https://github.com/klaas1979/tablesmith-like/compare/v1.1.1...v1.2.0) (2022-02-13)


### Features

* Error messages are displayed if Tables cannot be evaluated ([f10c07f](https://github.com/klaas1979/tablesmith-like/commit/f10c07fc5c8c2e81ea2928de6127039a72f937cc))
* Re-Roll tag for groups [~Groupname] added to standard form, to customize results. ([e5497f2](https://github.com/klaas1979/tablesmith-like/commit/e5497f258773bc69ebd85aa26cd5ae8de885bb77))

### [1.1.1](https://github.com/klaas1979/tablesmith-like/compare/v1.1.0...v1.1.1) (2022-02-06)


### Bug Fixes

* table calls with zero params do not lead to a ParamInput window ([6ab9c87](https://github.com/klaas1979/tablesmith-like/commit/6ab9c873e27ce78871d883fe73d85c9d69c37eae))

## [1.1.0](https://github.com/klaas1979/tablesmith-like/compare/v1.0.0...v1.1.0) (2022-02-06)


### Features

* better InputText dialog on close default value is used. ([87fe76c](https://github.com/klaas1979/tablesmith-like/commit/87fe76c43233afdc80101a3017f2e079d3822a84))
* InputText initial version with Prompt to gather User Input. ([83c6875](https://github.com/klaas1979/tablesmith-like/commit/83c6875b7a4b76e5e9e4baae49729f132fd12e5b))
* Parameter Input for tables called from RollTable results is gathered via a Form. If all parametes have been provided, no Dialogform is displayed. ([3e16d9b](https://github.com/klaas1979/tablesmith-like/commit/3e16d9bf809c9f1d631cc97b711f0ae5b5414327))
* Table parsing errors are stored and displayed on reload or via API ([f29c8bd](https://github.com/klaas1979/tablesmith-like/commit/f29c8bdab2e8a265710eee2faff6472ef364c73d))
* Tablesmith Chat commands added '/ts' and '/tablesmith' ([562d4de](https://github.com/klaas1979/tablesmith-like/commit/562d4dec209a979a243a41b2c3f0a104c10f7b58))


### Bug Fixes

* Download links and module links broken ([#1](https://github.com/klaas1979/tablesmith-like/issues/1)) ([a2b6a35](https://github.com/klaas1979/tablesmith-like/commit/a2b6a3549a5f7f82e489f5f0e0e82693aa3605ca))
* Results chats result with correctly created ID -> can be deleted etc. ([da8bf35](https://github.com/klaas1979/tablesmith-like/commit/da8bf35fbe9ac94803172e1c14d99b0638b44a78))

## 1.0.0 (2022-01-31)


### Features

* Added folder of tables (the Journal Folder a table is contained in), that can be selected in UI ([69b6cc3](https://github.com/klaas1979/tablesmith-like/commit/69b6cc32594db40d6083fc7dc59c38bab16923fd))
* Added Macros as Compendium to have simple Macro to  Roll a single Table and the UI Macro to launch the Tablesmith UI Form. ([c3af620](https://github.com/klaas1979/tablesmith-like/commit/c3af620ef6ac6e3f8605b399e6ce7e3378efb19b))
* Math functions calc and dice can take in all other functions and variables ([6c6ed5b](https://github.com/klaas1979/tablesmith-like/commit/6c6ed5b306a19f62b94a869948e34d4ea8e75fa0))
* rollCount added for Table calls (NOT for Group calls within tables, as here a result area cannot be easily displayed) ([bffbf12](https://github.com/klaas1979/tablesmith-like/commit/bffbf128fdfb02f2756a46522f618bb968bcff8b))
* RollCount added to Tablesmith form ([28dbc83](https://github.com/klaas1979/tablesmith-like/commit/28dbc8306d0d3f78135a0794b6f87bb8af2ec498))


### Bug Fixes

* better error messages for testing ([2293ac8](https://github.com/klaas1979/tablesmith-like/commit/2293ac8863e7902ee39ac9f627adccbe093fa205))
* build error types string vs string[] ([f7bc3c7](https://github.com/klaas1979/tablesmith-like/commit/f7bc3c76b0b0f3398a2608537bb188fa1f736d1d))
* ignore case for align strings ([41d1f4b](https://github.com/klaas1979/tablesmith-like/commit/41d1f4b2b011304445d4b0756aa2685ba6f895a6))
* non breaking space of html char 160 as normal space for parser ([057a6a9](https://github.com/klaas1979/tablesmith-like/commit/057a6a94e14cc2bd41856d54598017254c0f07a4))
* type error ([5e01898](https://github.com/klaas1979/tablesmith-like/commit/5e01898afdd615b8c5355b5a9d3c25a398b51909))
* type incompatibility ([0fd945e](https://github.com/klaas1979/tablesmith-like/commit/0fd945e003bee6c0784b8de87f54596e48f9b3b8))
