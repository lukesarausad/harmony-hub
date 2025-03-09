import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface ActivityFeedProps {
  userId: number;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { data: following } = useQuery({
    queryKey: ["/api/users", userId, "following"],
  });

  const { data: comments, isLoading } = useQuery({
    queryKey: ["/api/activity"],
    enabled: Boolean(following?.length),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!following?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Follow other users to see their activity here
        </CardContent>
      </Card>
    );
  }

  if (!comments?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No recent activity
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 pr-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {comment.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="font-medium hover:underline"
                    >
                      {comment.user.username}
                    </Link>{" "}
                    commented on{" "}
                    <Link
                      href={`/playlist/${comment.playlist.id}`}
                      className="font-medium hover:underline"
                    >
                      {comment.playlist.name}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
