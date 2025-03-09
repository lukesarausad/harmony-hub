import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { PlaylistCard } from "@/components/playlist-card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function ExplorePage() {
  const { data: playlists, isLoading } = useQuery({
    queryKey: ["/api/playlists/discover"],
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Discover Playlists</h1>
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search playlists..." />
        </div>

        {isLoading ? (
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
            <p className="text-muted-foreground">
              No playlists found. Be the first to create one!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
