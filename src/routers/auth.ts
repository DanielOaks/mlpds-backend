// registration and login handlers live here
import express from 'express';
import axios from 'axios';
import FormData from 'form-data';

const discord_authorize_endpoint = 'https://discord.com/api/oauth2/authorize';
const discord_token_endpoint = 'https://discord.com/api/oauth2/token';
const discord_get_current_user_endpoint = 'https://discord.com/api/v9/users/@me';

// routes

var router = express.Router();

router.get('/discord', redirectToDiscord);
router.get('/discord/callback', callbackFromDiscord);

// handlers

function redirectToDiscord(req, res) {
  // this is how the frontend tells us where to redirect on each case
  const qstring_mlpds = new URLSearchParams({
    fail: req.query.fail ? req.query.fail.toString() : `/nay`,
    login: req.query.login ? req.query.login.toString() : `/yay`,
    new: req.query.new ? req.query.new.toString() : `/yayc`,
  }).toString();
  let redirect_uri = `${req.app.locals.publicUrl}/auth/discord/callback?${qstring_mlpds}`;

  // this is how we tell discord where to redirect to
  const qstring = new URLSearchParams({
    response_type: 'code',
    scope: 'identify',
    client_id: req.app.locals.discordClientID,
    redirect_uri,
  }).toString();

  // the callback needs the same redirect uri so we set that as a
  //  cookie that'll be used later.
  res.cookie('last_redirect_uri', redirect_uri);

  res.redirect(`${discord_authorize_endpoint}?${qstring}`);
}

function callbackFromDiscord(req, res) {
  if (req.query.error) {
    // user rejected the auth or something else happened :<
    const new_query_params = new URLSearchParams({
      error: req.query.error.toString(),
      data: JSON.stringify({
        'description': req.query.error_description.toString(),
      }),
    }).toString();

    res.redirect(`${req.query.fail}?${new_query_params}`)
    return
  }

  if (req.query.code) {
    // success! let's find out which user we just authed as
    var form = new FormData();
    form.append('client_id', req.app.locals.discordClientID);
    form.append('client_secret', req.app.locals.discordClientSecret);
    form.append('grant_type', 'authorization_code');
    form.append('code', req.query.code);
    form.append('redirect_uri', req.cookies.last_redirect_uri);

    axios.post(discord_token_endpoint, form, { headers: form.getHeaders() })
      .then(response => {
        const config = {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
        };
        axios.get(discord_get_current_user_endpoint, config)
          .then(response => {
            const config = {
              headers: {
                Authorization: `Bot ${req.app.locals.discordBotToken}`,
              },
            };
            console.log(response.data);
            const endpoint = `https://discord.com/api/v9/guilds/${req.app.locals.discordGuildID}/members/${response.data.id}`;
            axios.get(endpoint, config)
              .then(response => {
                res.status(200).json(response.data);
              })
              .catch(error => {
                res.status(400).json({
                  'error': "Couldn't get guild data",
                  'data': error.response.data,
                });
              });
          })
          .catch(error => {
            res.status(400).json({
              'error': "Couldn't get user data",
              'data': error.response.data,
            });
          });
      })
      .catch(error => {
        res.status(400).json({
          'error': "Couldn't get token",
          'data': error.response.data,
        });
      });
    return
  }

  res.status(400).json({
    'error': 'Discord sent us something strange',
    'data': {
      'params': req.params,
      'query': req.query,
    },
  });
}

export { router as AuthRouter };
