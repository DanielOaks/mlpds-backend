# MLPDS Backend

This is the backend app for the [mlpds.art](https://mlpds.art/) site.


## Testing vs Prod

In prod this connects to:

- A Postgres db for session storage and general info.
- An S3-compatible datastore to upload images to.

Locally, we mock those with a Postgres db and MinIO.


## Environment Variables

Here are the environment variables this app uses:

- `MLPDS_BACKEND_PORT`: Port number to host the backend on.
- `MLPDS_BACKEND_PUBLIC_URL`: URL that this is exposed on with no trailing slash, e.g. `http://localhost:4000`
- `MLPDS_BACKEND_SESSION_SECRET`: Secret used for the backend's session cookies.
- `MLPDS_DISCORD_HOLDS_VALID_FOR`: How many seconds a Discord session is held for.
- `MLPDS_DISCORD_CLIENT_ID`: Discord Client ID of the MLPDS bot.
- `MLPDS_DISCORD_CLIENT_SECRET`: Discord Client Secret of the MLPDS bot.
- `MLPDS_DISCORD_BOT_TOKEN`: Token for the MLPDS bot.
- `MLPDS_DISCORD_GUILD_ID`: ID of the MLPDS Discord Guild.
- `MLPDS_FRONTEND_PUBLIC_URL`: URL for the frontend with no trailing slash.

You can store these in a `.env` file in the root, for local development.
