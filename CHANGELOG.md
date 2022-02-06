# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
