import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPlaylistSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Playlists
  app.get("/api/playlists", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const playlists = await storage.getUserPlaylists(req.user.id);
    res.json(playlists);
  });

  app.post("/api/playlists", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertPlaylistSchema.parse(req.body);
    const playlist = await storage.createPlaylist({
      ...validated,
      userId: req.user.id,
    });
    res.status(201).json(playlist);
  });

  app.get("/api/playlists/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const playlist = await storage.getPlaylist(Number(req.params.id));
    if (!playlist) return res.sendStatus(404);
    res.json(playlist);
  });

  app.put("/api/playlists/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const playlist = await storage.getPlaylist(Number(req.params.id));
    if (!playlist) return res.sendStatus(404);
    if (playlist.userId !== req.user.id) return res.sendStatus(403);
    const validated = insertPlaylistSchema.parse(req.body);
    const updated = await storage.updatePlaylist(playlist.id, validated);
    res.json(updated);
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const playlist = await storage.getPlaylist(Number(req.params.id));
    if (!playlist) return res.sendStatus(404);
    if (playlist.userId !== req.user.id) return res.sendStatus(403);
    await storage.deletePlaylist(playlist.id);
    res.sendStatus(204);
  });

  // Comments
  app.get("/api/playlists/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const comments = await storage.getPlaylistComments(Number(req.params.id));
    res.json(comments);
  });

  app.post("/api/playlists/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertCommentSchema.parse(req.body);
    const comment = await storage.createComment({
      ...validated,
      userId: req.user.id,
      playlistId: Number(req.params.id),
    });
    res.status(201).json(comment);
  });

  // Follows
  app.post("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const followedId = Number(req.params.id);
    if (followedId === req.user.id) return res.status(400).send("Cannot follow yourself");
    const follow = await storage.followUser(req.user.id, followedId);
    res.status(201).json(follow);
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.unfollowUser(req.user.id, Number(req.params.id));
    res.sendStatus(204);
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const followers = await storage.getFollowers(Number(req.params.id));
    res.json(followers);
  });

  app.get("/api/users/:id/following", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const following = await storage.getFollowing(Number(req.params.id));
    res.json(following);
  });

  // Recommendations
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Get user's followed users' playlists
    const following = await storage.getFollowing(req.user.id);
    const followedPlaylists = await Promise.all(
      following.map(async (user) => {
        const playlists = await storage.getUserPlaylists(user.id);
        return playlists.map(playlist => ({
          ...playlist,
          reason: `From ${user.username} who you follow`
        }));
      })
    );

    // Flatten and sort by most recent
    const recommendations = followedPlaylists
      .flat()
      .sort((a, b) => b.id - a.id)
      .slice(0, 6);

    res.json(recommendations);
  });

  const httpServer = createServer(app);
  return httpServer;
}