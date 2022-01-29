import knex from 'knex';

class DB {
  private pg;

  constructor(connectionString: string) {
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
}

export { DB }
