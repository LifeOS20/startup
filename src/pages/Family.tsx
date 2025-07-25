import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  Plus,
  Settings,
  Bell,
  Baby,
  Car,
  Home as HomeIcon,
  Utensils
} from "lucide-react";

const Family = () => {
  const [familyMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Partner',
      avatar: '/api/placeholder/100/100',
      status: 'At work',
      location: 'Downtown Office',
      mood: 'Focused',
      initials: 'SJ'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      role: 'Daughter',
      avatar: '/api/placeholder/100/100',
      status: 'At school',
      location: 'Pine Elementary',
      mood: 'Happy',
      initials: 'EJ'
    },
    {
      id: 3,
      name: 'Max Johnson',
      role: 'Son',
      avatar: '/api/placeholder/100/100',
      status: 'At daycare',
      location: 'Little Stars Daycare',
      mood: 'Playful',
      initials: 'MJ'
    }
  ]);

  const [todaySchedule] = useState([
    { time: '8:00 AM', event: 'Emma - School drop-off', assignee: 'You', type: 'school' },
    { time: '9:30 AM', event: 'Max - Daycare drop-off', assignee: 'Sarah', type: 'daycare' },
    { time: '3:00 PM', event: 'Emma - School pickup', assignee: 'Sarah', type: 'school' },
    { time: '5:30 PM', event: 'Max - Daycare pickup', assignee: 'You', type: 'daycare' },
    { time: '7:00 PM', event: 'Family dinner', assignee: 'Together', type: 'family' }
  ]);

  const [familyTasks] = useState([
    { task: 'Grocery shopping', assignee: 'Sarah', dueDate: 'Today', priority: 'high' },
    { task: 'Pick up dry cleaning', assignee: 'You', dueDate: 'Tomorrow', priority: 'medium' },
    { task: 'Emma\'s dentist appointment', assignee: 'Sarah', dueDate: 'Friday', priority: 'high' },
    { task: 'Car maintenance', assignee: 'You', dueDate: 'Weekend', priority: 'low' }
  ]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'school': return Baby;
      case 'daycare': return Heart;
      case 'family': return Utensils;
      default: return Calendar;
    }
  };

  const getAssigneeColor = (assignee: string) => {
    switch (assignee) {
      case 'You': return 'bg-primary';
      case 'Sarah': return 'bg-mood';
      case 'Together': return 'bg-health';
      default: return 'bg-calendar';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-finance';
      case 'low': return 'bg-muted-foreground';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-border/50 shadow-widget">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-mood" />
              Family Hub
            </h1>
            <p className="text-sm text-muted-foreground">Johnson Family Dashboard</p>
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
        {/* Family Status */}
        <Card className="bg-gradient-mood text-white shadow-soft border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Family Status</h2>
            <div className="grid grid-cols-1 gap-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-white/80 text-sm">{member.status} • {member.location}</div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {member.mood}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 text-health mx-auto mb-2" />
              <div className="text-lg font-bold text-health">Call Sarah</div>
              <div className="text-sm text-muted-foreground">Quick contact</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-calendar mx-auto mb-2" />
              <div className="text-lg font-bold text-calendar">Family Chat</div>
              <div className="text-sm text-muted-foreground">3 new messages</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Family Schedule */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-calendar" />
              Today's Family Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.map((item, index) => {
              const IconComponent = getEventIcon(item.type);
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg ${getAssigneeColor(item.assignee)}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.event}</div>
                    <div className="text-sm text-muted-foreground">{item.time}</div>
                  </div>
                  <Badge variant="secondary" className={`${getAssigneeColor(item.assignee)} text-white`}>
                    {item.assignee}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Family Tasks */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-health" />
              Family Tasks & Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {familyTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                <div className="flex-1">
                  <div className="font-medium">{task.task}</div>
                  <div className="text-sm text-muted-foreground">Due: {task.dueDate}</div>
                </div>
                <Badge variant="outline">
                  {task.assignee}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Family Stats */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-health/5 rounded-lg">
                <div className="text-2xl font-bold text-health">12</div>
                <div className="text-sm text-muted-foreground">Family activities</div>
              </div>
              <div className="text-center p-3 bg-calendar/5 rounded-lg">
                <div className="text-2xl font-bold text-calendar">8</div>
                <div className="text-sm text-muted-foreground">Shared meals</div>
              </div>
              <div className="text-center p-3 bg-mood/5 rounded-lg">
                <div className="text-2xl font-bold text-mood">5</div>
                <div className="text-sm text-muted-foreground">Tasks completed</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">3h</div>
                <div className="text-sm text-muted-foreground">Quality time</div>
              </div>
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
              <Button className="h-16 bg-gradient-mood hover:opacity-90">
                <div className="text-center">
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Add Task</div>
                </div>
              </Button>
              <Button className="h-16 bg-gradient-calendar hover:opacity-90">
                <div className="text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Plan Activity</div>
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

export default Family;