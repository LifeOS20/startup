import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Plus,
  Settings,
  Bell,
  Video,
  Coffee,
  Car
} from "lucide-react";

const Schedule = () => {
  const [todayMeetings] = useState([
    {
      id: '1',
      title: 'Team Sync',
      time: '9:00 AM',
      duration: '30 min',
      type: 'meeting',
      attendees: 5,
      location: 'Conference Room A',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Coffee with Sarah',
      time: '11:30 AM',
      duration: '45 min',
      type: 'personal',
      attendees: 2,
      location: 'Starbucks Downtown',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Product Review',
      time: '2:00 PM',
      duration: '60 min',
      type: 'meeting',
      attendees: 8,
      location: 'Zoom',
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Gym Session',
      time: '6:00 PM',
      duration: '90 min',
      type: 'personal',
      attendees: 1,
      location: 'FitLife Gym',
      status: 'upcoming'
    }
  ]);

  const [upcomingEvents] = useState([
    { date: 'Tomorrow', event: 'Doctor Appointment', time: '10:00 AM' },
    { date: 'Friday', event: 'Project Deadline', time: 'All Day' },
    { date: 'Saturday', event: 'Family Dinner', time: '7:00 PM' }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users;
      case 'personal': return Coffee;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-calendar';
      case 'personal': return 'bg-mood';
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
              <Calendar className="h-6 w-6 text-calendar" />
              Your Schedule
            </h1>
            <p className="text-sm text-muted-foreground">Today, March 15, 2024</p>
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
        {/* Daily Overview */}
        <Card className="bg-gradient-calendar text-white shadow-soft border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">4</div>
                <div className="text-white/80 text-sm">Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3.5h</div>
                <div className="text-white/80 text-sm">Busy time</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2.5h</div>
                <div className="text-white/80 text-sm">Free time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Meeting */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm border-l-4 border-l-calendar">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-calendar/20 text-calendar">
                Up next in 45 min
              </Badge>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Team Sync</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                9:00 AM - 9:30 AM
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Conference Room A
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayMeetings.map((meeting) => {
              const IconComponent = getTypeIcon(meeting.type);
              return (
                <div key={meeting.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg ${getTypeColor(meeting.type)}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{meeting.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{meeting.time}</span>
                      <span>•</span>
                      <span>{meeting.duration}</span>
                      {meeting.location && (
                        <>
                          <span>•</span>
                          <span>{meeting.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {meeting.type === 'meeting' && meeting.location === 'Zoom' && (
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  )}
                  {meeting.type === 'personal' && meeting.location !== 'Zoom' && (
                    <Button size="sm" variant="outline">
                      <Car className="h-4 w-4 mr-1" />
                      Navigate
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Upcoming This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div>
                  <div className="font-medium">{event.event}</div>
                  <div className="text-sm text-muted-foreground">{event.date}</div>
                </div>
                <div className="text-sm font-medium text-primary">{event.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 bg-gradient-calendar hover:opacity-90">
                <div className="text-center">
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">New Event</div>
                </div>
              </Button>
              <Button className="h-16 bg-gradient-primary hover:opacity-90">
                <div className="text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">Block Time</div>
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

export default Schedule;