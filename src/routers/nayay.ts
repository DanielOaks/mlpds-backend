// example endpoints
import express from 'express';

// routes

var router = express.Router();

router.get('/nay', nay);
router.get('/yay', yay);

// handlers

function nay(req, res) {
  var data = {}
  try {
    data = JSON.parse(req.query.data);
  } catch {}

  res.status(400).json({
    error: req.query.error,
    data,
  });
}

function yay(req, res) {
  var data = {}
  try {
    data = JSON.parse(req.query.data);
  } catch {}

  res.json({
    action: req.query.action,
    data,
  });
}

export { router as NayayRouter };
