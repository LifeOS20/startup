import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight
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
      title: 'Health Overview',
      type: 'health',
      priority: 1,
      content: {
        steps: 8432,
        heartRate: 72,
        sleep: 7.5,
        mood: 'Great'
      }
    },
    {
      id: '2', 
      title: 'Today\'s Schedule',
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
      title: 'Financial Snapshot',
      type: 'finance',
      priority: 3,
      content: {
        spending: 245,
        budget: 800,
        savings: 1250
      }
    }
  ]);

  const getWidgetGradient = (type: string) => {
    switch (type) {
      case 'health': return 'bg-gradient-health';
      case 'finance': return 'bg-gradient-finance';
      case 'calendar': return 'bg-gradient-calendar';
      case 'mood': return 'bg-primary';
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
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LifeOS
            </h1>
            <p className="text-sm text-muted-foreground">Your Personal CEO</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Briefing */}
      <div className="p-4">
        <Card className="bg-gradient-primary text-white shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Good Morning! ☀️</h2>
            <p className="text-white/90 mb-4">
              You have 4 meetings today, your energy is high, and you're on track with your wellness goals.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Optimized Schedule
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Great Progress
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
            <Card key={widget.id} className="shadow-card hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`p-2 rounded-lg ${getWidgetGradient(widget.type)}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    {widget.title}
                  </CardTitle>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {widget.type === 'health' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-health">{widget.content.steps}</div>
                      <div className="text-xs text-muted-foreground">Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-health">{widget.content.heartRate}</div>
                      <div className="text-xs text-muted-foreground">BPM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-health">{widget.content.sleep}h</div>
                      <div className="text-xs text-muted-foreground">Sleep</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-mood">{widget.content.mood}</div>
                      <div className="text-xs text-muted-foreground">Mood</div>
                    </div>
                  </div>
                )}
                
                {widget.type === 'calendar' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Meeting</span>
                      <span className="text-sm font-medium">{widget.content.nextMeeting}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Today</span>
                      <span className="text-sm font-medium">{widget.content.totalMeetings} meetings</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Free Time</span>
                      <span className="text-sm font-medium text-calendar">{widget.content.freeTime}</span>
                    </div>
                  </div>
                )}
                
                {widget.type === 'finance' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Spent Today</span>
                      <span className="text-sm font-medium">${widget.content.spending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Budget</span>
                      <span className="text-sm font-medium">${widget.content.budget}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Savings</span>
                      <span className="text-sm font-medium text-finance">${widget.content.savings}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-finance h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(widget.content.spending / widget.content.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {/* Add Widget Card */}
        <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Add Widget</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Schedule</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2">
            <Heart className="h-5 w-5" />
            <span className="text-xs">Health</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-xs">Finance</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2">
            <Users className="h-5 w-5" />
            <span className="text-xs">Family</span>
          </Button>
        </div>
      </div>
      
      {/* Bottom padding for navigation */}
      <div className="h-20" />
    </div>
  );
};

export default Dashboard;