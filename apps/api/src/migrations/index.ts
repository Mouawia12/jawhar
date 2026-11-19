import * as migration_20261119_113625_initial from './20261119_113625_initial';

export const migrations = [
  {
    up: migration_20261119_113625_initial.up,
    down: migration_20261119_113625_initial.down,
    name: '20261119_113625_initial'
  },
];
