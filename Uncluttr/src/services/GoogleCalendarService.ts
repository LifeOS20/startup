import { Platform } from 'react-native';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ScheduleItem } from '../stores/lifeOSStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface CalendarAnalytics {
  totalMeetings: number;
  averageDaily: number;
  longestMeetingStreak: number;
  focusTimePerDay: number;
  meetingTypes: {
    internal: number;
    external: number;
    recurring: number;
    oneOn: number;
  };
  timePatterns: {
    morningMeetings: number;
    afternoonMeetings: number;
    eveningMeetings: number;
  };
  workloadTrend: 'increasing' | 'stable' | 'decreasing';
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
      webClientId: Config.GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if user is already signed in
      try {
        const userInfo = await GoogleSignin.getCurrentUser();
        if (userInfo) {
          const tokens = await GoogleSignin.getTokens();
          this.accessToken = tokens.accessToken;
        }
      } catch (error) {
        // User not signed in, continue with initialization
        console.log('User not signed in');
      }

      this.isInitialized = true;
      console.log('Google Calendar Service initialized');
    } catch (error) {
      console.error('Failed to initialize Google Calendar Service:', error);
      throw error;
    }
  }

  // AI-Enhanced Calendar Analytics
  async getCalendarAnalytics(days: number = 30): Promise<CalendarAnalytics> {
    try {
      const timeMin = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const timeMax = new Date().toISOString();

      const eventsResponse = await this.getEvents('primary', new Date(Date.now() - days * 24 * 60 * 60 * 1000), new Date());
      const events = eventsResponse.items;

      return this.analyzeCalendarData(events, days);
    } catch (error) {
      console.error('Error getting calendar analytics:', error);
      throw error;
    }
  }

  // AI-powered workload analysis
  private analyzeCalendarData(events: GoogleCalendarEvent[], days: number): CalendarAnalytics {
    const totalMeetings = events.length;
    const averageDaily = totalMeetings / days;

    // Analyze meeting types
    const meetingTypes = {
      internal: events.filter(e => this.isInternalMeeting(e)).length,
      external: events.filter(e => this.isExternalMeeting(e)).length,
      recurring: events.filter(e => e.recurrence && e.recurrence.length > 0).length,
      oneOn: events.filter(e => this.isOneOnOneMeeting(e)).length
    };

    // Analyze time patterns
    const timePatterns = {
      morningMeetings: events.filter(e => this.isMorningMeeting(e)).length,
      afternoonMeetings: events.filter(e => this.isAfternoonMeeting(e)).length,
      eveningMeetings: events.filter(e => this.isEveningMeeting(e)).length
    };

    // Calculate focus time (gaps between meetings)
    const focusTimePerDay = this.calculateFocusTime(events) / days;

    // Detect workload trends
    const workloadTrend = this.detectWorkloadTrend(events, days);

    // Find longest meeting streak
    const longestMeetingStreak = this.findLongestMeetingStreak(events);

    return {
      totalMeetings,
      averageDaily,
      longestMeetingStreak,
      focusTimePerDay,
      meetingTypes,
      timePatterns,
      workloadTrend
    };
  }

  // Smart conflict detection
  async detectConflicts(newEvent: Partial<GoogleCalendarEvent>): Promise<{
    hasConflicts: boolean;
    conflicts: GoogleCalendarEvent[];
    suggestions: string[];
  }> {
    if (!newEvent.start?.dateTime || !newEvent.end?.dateTime) {
      return { hasConflicts: false, conflicts: [], suggestions: [] };
    }

    const startTime = new Date(newEvent.start.dateTime);
    const endTime = new Date(newEvent.end.dateTime);

    // Get events around the proposed time
    const timeMin = new Date(startTime.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour before
    const timeMax = new Date(endTime.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour after

    const existingEventsResponse = await this.getEvents('primary', new Date(timeMin), new Date(timeMax));
    const existingEvents = existingEventsResponse.items;

    const conflicts = existingEvents.filter(event => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      return (startTime < eventEnd && endTime > eventStart);
    });

    const suggestions = this.generateConflictSuggestions(conflicts, newEvent);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      suggestions
    };
  }

  // AI-powered optimal time suggestions
  async suggestOptimalTimes(
    duration: number, // minutes
    preferences: {
      timeRange?: { start: string; end: string };
      energyLevel?: 'high' | 'medium' | 'low';
      meetingType?: 'focus' | 'creative' | 'administrative' | 'social';
      participants?: string[];
    }
  ): Promise<Array<{
    start: Date;
    end: Date;
    score: number;
    reasoning: string;
  }>> {
    try {
      // Get calendar data for analysis
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const eventsResponse = await this.getEvents('primary', tomorrow, nextWeek);
      const events = eventsResponse.items;
      const analytics = await this.getCalendarAnalytics();

      return this.calculateOptimalTimeSlots(duration, preferences, events, analytics);
    } catch (error) {
      console.error('Error suggesting optimal times:', error);
      return [];
    }
  }

  // Burnout detection algorithm
  async detectBurnoutRisk(): Promise<{
    risk: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
    recommendations: string[];
  }> {
    const analytics = await this.getCalendarAnalytics(14); // 2 weeks

    let riskScore = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Factor 1: Meeting density
    if (analytics.averageDaily > 8) {
      riskScore += 30;
      factors.push('High meeting density (>8 meetings/day)');
      recommendations.push('Block focus time between meetings');
    }

    // Factor 2: Long meeting streaks
    if (analytics.longestMeetingStreak > 4) {
      riskScore += 25;
      factors.push('Long consecutive meeting streaks');
      recommendations.push('Add buffer time between meetings');
    }

    // Factor 3: Insufficient focus time
    if (analytics.focusTimePerDay < 2) {
      riskScore += 25;
      factors.push('Limited focus time (<2 hours/day)');
      recommendations.push('Protect morning hours for deep work');
    }

    // Factor 4: Evening meetings
    if (analytics.timePatterns.eveningMeetings > analytics.totalMeetings * 0.2) {
      riskScore += 20;
      factors.push('Frequent evening meetings');
      recommendations.push('Set boundaries for after-hours meetings');
    }

    const risk = riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low';

    return { risk, score: riskScore, factors, recommendations };
  }

  // Automatic buffer insertion
  async insertSmartBuffers(events: GoogleCalendarEvent[]): Promise<GoogleCalendarEvent[]> {
    const bufferEvents: GoogleCalendarEvent[] = [];

    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i];
      const nextEvent = events[i + 1];

      const gap = new Date(nextEvent.start.dateTime).getTime() - new Date(currentEvent.end.dateTime).getTime();
      const gapMinutes = gap / (1000 * 60);

      // Insert buffer if gap is less than 15 minutes
      if (gapMinutes < 15 && gapMinutes > 0) {
        const bufferEvent: GoogleCalendarEvent = {
          id: `buffer-${Date.now()}-${i}`,
          summary: '🧘 Transition Buffer',
          description: 'AI-suggested buffer time for smooth transitions',
          start: {
            dateTime: currentEvent.end.dateTime,
            timeZone: currentEvent.end.timeZone
          },
          end: {
            dateTime: new Date(new Date(currentEvent.end.dateTime).getTime() + 15 * 60000).toISOString(),
            timeZone: currentEvent.end.timeZone
          },
          status: 'tentative',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };

        bufferEvents.push(bufferEvent);
      }
    }

    return bufferEvents;
  }

  // Energy-based meeting optimization
  async optimizeForEnergy(
    events: GoogleCalendarEvent[],
    energyPattern: { high: string[]; low: string[] }
  ): Promise<Array<{
    eventId: string;
    currentTime: string;
    suggestedTime: string;
    energyAlignment: 'optimal' | 'good' | 'poor';
    reasoning: string;
  }>> {
    const suggestions: Array<{
      eventId: string;
      currentTime: string;
      suggestedTime: string;
      energyAlignment: 'optimal' | 'good' | 'poor';
      reasoning: string;
    }> = [];

    for (const event of events) {
      const eventHour = new Date(event.start.dateTime).getHours();
      const currentAlignment = this.getEnergyAlignment(eventHour, energyPattern);

      if (currentAlignment === 'poor') {
        const optimalTime = this.findOptimalEnergySlot(event, energyPattern, events);
        if (optimalTime) {
          suggestions.push({
            eventId: event.id,
            currentTime: event.start.dateTime,
            suggestedTime: optimalTime.toISOString(),
            energyAlignment: 'optimal' as const,
            reasoning: this.getEnergyReasoning(event, eventHour, optimalTime.getHours())
          });
        }
      }
    }

    return suggestions;
  }

  // Helper methods for AI analysis
  private isInternalMeeting(event: GoogleCalendarEvent): boolean {
    return !event.attendees || event.attendees.length <= 3;
  }

  private isExternalMeeting(event: GoogleCalendarEvent): boolean {
    return event.attendees ? event.attendees.some(a => !a.email.includes('@yourcompany.com')) : false;
  }

  private isOneOnOneMeeting(event: GoogleCalendarEvent): boolean {
    return event.attendees ? event.attendees.length === 1 : false;
  }

  private isMorningMeeting(event: GoogleCalendarEvent): boolean {
    const hour = new Date(event.start.dateTime).getHours();
    return hour >= 6 && hour < 12;
  }

  private isAfternoonMeeting(event: GoogleCalendarEvent): boolean {
    const hour = new Date(event.start.dateTime).getHours();
    return hour >= 12 && hour < 18;
  }

  private isEveningMeeting(event: GoogleCalendarEvent): boolean {
    const hour = new Date(event.start.dateTime).getHours();
    return hour >= 18;
  }

  private calculateFocusTime(events: GoogleCalendarEvent[]): number {
    // Calculate total focus time (gaps between meetings during work hours)
    const workDayStart = 9; // 9 AM
    const workDayEnd = 17; // 5 PM
    let totalFocusTime = 0;

    const sortedEvents = events.sort((a, b) =>
      new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEnd = new Date(sortedEvents[i].end.dateTime);
      const nextStart = new Date(sortedEvents[i + 1].start.dateTime);

      if (currentEnd.getHours() >= workDayStart && nextStart.getHours() <= workDayEnd) {
        const gap = nextStart.getTime() - currentEnd.getTime();
        totalFocusTime += gap / (1000 * 60 * 60); // Convert to hours
      }
    }

    return totalFocusTime;
  }

  private detectWorkloadTrend(events: GoogleCalendarEvent[], days: number): 'increasing' | 'stable' | 'decreasing' {
    // Simple trend detection - compare first half vs second half
    const midpoint = Math.floor(days / 2);
    const midDate = new Date(Date.now() - midpoint * 24 * 60 * 60 * 1000);

    const recentEvents = events.filter(e => new Date(e.start.dateTime) >= midDate).length;
    const earlierEvents = events.length - recentEvents;

    const recentAverage = recentEvents / midpoint;
    const earlierAverage = earlierEvents / (days - midpoint);

    if (recentAverage > earlierAverage * 1.2) return 'increasing';
    if (recentAverage < earlierAverage * 0.8) return 'decreasing';
    return 'stable';
  }

  private findLongestMeetingStreak(events: GoogleCalendarEvent[]): number {
    const sortedEvents = events.sort((a, b) =>
      new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );

    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedEvents.length; i++) {
      const prevEnd = new Date(sortedEvents[i - 1].end.dateTime);
      const currentStart = new Date(sortedEvents[i].start.dateTime);

      // If gap is less than 30 minutes, consider it part of the streak
      if (currentStart.getTime() - prevEnd.getTime() < 30 * 60 * 1000) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(maxStreak, currentStreak);
  }

  private generateConflictSuggestions(conflicts: GoogleCalendarEvent[], newEvent: Partial<GoogleCalendarEvent>): string[] {
    const suggestions: string[] = [];

    if (conflicts.length > 0) {
      suggestions.push('Consider scheduling 30 minutes later');
      suggestions.push('Move to a different day');

      if (conflicts.some(c => c.attendees && c.attendees.length > 5)) {
        suggestions.push('Check if this can be an async update instead');
      }

      suggestions.push('Block 15 minutes earlier for preparation time');
    }

    return suggestions;
  }

  private calculateOptimalTimeSlots(
    duration: number,
    preferences: any,
    events: GoogleCalendarEvent[],
    analytics: CalendarAnalytics
  ): Array<{ start: Date; end: Date; score: number; reasoning: string }> {
    const slots = [];
    const now = new Date();

    // Generate time slots for next 7 days
    for (let day = 1; day <= 7; day++) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);

      // Check 9 AM to 5 PM slots
      for (let hour = 9; hour <= 17; hour++) {
        const start = new Date(date);
        start.setHours(hour, 0, 0, 0);

        const end = new Date(start.getTime() + duration * 60 * 1000);

        // Check if slot is free
        const hasConflict = events.some(event => {
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          return start < eventEnd && end > eventStart;
        });

        if (!hasConflict) {
          const score = this.calculateTimeSlotScore(start, preferences, analytics);
          const reasoning = this.generateTimeSlotReasoning(start, score, preferences);

          slots.push({ start, end, score, reasoning });
        }
      }
    }

    return slots.sort((a, b) => b.score - a.score).slice(0, 5); // Top 5 suggestions
  }

  private calculateTimeSlotScore(time: Date, preferences: any, analytics: CalendarAnalytics): number {
    let score = 50; // Base score

    const hour = time.getHours();

    // Energy level preferences
    if (preferences.energyLevel === 'high' && (hour >= 9 && hour <= 11)) {
      score += 20;
    }

    // Meeting type preferences
    if (preferences.meetingType === 'focus' && hour < 12) {
      score += 15; // Morning is better for focus
    }

    // Avoid over-scheduled days
    if (analytics.averageDaily > 6) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateTimeSlotReasoning(time: Date, score: number, preferences: any): string {
    const hour = time.getHours();
    const reasons = [];

    if (hour >= 9 && hour <= 11) {
      reasons.push('Peak energy hours');
    }

    if (preferences.meetingType === 'focus' && hour < 12) {
      reasons.push('Optimal for focus work');
    }

    if (score > 70) {
      reasons.push('High productivity period');
    }

    return reasons.join(', ') || 'Available time slot';
  }

  private getEnergyAlignment(hour: number, pattern: { high: string[]; low: string[] }): 'optimal' | 'good' | 'poor' {
    const isHighEnergy = pattern.high.some(period => {
      const [start, end] = period.split('-').map(t => parseInt(t.split(':')[0]));
      return hour >= start && hour < end;
    });

    const isLowEnergy = pattern.low.some(period => {
      const [start, end] = period.split('-').map(t => parseInt(t.split(':')[0]));
      return hour >= start && hour < end;
    });

    if (isHighEnergy) return 'optimal';
    if (isLowEnergy) return 'poor';
    return 'good';
  }

  private findOptimalEnergySlot(
    event: GoogleCalendarEvent,
    energyPattern: { high: string[]; low: string[] },
    allEvents: GoogleCalendarEvent[]
  ): Date | null {
    // Find the next available slot during high energy periods
    const eventDuration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();

    for (const period of energyPattern.high) {
      const [startHour] = period.split('-')[0].split(':').map(Number);
      const nextDay = new Date(new Date(event.start.dateTime).getTime() + 24 * 60 * 60 * 1000);
      nextDay.setHours(startHour, 0, 0, 0);

      const newEnd = new Date(nextDay.getTime() + eventDuration);

      // Check if this slot is free
      const hasConflict = allEvents.some(e => {
        const eStart = new Date(e.start.dateTime);
        const eEnd = new Date(e.end.dateTime);
        return nextDay < eEnd && newEnd > eStart;
      });

      if (!hasConflict) {
        return nextDay;
      }
    }

    return null;
  }

  private getEnergyReasoning(event: GoogleCalendarEvent, currentHour: number, newHour: number): string {
    return `Moving from ${currentHour}:00 (low energy) to ${newHour}:00 (high energy) for better performance`;
  }

  // Store scheduling preferences
  async saveSchedulingPreferences(preferences: any): Promise<void> {
    await AsyncStorage.setItem('calendar_preferences', JSON.stringify(preferences));
  }

  async getSchedulingPreferences(): Promise<any> {
    const stored = await AsyncStorage.getItem('calendar_preferences');
    return stored ? JSON.parse(stored) : null;
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
      const events = await this.getEvents('primary');
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