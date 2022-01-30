interface DiscordHoldEntry {
  ID: string, // discord 'snowflake'
  CheckValue: string,
  Expiry: Date,
  DiscordInfo: object,
}

enum PrivRoles {
  Registered = 0,
  Mod,
  Admin,
}

interface User {
  ID: string,
  Name: string,
  HighestRole: PrivRoles,
}

export { DiscordHoldEntry, PrivRoles, User }
