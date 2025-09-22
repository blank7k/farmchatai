import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { MessageCircle, Heart, Camera, MapPin, Flame, Users, Send } from "lucide-react";

interface CommunityTabProps {
  farmerId: string;
}

export default function CommunityTab({ farmerId }: CommunityTabProps) {
  const { t } = useLanguage();
  const [newPost, setNewPost] = useState("");

  const discussions = [
    {
      id: "1",
      author: "Ravi Kumar",
      time: "2h ago",
      content: "Best organic fertilizer for coconut trees? My trees are not growing well despite regular watering.",
      likes: 12,
      replies: 5,
      tags: ["#OrganicFarming", "#CoconutTrees"]
    },
    {
      id: "2", 
      author: "Meera Nair",
      time: "4h ago",
      content: "Anyone tried intercropping with banana plants? What vegetables work best?",
      likes: 8,
      replies: 3,
      tags: ["#Intercropping", "#Banana"]
    },
    {
      id: "3",
      author: "Suresh Pillai", 
      time: "6h ago",
      content: "Share: My pepper harvest this year was 40% better using organic methods. Happy to share tips!",
      likes: 25,
      replies: 12,
      tags: ["#PeppetFarming", "#OrganicMethods"]
    }
  ];

  const popularTopics = [
    "#OrganicFarming",
    "#PestControl", 
    "#RiceCultivation",
    "#CoconutTrees",
    "#SpiceFarming",
    "#WaterManagement"
  ];

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    // TODO: Implement post submission
    setNewPost("");
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Recent Discussions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="text-primary" size={20} />
            <span>{t("community.recentDiscussions")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {discussion.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-sm">{discussion.author}</h4>
                    <span className="text-xs text-muted-foreground">{discussion.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{discussion.content}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {discussion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary p-0"
                      data-testid={`button-like-${discussion.id}`}
                    >
                      <Heart size={14} />
                      <span>{discussion.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary p-0"
                      data-testid={`button-reply-${discussion.id}`}
                    >
                      <MessageCircle size={14} />
                      <span>{discussion.replies} replies</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ask Community */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Users className="text-primary" size={20} />
            <span>{t("community.askCommunity")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={t("community.postPlaceholder")}
            rows={3}
            className="resize-none"
            data-testid="textarea-new-post"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" data-testid="button-add-image">
                <Camera size={16} />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-add-location">
                <MapPin size={16} />
              </Button>
            </div>
            <Button
              onClick={handlePostSubmit}
              disabled={!newPost.trim()}
              className="flex items-center space-x-2"
              data-testid="button-post-question"
            >
              <Send size={16} />
              <span>{t("community.postQuestion")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Flame className="text-accent" size={20} />
            <span>{t("community.popularTopics")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                className="rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary"
                data-testid={`button-topic-${topic.replace('#', '')}`}
              >
                {topic}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">{t("community.guidelines.title")}</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• {t("community.guidelines.respectful")}</p>
            <p>• {t("community.guidelines.relevant")}</p>
            <p>• {t("community.guidelines.helpful")}</p>
            <p>• {t("community.guidelines.accurate")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
