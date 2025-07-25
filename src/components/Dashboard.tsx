import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "./BottomNavigation";
import { 
  Calendar, 
  Heart, 
  DollarSign, 
  Bell, 
  Settings, 
  Home,
  Users,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  ChevronRight,
  Sparkles,
  Sun,
  Target
} from "lucide-react";

interface WidgetData {
  id: string;
  title: string;
  type: 'health' | 'finance' | 'calendar' | 'mood' | 'home';
  priority: number;
  content: any;
}

const Dashboard = () => {
  const [widgets] = useState<WidgetData[]>([
    {
      id: '1',
      title: 'Wellness Check',
      type: 'health',
      priority: 1,
      content: {
        steps: 8432,
        heartRate: 72,
        sleep: 7.5,
        mood: 'Energized'
      }
    },
    {
      id: '2', 
      title: 'Your Day Ahead',
      type: 'calendar',
      priority: 2,
      content: {
        nextMeeting: 'Team Sync in 45 min',
        totalMeetings: 4,
        freeTime: '2.5 hours'
      }
    },
    {
      id: '3',
      title: 'Money Matters',
      type: 'finance',
      priority: 3,
      content: {
        spending: 245,
        budget: 800,
        savings: 1250,
        streak: 7
      }
    }
  ]);

  const getWidgetGradient = (type: string) => {
    switch (type) {
      case 'health': return 'bg-gradient-health';
      case 'finance': return 'bg-gradient-finance';
      case 'calendar': return 'bg-gradient-calendar';
      case 'mood': return 'bg-gradient-mood';
      default: return 'bg-gradient-primary';
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'health': return Heart;
      case 'finance': return DollarSign;
      case 'calendar': return Calendar;
      case 'mood': return Activity;
      default: return Plus;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-border/50 shadow-widget">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              LifeOS
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Your life, beautifully organized</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="p-4">
        <Card className="bg-gradient-primary text-white shadow-soft border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold">Good Morning! ✨</h2>
            </div>
            <p className="text-white/90 mb-4 leading-relaxed">
              You're crushing it today! 4 meetings scheduled, wellness goals on track, and your energy is fantastic.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                <Target className="h-3 w-3 mr-1" />
                Goals on track
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                7-day streak
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="p-4 space-y-4">
        {widgets.map((widget) => {
          const IconComponent = getWidgetIcon(widget.type);
          
          return (
            <Card key={widget.id} className="shadow-card hover:shadow-soft transition-all duration-300 border-border/50 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className={`p-3 rounded-xl ${getWidgetGradient(widget.type)} shadow-widget`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-foreground">{widget.title}</span>
                  </CardTitle>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {widget.type === 'health' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-health/5 rounded-lg">
                      <div className="text-2xl font-bold text-health">{widget.content.steps.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-medium">Steps today</div>
                    </div>
                    <div className="text-center p-3 bg-health/5 rounded-lg">
                      <div className="text-2xl font-bold text-health">{widget.content.heartRate}</div>
                      <div className="text-xs text-muted-foreground font-medium">Avg BPM</div>
                    </div>
                    <div className="text-center p-3 bg-health/5 rounded-lg">
                      <div className="text-2xl font-bold text-health">{widget.content.sleep}h</div>
                      <div className="text-xs text-muted-foreground font-medium">Sleep</div>
                    </div>
                    <div className="text-center p-3 bg-mood/5 rounded-lg">
                      <div className="text-lg font-bold text-mood">{widget.content.mood}</div>
                      <div className="text-xs text-muted-foreground font-medium">Current mood</div>
                    </div>
                  </div>
                )}
                
                {widget.type === 'calendar' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-calendar/5 rounded-lg">
                      <span className="text-sm text-muted-foreground font-medium">Up next</span>
                      <span className="text-sm font-semibold text-calendar">{widget.content.nextMeeting}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-background rounded-lg border border-border/50">
                        <div className="text-xl font-bold text-calendar">{widget.content.totalMeetings}</div>
                        <div className="text-xs text-muted-foreground">Meetings</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg border border-border/50">
                        <div className="text-xl font-bold text-primary">{widget.content.freeTime}</div>
                        <div className="text-xs text-muted-foreground">Free time</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {widget.type === 'finance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-finance/5 rounded-lg">
                        <div className="text-lg font-bold text-finance">${widget.content.spending}</div>
                        <div className="text-xs text-muted-foreground">Spent today</div>
                      </div>
                      <div className="p-3 bg-finance/5 rounded-lg">
                        <div className="text-lg font-bold text-finance">${widget.content.budget}</div>
                        <div className="text-xs text-muted-foreground">Budget left</div>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="text-lg font-bold text-primary">${widget.content.savings}</div>
                        <div className="text-xs text-muted-foreground">Saved</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget usage</span>
                        <span className="font-medium">{Math.round((widget.content.spending / widget.content.budget) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-finance h-3 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(widget.content.spending / widget.content.budget) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-xs text-muted-foreground">{widget.content.streak}-day saving streak!</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {/* Add Widget Card */}
        <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">Add a new widget</p>
              <p className="text-xs text-muted-foreground mt-1">Customize your dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
      
      {/* Bottom padding for navigation */}
      <div className="h-20" />
    </div>
  );
};

export default Dashboard;