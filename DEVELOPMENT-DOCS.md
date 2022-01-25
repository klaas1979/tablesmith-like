# Development Docs

These docs are for later reference, as this is a hobby project that may lie dormant for some time. Relevant links and knowledge is added here.

## Release Process

### Local Versioning

The release process is build upon [standard-version](https://github.com/conventional-changelog/standard-version) see [Howto use Standard version](https://medium.com/jobtome-engineering/how-to-generate-changelog-using-conventional-commits-10be40f5826c) for more information.

### Github Integration

The github process is bootstraped from [foundryvtt-gmScreen](https://github.com/ElfFriend-DnD/foundryvtt-gmScreen) workflows to automatically build and release on a push of a version tag with a semantic version prefixed by a `v`.

For the release process to work the secrects `FOUNDRY_ADMIN_USER` and `FOUNDRY_ADMIN_PW` must be set.
