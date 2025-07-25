import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Activity, 
  Moon, 
  Footprints, 
  Target,
  TrendingUp,
  Calendar,
  Plus,
  BarChart3,
  Settings,
  Bell
} from "lucide-react";

const Health = () => {
  const [todayStats] = useState({
    steps: 8432,
    goal: 10000,
    heartRate: 72,
    sleep: 7.5,
    water: 6,
    waterGoal: 8,
    mood: 'Energized',
    workouts: 1
  });

  const [weeklyData] = useState([
    { day: 'Mon', steps: 8932, mood: 5 },
    { day: 'Tue', steps: 7245, mood: 4 },
    { day: 'Wed', steps: 9821, mood: 5 },
    { day: 'Thu', steps: 6543, mood: 3 },
    { day: 'Fri', steps: 8432, mood: 4 },
    { day: 'Sat', steps: 11234, mood: 5 },
    { day: 'Sun', steps: 9876, mood: 4 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-border/50 shadow-widget">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-health" />
              Health & Wellness
            </h1>
            <p className="text-sm text-muted-foreground">Your wellbeing dashboard</p>
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

      <div className="p-4 space-y-6">
        {/* Today's Overview */}
        <Card className="bg-gradient-health text-white shadow-soft border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{todayStats.steps.toLocaleString()}</div>
                <div className="text-white/80">of {todayStats.goal.toLocaleString()} steps</div>
                <Progress value={(todayStats.steps / todayStats.goal) * 100} className="mt-2 bg-white/20" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{todayStats.mood}</div>
                <div className="text-white/80">Energy level</div>
                <div className="flex justify-center mt-2">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`w-3 h-3 rounded-full mx-1 ${i <= 4 ? 'bg-white' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-health mx-auto mb-2" />
              <div className="text-2xl font-bold text-health">{todayStats.heartRate}</div>
              <div className="text-sm text-muted-foreground">Avg BPM</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Moon className="h-8 w-8 text-calendar mx-auto mb-2" />
              <div className="text-2xl font-bold text-calendar">{todayStats.sleep}h</div>
              <div className="text-sm text-muted-foreground">Sleep</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trends */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-10">{day.day}</span>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-health h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(day.steps / 12000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {day.steps.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Goals */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-mood" />
              Current Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-health/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Footprints className="h-5 w-5 text-health" />
                <span className="font-medium">Daily Steps</span>
              </div>
              <Badge variant="secondary" className="bg-health text-white">
                84% Complete
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-calendar/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-calendar" />
                <span className="font-medium">Sleep 7+ hours</span>
              </div>
              <Badge variant="secondary" className="bg-calendar text-white">
                On Track
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-mood/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-mood" />
                <span className="font-medium">Workout 3x/week</span>
              </div>
              <Badge variant="secondary" className="bg-mood text-white">
                2 of 3
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 bg-gradient-health hover:opacity-90">
                <div className="text-center">
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Log Workout</div>
                </div>
              </Button>
              <Button className="h-16 bg-gradient-mood hover:opacity-90">
                <div className="text-center">
                  <Activity className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Update Mood</div>
                </div>
              </Button>
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

export default Health;