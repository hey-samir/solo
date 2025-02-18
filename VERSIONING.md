# Solo App Versioning Guide

## Epoch Semantic Versioning

Solo uses a modified version of Semantic Versioning called Epoch Semantic Versioning, inspired by [Anthony Fu's proposal](https://antfu.me/posts/epoch-semver).

### Version Format: [Epoch].[Minor].[Patch]

#### Version Numbers

1. **Epoch** (first number):
   - Increments after each chat completion
   - Represents major releases and significant feature completions
   - Example: When moving from 1.3.4 to 2.0.0 after completing a chat

2. **Minor** (second number):
   - Increments with each successful commit
   - Represents new features or substantial changes
   - Example: Moving from 1.3.4 to 1.4.0 after adding a new feature

3. **Patch** (third number):
   - Used for bug fixes and small changes
   - Example: Moving from 1.3.4 to 1.3.5 after fixing a bug

### Version Tracking

Versions are tracked in `version.json` at the root of the project. This file contains:
- Current version number
- Timestamps of last updates
- Brief description of the current version

### Changelog Management

Changelogs are stored in the `changelogs/` directory, organized by epoch:
```
changelogs/
  epoch-1/
    1.0.0.md
    1.1.0.md
    ...
  epoch-2/
    2.0.0.md
    ...
```

### Rolling Back to Previous Versions

To roll back to a previous version:
1. Note the desired version number (e.g., 1.2.0)
2. Check the corresponding changelog file in `changelogs/epoch-X/`
3. Use git to checkout the commit associated with that version

### Version Bumping

- Epoch: Bumped automatically at the end of each chat
- Minor: Bumped with each successful commit
- Patch: Bumped for bug fixes and small changes

This versioning system helps track the evolution of the Solo app while maintaining clear historical records of changes and chat-based development progress.
