import { useAuth } from "@/hooks/use-auth";
import { MainNav } from "@/components/main-nav";
import { PlaylistCard } from "@/components/playlist-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const userId = parseInt(id);

  const { data: user } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: userId !== currentUser?.id,
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ["/api/playlists", userId],
  });

  const { data: followers } = useQuery({
    queryKey: ["/api/users", userId, "followers"],
  });

  const { data: following } = useQuery({
    queryKey: ["/api/users", userId, "following"],
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "followers"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "followers"] });
    },
  });

  const isFollowing = followers?.some((f) => f.id === currentUser?.id);
  const displayUser = userId === currentUser?.id ? currentUser : user;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {displayUser?.username}'s Profile
              </h1>
              <div className="flex gap-4 text-muted-foreground">
                <span>{followers?.length || 0} followers</span>
                <span>{following?.length || 0} following</span>
              </div>
            </div>

            {userId !== currentUser?.id && (
              <Button
                variant={isFollowing ? "destructive" : "default"}
                onClick={() =>
                  isFollowing
                    ? unfollowMutation.mutate()
                    : followMutation.mutate()
                }
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {followMutation.isPending || unfollowMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="mr-2 h-4 w-4" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6">Playlists</h2>
          {playlistsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : playlists?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No playlists found</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
