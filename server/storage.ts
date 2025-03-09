import session from "express-session";
import createMemoryStore from "memorystore";
import { User, InsertUser, Playlist, Comment, Follow } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser & Partial<Pick<User, "spotifyId" | "spotifyToken" | "spotifyRefreshToken">>): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  createPlaylist(playlist: Omit<Playlist, "id">): Promise<Playlist>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  updatePlaylist(id: number, updates: Partial<Playlist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;

  createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
  getPlaylistComments(playlistId: number): Promise<Comment[]>;

  followUser(followerId: number, followedId: number): Promise<Follow>;
  unfollowUser(followerId: number, followedId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private playlists: Map<number, Playlist>;
  private comments: Map<number, Comment>;
  private follows: Map<number, Follow>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.playlists = new Map();
    this.comments = new Map();
    this.follows = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser & Partial<Pick<User, "spotifyId" | "spotifyToken" | "spotifyRefreshToken">>): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id } as User;
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async createPlaylist(playlist: Omit<Playlist, "id">): Promise<Playlist> {
    const id = this.currentId++;
    const newPlaylist = { ...playlist, id } as Playlist;
    this.playlists.set(id, newPlaylist);
    return newPlaylist;
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      (playlist) => playlist.userId === userId,
    );
  }

  async updatePlaylist(id: number, updates: Partial<Playlist>): Promise<Playlist> {
    const playlist = await this.getPlaylist(id);
    if (!playlist) throw new Error("Playlist not found");

    const updated = { ...playlist, ...updates };
    this.playlists.set(id, updated);
    return updated;
  }

  async deletePlaylist(id: number): Promise<void> {
    this.playlists.delete(id);
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const id = this.currentId++;
    const newComment = { 
      ...comment, 
      id, 
      createdAt: new Date() 
    } as Comment;
    this.comments.set(id, newComment);
    return newComment;
  }

  async getPlaylistComments(playlistId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.playlistId === playlistId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async followUser(followerId: number, followedId: number): Promise<Follow> {
    const id = this.currentId++;
    const follow = { id, followerId, followedId } as Follow;
    this.follows.set(id, follow);
    return follow;
  }

  async unfollowUser(followerId: number, followedId: number): Promise<void> {
    const follow = Array.from(this.follows.values()).find(
      (f) => f.followerId === followerId && f.followedId === followedId,
    );
    if (follow) {
      this.follows.delete(follow.id);
    }
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter((f) => f.followedId === userId)
      .map((f) => f.followerId);

    return Array.from(this.users.values())
      .filter((user) => followerIds.includes(user.id));
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter((f) => f.followerId === userId)
      .map((f) => f.followedId);

    return Array.from(this.users.values())
      .filter((user) => followingIds.includes(user.id));
  }
}

export const storage = new MemStorage();