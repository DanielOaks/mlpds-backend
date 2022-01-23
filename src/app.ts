import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import cookieParser from 'cookie-parser';

const discord_authorize_endpoint = 'https://discord.com/api/oauth2/authorize';
const discord_token_endpoint = 'https://discord.com/api/oauth2/token';

const app = express();
app.use(cookieParser())

app.get('/auth/discord', (req, res) => {
  // this is how the frontend tells us where to redirect on each case
  const qstring_mlpds = new URLSearchParams({
    fail: req.query.fail ? req.query.fail.toString() : `/nay`,
    login: req.query.login ? req.query.login.toString() : `/yay`,
    new: req.query.new ? req.query.new.toString() : `/yayc`,
  }).toString();
  let redirect_uri = `${process.env.MLPDS_BACKEND_PUBLIC_URL}/auth/discord/callback?${qstring_mlpds}`;

  // this is how we tell discord where to redirect to
  const qstring = new URLSearchParams({
    response_type: 'code',
    scope: 'identify',
    client_id: process.env.MLPDS_DISCORD_CLIENT_ID,
    redirect_uri,
  }).toString();

  // the callback needs the same redirect uri so we set that as a
  //  cookie that'll be used later.
  res.cookie('last_redirect_uri', redirect_uri);

  res.redirect(`${discord_authorize_endpoint}?${qstring}`);
});
app.get('/auth/discord/callback', (req, res) => {
  if (req.query.error) {
    // user rejected the auth or something else happened :<
    const new_query_params = new URLSearchParams({
      error: req.query.error.toString(),
      error_description: req.query.error_description.toString(),
    }).toString();

    res.redirect(`${req.query.fail}?${new_query_params}`)
    return
  }

  if (req.query.code) {
    // success! let's find out which user we just authed as
    var form = new FormData();
    form.append('client_id', process.env.MLPDS_DISCORD_CLIENT_ID);
    form.append('client_secret', process.env.MLPDS_DISCORD_CLIENT_SECRET);
    form.append('grant_type', 'authorization_code');
    form.append('code', req.query.code);
    form.append('redirect_uri', req.cookies.last_redirect_uri);

    axios.post(discord_token_endpoint, form, { headers: form.getHeaders() })
      .then(function (response) {
        res.status(200).json(response.data);
      })
      .catch(function (error) {
        res.status(400).json(error.response.data);
      });
    return
  }

  res.status(400).json({
    'error': 'Discord sent us something strange',
    'params': req.params,
    'query': req.query,
  });
});

app.listen(process.env.MLPDS_BACKEND_PORT, () => {
  console.log(`App is running on port ${process.env.MLPDS_BACKEND_PORT}.`);
});
