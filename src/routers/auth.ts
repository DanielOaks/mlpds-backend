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
  let qstring_mlpds = new URLSearchParams({
    fail: req.query.fail ? req.query.fail.toString() : `/nay`,
    login: req.query.login ? req.query.login.toString() : `/yay?action=login`,
    new: req.query.new ? req.query.new.toString() : `/yay?action=register`,
  }).toString();
  if (req.query.fe !== undefined) {
    qstring_mlpds = 'fe';
  }
  let redirect_uri = `${req.app.locals.publicUrl}/auth/discord/callback?${qstring_mlpds}`;
  console.log(req.query, redirect_uri);

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
  var createAccountURL = req.query.new && req.query.new.startsWith('/') ? `${req.app.locals.publicUrl}${req.query.new}` : req.query.new;
  var failURL = req.query.fail && req.query.fail.startsWith('/') ? `${req.app.locals.publicUrl}${req.query.fail}` : req.query.fail;
  if (req.query.fe !== undefined) {
    createAccountURL = `${req.app.locals.frontendUrl}/create-account`;
    failURL = `${req.app.locals.frontendUrl}/login-failed`;
  }

  if (req.query.error) {
    // user rejected the auth or something else happened :<
    const url = new URL(failURL);
    url.searchParams.set('error', req.query.error.toString());
    url.searchParams.set('data', JSON.stringify({
      'description': req.query.error_description.toString(),
    }));
    res.redirect(url.toString());
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
            //TODO: login if account already exists

            // we do this to get the guild data so that we don't
            //  need to request the `guilds.members.read` oauth2
            //  scope, because that one feels SCARY to users… 
            const config = {
              headers: {
                Authorization: `Bot ${req.app.locals.discordBotToken}`,
              },
            };
            const endpoint = `https://discord.com/api/v9/guilds/${req.app.locals.discordGuildID}/members/${response.data.id}`;
            axios.get(endpoint, config)
              .then(response => {
                const expiry = new Date();
                expiry.setSeconds(expiry.getSeconds() + req.app.locals.discordHoldsValidFor);
                const checkValue = req.app.locals.db.createDiscordHold(response.data.user.id, expiry, response.data);

                // res.status(200).json(response.data);

                const url = new URL(createAccountURL);
                url.searchParams.set('id', response.data.user.id);
                url.searchParams.set('name', response.data.nick || response.data.user.username);
                url.searchParams.set('avatar', response.data.user.avatar);
                url.searchParams.set('checkValue', checkValue);
                url.searchParams.set('expiry', expiry.toISOString());
                res.redirect(url.toString());
              })
              .catch(error => {
                const url = new URL(failURL);
                url.searchParams.set('error', "Couldn't get guild data");
                url.searchParams.set('data', JSON.stringify(error.response.data));
                res.redirect(url.toString());
              });
          })
          .catch(error => {
            const url = new URL(failURL);
            url.searchParams.set('error', "Couldn't get user data");
            url.searchParams.set('data', JSON.stringify(error.response.data));
            res.redirect(url.toString());
          });
      })
      .catch(error => {
        const url = new URL(failURL);
        url.searchParams.set('error', "Couldn't get token");
        url.searchParams.set('data', JSON.stringify(error.response.data));
        res.redirect(url.toString());
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
