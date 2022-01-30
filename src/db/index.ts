import knex from 'knex';
import { nanoid } from 'nanoid';

import { DiscordHoldEntry, PrivRoles, User } from './interfaces';

class DB {
  private pg;
  private discordHolds: Map<string, DiscordHoldEntry>;
  private users: Map<string, User>;
  private discordUserLinks: Map<string, string>;

  constructor(connectionString: string) {
    this.discordHolds = new Map();
    this.users = new Map();
    this.discordUserLinks = new Map();

    this.pg = knex({
      client: 'pg',
      connection: connectionString,
      searchPath: ['knex', 'public'],
    });

    this.pg.schema.hasTable('DiscordHoldingTable').then((exists: boolean) => {
      if (!exists) {
        this.pg.schema.createTable('DiscordHoldingTable', table => {
          table.string('id').primary();
          table.string('checkValue');
          table.timestamp('expiry');
          table.json('discordBlob');
        }).then();
      }
    });
  }

  getUserFromDiscordAccount(id: string): User | null {
    //TODO: migrate to db
    return this.users[this.discordUserLinks[id]];
  }

  createDiscordHold(id: string, expiry: Date, discordInfo: object): string {
    //TODO: migrate to db
    const checkValue = nanoid(18);
    this.discordHolds.set(id, {
      ID: id,
      CheckValue: checkValue,
      Expiry: expiry,
      DiscordInfo: discordInfo,
    });
    return checkValue;
  }
}

export { DB }
