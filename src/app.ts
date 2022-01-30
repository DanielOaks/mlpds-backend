import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import { DB } from './db';
import { AuthRouter } from './routers/auth';
import { NayayRouter } from './routers/nayay';

const app = express();
app.locals = {
  db: new DB(process.env.MLPDS_BACKEND_PG_CONNECTION_STRING),

  publicUrl: process.env.MLPDS_BACKEND_PUBLIC_URL,
  frontendUrl: process.env.MLPDS_FRONTEND_PUBLIC_URL,

  discordHoldsValidFor: parseInt(process.env.MLPDS_DISCORD_HOLDS_VALID_FOR),
  discordClientID: process.env.MLPDS_DISCORD_CLIENT_ID,
  discordClientSecret: process.env.MLPDS_DISCORD_CLIENT_SECRET,
  discordBotToken: process.env.MLPDS_DISCORD_BOT_TOKEN,
  discordGuildID: process.env.MLPDS_DISCORD_GUILD_ID,
}
app.use(cookieParser());

app.use('/', NayayRouter);
app.use('/auth', AuthRouter);

app.listen(process.env.MLPDS_BACKEND_PORT, () => {
  console.log(`App is running on port ${process.env.MLPDS_BACKEND_PORT}.`);
});
