import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ScheduleItem } from '../stores/lifeOSStore';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  recurrence?: string[];
  colorId?: string;
  status: string;
  created: string;
  updated: string;
}

export interface GoogleCalendarList {
  items: Array<{
    id: string;
    summary: string;
    description?: string;
    primary?: boolean;
    accessRole: string;
  }>;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private calendarId: string = 'primary';
  private isInitialized: boolean = false;

  constructor() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Replace with your actual client ID
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
  
    try {
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const tokens = await GoogleSignin.getTokens();
        this.accessToken = tokens.accessToken;
      }
  
      this.isInitialized = true;
      console.log('Google Calendar Service initialized');
    } catch (error) {
      console.error('Failed to initialize Google Calendar Service:', error);
      throw error;
    }
  }

  async signIn(): Promise<boolean> {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      
      console.log('Google Sign-In successful');
      return true;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      this.accessToken = null;
      this.refreshToken = null;
      console.log('Google Sign-Out successful');
    } catch (error) {
      console.error('Google Sign-Out failed:', error);
      throw error;
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please sign in first.');
    }

    const url = `https://www.googleapis.com/calendar/v3${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.refreshAccessToken();
          return this.makeRequest(endpoint, method, body);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Calendar API request failed:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      console.log('Access token refreshed');
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }

  async getCalendarList(): Promise<GoogleCalendarList> {
    await this.initialize();
    return this.makeRequest('/users/me/calendarList');
  }

  async getEvents(
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 100
  ): Promise<{ items: GoogleCalendarEvent[] }> {
    await this.initialize();

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMin) {
      params.append('timeMin', timeMin.toISOString());
    }
    if (timeMax) {
      params.append('timeMax', timeMax.toISOString());
    }

    return this.makeRequest(`/calendars/${calendarId}/events?${params.toString()}`);
  }

  async createEvent(calendarId: string = 'primary', event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    await this.initialize();
    return this.makeRequest(`/calendars/${calendarId}/events`, 'POST', event);
  }

  async updateEvent(
    calendarId: string = 'primary',
    eventId: string,
    event: Partial<GoogleCalendarEvent>
  ): Promise<GoogleCalendarEvent> {
    await this.initialize();
    return this.makeRequest(`/calendars/${calendarId}/events/${eventId}`, 'PUT', event);
  }

  async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
    await this.initialize();
    await this.makeRequest(`/calendars/${calendarId}/events/${eventId}`, 'DELETE');
  }

  async syncToLifeOS(userId: string): Promise<ScheduleItem[]> {
    try {
      const events = await this.getEvents();
      const scheduleItems: ScheduleItem[] = [];

      for (const event of events.items) {
        const scheduleItem: ScheduleItem = {
          id: `google_${event.id}`,
          title: event.summary,
          description: event.description,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
          type: this.mapEventType(event),
          priority: this.mapPriority(event),
          status: 'scheduled',
          location: event.location,
          attendees: event.attendees?.map(a => a.email) || [],
          reminders: this.mapReminders(event),
          aiOptimized: false,
          energyLevel: 'medium',
          tags: this.extractTags(event),
        };

        scheduleItems.push(scheduleItem);
      }

      return scheduleItems;
    } catch (error) {
      console.error('Failed to sync Google Calendar to LifeOS:', error);
      throw error;
    }
  }

  async syncFromLifeOS(scheduleItems: ScheduleItem[]): Promise<void> {
    try {
      for (const item of scheduleItems) {
        if (item.id.startsWith('google_')) {
          // Update existing event
          const googleEventId = item.id.replace('google_', '');
          await this.updateEvent('primary', googleEventId, this.mapToGoogleEvent(item));
        } else {
          // Create new event
          await this.createEvent('primary', this.mapToGoogleEvent(item));
        }
      }
    } catch (error) {
      console.error('Failed to sync LifeOS to Google Calendar:', error);
      throw error;
    }
  }

  private mapEventType(event: GoogleCalendarEvent): ScheduleItem['type'] {
    const summary = event.summary.toLowerCase();
    const description = event.description?.toLowerCase() || '';

    if (summary.includes('work') || summary.includes('meeting') || summary.includes('call')) {
      return 'work';
    }
    if (summary.includes('health') || summary.includes('workout') || summary.includes('gym')) {
      return 'health';
    }
    if (summary.includes('finance') || summary.includes('budget') || summary.includes('bill')) {
      return 'finance';
    }
    if (summary.includes('family') || summary.includes('kids') || summary.includes('spouse')) {
      return 'family';
    }
    if (summary.includes('home') || summary.includes('smart') || summary.includes('automation')) {
      return 'other'; // Smart home events
    }

    return 'personal';
  }

  private mapPriority(event: GoogleCalendarEvent): ScheduleItem['priority'] {
    const summary = event.summary.toLowerCase();
    
    if (summary.includes('urgent') || summary.includes('important')) {
      return 'high';
    }
    if (summary.includes('critical') || summary.includes('emergency')) {
      return 'urgent';
    }
    
    return 'medium';
  }

  private mapReminders(event: GoogleCalendarEvent): ScheduleItem['reminders'] {
    const reminders: ScheduleItem['reminders'] = [];

    if (event.reminders?.overrides) {
      for (const reminder of event.reminders.overrides) {
        reminders.push({
          time: new Date(Date.now() + reminder.minutes * 60 * 1000),
          type: reminder.method === 'email' ? 'email' : 'notification',
        });
      }
    }

    return reminders;
  }

  private extractTags(event: GoogleCalendarEvent): string[] {
    const tags: string[] = [];
    const text = `${event.summary} ${event.description || ''}`.toLowerCase();

    if (text.includes('recurring')) tags.push('recurring');
    if (text.includes('travel')) tags.push('travel');
    if (text.includes('remote')) tags.push('remote');
    if (text.includes('in-person')) tags.push('in-person');

    return tags;
  }

  private mapToGoogleEvent(item: ScheduleItem): Partial<GoogleCalendarEvent> {
    return {
      summary: item.title,
      description: item.description,
      start: {
        dateTime: item.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: item.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: item.location,
      attendees: item.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: item.reminders.length === 0,
        overrides: item.reminders.map(reminder => ({
          method: reminder.type === 'email' ? 'email' : 'popup',
          minutes: Math.floor((reminder.time.getTime() - Date.now()) / (1000 * 60)),
        })),
      },
    };
  }

  async getUpcomingEvents(days: number = 7): Promise<GoogleCalendarEvent[]> {
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);

    const events = await this.getEvents('primary', timeMin, timeMax);
    return events.items;
  }

  async getTodayEvents(): Promise<GoogleCalendarEvent[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await this.getEvents('primary', today, tomorrow);
    return events.items;
  }

  async searchEvents(query: string, maxResults: number = 50): Promise<GoogleCalendarEvent[]> {
    await this.initialize();

    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const events = await this.makeRequest(`/calendars/primary/events?${params.toString()}`);
    return events.items;
  }

  async getFreeBusy(calendarIds: string[], timeMin: Date, timeMax: Date): Promise<any> {
    await this.initialize();

    const body = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: calendarIds.map(id => ({ id })),
    };

    return this.makeRequest('/freeBusy', 'POST', body);
  }

  async createRecurringEvent(
    calendarId: string = 'primary',
    event: Partial<GoogleCalendarEvent>,
    recurrence: string[]
  ): Promise<GoogleCalendarEvent> {
    await this.initialize();
    
    const eventWithRecurrence = {
      ...event,
      recurrence,
    };

    return this.makeRequest(`/calendars/${calendarId}/events`, 'POST', eventWithRecurrence);
  }

  async getEventInstances(
    calendarId: string = 'primary',
    eventId: string,
    timeMin?: Date,
    timeMax?: Date
  ): Promise<{ items: GoogleCalendarEvent[] }> {
    await this.initialize();

    const params = new URLSearchParams({
      singleEvents: 'true',
    });

    if (timeMin) {
      params.append('timeMin', timeMin.toISOString());
    }
    if (timeMax) {
      params.append('timeMax', timeMax.toISOString());
    }

    return this.makeRequest(`/calendars/${calendarId}/events/${eventId}/instances?${params.toString()}`);
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();