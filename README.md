# Google Entity

Google entity uses Google datastore sdk to do crud and search more efficiently than the basic core sdk

## Installation

`npm i google-entity`

## Usage

```javascript
const entity = require("google-entity");
```

| Function                  | Description                                   |
| ------------------------- | --------------------------------------------- |
| `addEntities`             | Add multiple entities that have the same kind |
| `addEntity`               | Add an entity                                 |
| `deleteEntitiesFromKeys`  | Delete entities from keys                     |
| `deleteEntity`            | Delete an entity                              |
| `getEntities`             | Get an entity by id                           |
| `getEntitiesByAttributes` | Get entities of the same kind with attributes |
| `getEntitiesFromKeys`     | Get different entities from keys              |
| `getEntity`               | Get an entity by id                           |
| `updateEntity`            | Update an entity                              |

## Tests

`npm test`
