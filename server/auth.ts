import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  // Spotify Strategy
  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.SPOTIFY_CLIENT_ID!,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
        callbackURL: process.env.REPL_SLUG
          ? `https://${process.env.REPL_SLUG}.replit.dev/api/auth/spotify/callback`
          : "http://localhost:5000/api/auth/spotify/callback",
      },
      async (accessToken, refreshToken, expires_in, profile, done) => {
        try {
          console.log("Spotify auth callback received", {
            profileId: profile.id,
            displayName: profile.displayName,
          });

          // Check if we already have a user with this Spotify ID
          const users = await storage.getAllUsers();
          const existingUser = users.find((u) => u.spotifyId === profile.id);

          if (existingUser) {
            console.log("Updating existing user with new Spotify tokens");
            // Update tokens
            const updatedUser = await storage.updateUser(existingUser.id, {
              spotifyToken: accessToken,
              spotifyRefreshToken: refreshToken,
            });
            return done(null, updatedUser);
          }

          console.log("Creating new user from Spotify profile");
          // Create a new user
          const newUser = await storage.createUser({
            username: profile.displayName || profile.id,
            password: await hashPassword(randomBytes(16).toString("hex")),
            spotifyId: profile.id,
            spotifyToken: accessToken,
            spotifyRefreshToken: refreshToken,
          });
          return done(null, newUser);
        } catch (err) {
          console.error("Error in Spotify auth callback:", err);
          return done(err as Error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // Local auth routes
  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Spotify auth routes
  app.get("/api/auth/spotify", (req, res, next) => {
    console.log("Initiating Spotify OAuth flow");
    passport.authenticate("spotify", {
      scope: [
        "user-read-email",
        "playlist-read-private",
        "playlist-modify-public",
        "playlist-modify-private",
      ],
    })(req, res, next);
  });

  app.get(
    "/api/auth/spotify/callback",
    (req, res, next) => {
      console.log("Received Spotify callback");
      passport.authenticate("spotify", {
        failureRedirect: "/auth",
        failureMessage: true,
      })(req, res, next);
    },
    (req, res) => {
      console.log("Spotify authentication successful, redirecting to home");
      res.redirect("/");
    },
  );

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}