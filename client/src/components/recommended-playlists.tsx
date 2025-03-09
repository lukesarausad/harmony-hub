import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Music } from "lucide-react";
import { Link } from "wouter";

export function RecommendedPlaylists() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recommendations?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Follow users to get playlist recommendations
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {recommendations.map((playlist) => (
          <Card key={playlist.id}>
            <CardHeader>
              <CardTitle className="text-base truncate">{playlist.name}</CardTitle>
              <CardDescription className="text-sm truncate">
                {playlist.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music className="h-4 w-4" />
                  <span>{playlist.tracks?.length || 0} tracks</span>
                </div>
                <Link
                  href={`/playlist/${playlist.id}`}
                  className="text-primary hover:underline"
                >
                  View playlist
                </Link>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {playlist.reason}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
