import axios from "axios";
import express from "express";
import {
  REPLIT_KEEPALIVE_PING_INTERVAL_MS,
  REPLIT_KEEPALIVE_PORT,
} from "../constants";

export function startReplitKeepalive() {
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (!replitSlug || !replitOwner) {
    return;
  }
  const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;

  const app = express();
  // Automatically send success status when server is visited (not necessary)
  app.get("/", (req, res) => {
    res.sendStatus(200);
  });
  // Start keepalive server
  app.listen(REPLIT_KEEPALIVE_PORT, () => {
    console.log(
      `Replit keep alive server listening on port ${REPLIT_KEEPALIVE_PORT}`
    );
  });

  // Automatically ping keepalive server
  setInterval(() => {
    axios.get(replitUrl).catch(() => {
      // Do nothing
    });
  }, REPLIT_KEEPALIVE_PING_INTERVAL_MS);
}
