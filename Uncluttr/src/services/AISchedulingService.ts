import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleCalendarService, GoogleCalendarEvent } from './GoogleCalendarService';

// Types for AI Scheduling
export interface UserPreferences {
    workingHours: {
        start: string; // "09:00"
        end: string; // "17:00"
    };
    timeZone: string;
    preferredMeetingDuration: number; // minutes
    bufferTime: number; // minutes between meetings
    energyPatterns: {
        highEnergy: string[]; // ["09:00-11:00", "14:00-16:00"]
        lowEnergy: string[]; // ["13:00-14:00", "16:00-17:00"]
    };
    priorities: {
        workLifeBalance: number; // 1-10
        productivity: number; // 1-10
        flexibility: number; // 1-10
    };
    automaticApproval: {
        enabled: boolean;
        maxRescheduleHours: number; // auto-approve reschedules within X hours
        requireApprovalFor: string[]; // ["important-meetings", "external-meetings"]
    };
}

export interface SchedulingContext {
    currentEvents: GoogleCalendarEvent[];
    userPreferences: UserPreferences;
    travelData?: TravelData;
    workload: WorkloadAnalysis;
    externalFactors: ExternalFactors;
}

export interface TravelData {
    flights: FlightInfo[];
    commute: CommuteInfo;
}

export interface FlightInfo {
    flightNumber: string;
    departure: Date;
    arrival: Date;
    status: 'on-time' | 'delayed' | 'cancelled';
    delayMinutes?: number;
}

export interface CommuteInfo {
    mode: 'driving' | 'transit' | 'walking';
    duration: number; // minutes
    trafficFactor: number; // 1.0 = normal, 1.5 = heavy traffic
}

export interface WorkloadAnalysis {
    weeklyHours: number;
    meetingDensity: number; // meetings per day
    stressLevel: number; // 1-10, calculated from patterns
    burnoutRisk: number; // 1-10
    focusTimeAvailable: number; // hours per day
}

export interface ExternalFactors {
    weather: WeatherInfo;
    holidays: string[];
    teamAvailability: TeamMember[];
}

export interface WeatherInfo {
    condition: string;
    temperature: number;
    precipitation: number;
    impact: 'none' | 'low' | 'medium' | 'high';
}

export interface TeamMember {
    id: string;
    name: string;
    availability: TimeSlot[];
    timeZone: string;
}

export interface TimeSlot {
    start: Date;
    end: Date;
    available: boolean;
}

export interface SchedulingSuggestion {
    id: string;
    type: 'reschedule' | 'add-buffer' | 'block-focus-time' | 'suggest-break';
    priority: number; // 1-10
    reason: string;
    originalEvent?: GoogleCalendarEvent;
    suggestedEvent: GoogleCalendarEvent;
    confidence: number; // 0-1
    requiresApproval: boolean;
    aiReasoning: string;
}

export interface OptimizationResult {
    suggestions: SchedulingSuggestion[];
    workloadImprovement: number; // percentage
    wellbeingScore: number; // 1-10
    productivityScore: number; // 1-10
    summary: string;
}

class AISchedulingService {
    private calendarService: GoogleCalendarService;
    private openAIKey: string;
    private claudeKey: string;

    constructor() {
        this.calendarService = new GoogleCalendarService();
        this.openAIKey = Config.OPENAI_API_KEY || '';
        this.claudeKey = Config.ANTHROPIC_API_KEY || '';
    }

    // Main orchestration method
    async optimizeSchedule(context: SchedulingContext): Promise<OptimizationResult> {
        try {
            console.log('🤖 Starting AI schedule optimization...');

            // Analyze current schedule
            const analysis = await this.analyzeSchedulePatterns(context);

            // Generate AI-powered suggestions
            const suggestions = await this.generateSchedulingSuggestions(context, analysis);

            // Calculate improvement metrics
            const metrics = await this.calculateOptimizationMetrics(context, suggestions);

            // Create summary
            const summary = await this.generateOptimizationSummary(context, suggestions, metrics);

            return {
                suggestions,
                workloadImprovement: metrics.workloadImprovement,
                wellbeingScore: metrics.wellbeingScore,
                productivityScore: metrics.productivityScore,
                summary
            };
        } catch (error) {
            console.error('❌ Error optimizing schedule:', error);
            throw new Error('Failed to optimize schedule');
        }
    }

    // Analyze current schedule patterns using AI
    private async analyzeSchedulePatterns(context: SchedulingContext): Promise<any> {
        const prompt = `
    As an AI scheduling expert, analyze this calendar data and provide insights:

    CURRENT SCHEDULE:
    ${JSON.stringify(context.currentEvents, null, 2)}

    USER PREFERENCES:
    ${JSON.stringify(context.userPreferences, null, 2)}

    WORKLOAD ANALYSIS:
    ${JSON.stringify(context.workload, null, 2)}

    Please analyze:
    1. Meeting density and distribution
    2. Focus time availability
    3. Potential burnout indicators
    4. Energy alignment with meeting types
    5. Buffer time adequacy
    6. Work-life balance indicators

    Respond in JSON format with analysis object.
    `;

        try {
            const response = await this.callOpenAI(prompt, 'analysis');
            return JSON.parse(response);
        } catch (error) {
            console.error('Error analyzing patterns:', error);
            return this.getFallbackAnalysis(context);
        }
    }

    // Generate AI-powered scheduling suggestions
    private async generateSchedulingSuggestions(
        context: SchedulingContext,
        analysis: any
    ): Promise<SchedulingSuggestion[]> {
        const suggestions: SchedulingSuggestion[] = [];

        // 1. Burnout Prevention
        const burnoutSuggestions = await this.generateBurnoutPrevention(context, analysis);
        suggestions.push(...burnoutSuggestions);

        // 2. Energy Optimization
        const energySuggestions = await this.generateEnergyOptimization(context, analysis);
        suggestions.push(...energySuggestions);

        // 3. Travel Integration
        const travelSuggestions = await this.generateTravelOptimization(context);
        suggestions.push(...travelSuggestions);

        // 4. Buffer Time Optimization
        const bufferSuggestions = await this.generateBufferOptimization(context);
        suggestions.push(...bufferSuggestions);

        // 5. Focus Time Protection
        const focusSuggestions = await this.generateFocusTimeProtection(context, analysis);
        suggestions.push(...focusSuggestions);

        // Sort by priority and confidence
        return suggestions.sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence));
    }

    // Burnout Prevention AI
    private async generateBurnoutPrevention(
        context: SchedulingContext,
        analysis: any
    ): Promise<SchedulingSuggestion[]> {
        if (context.workload.burnoutRisk < 6) return [];

        const prompt = `
    BURNOUT ALERT: User has high burnout risk (${context.workload.burnoutRisk}/10)

    Current situation:
    - Weekly hours: ${context.workload.weeklyHours}
    - Meeting density: ${context.workload.meetingDensity} per day
    - Stress level: ${context.workload.stressLevel}/10
    - Focus time: ${context.workload.focusTimeAvailable} hours/day

    Generate protective scheduling suggestions to reduce burnout risk.
    Include:
    1. Break insertions
    2. Meeting consolidation
    3. Focus time protection
    4. Workload redistribution

    Respond with array of specific suggestions in JSON format.
    `;

        try {
            const response = await this.callClaude(prompt, 'burnout-prevention');
            const suggestions = JSON.parse(response);

            return suggestions.map((s: any) => ({
                ...s,
                type: 'suggest-break',
                priority: 9,
                requiresApproval: false,
                aiReasoning: 'Burnout prevention algorithm'
            }));
        } catch (error) {
            console.error('Error generating burnout prevention:', error);
            return this.getFallbackBurnoutSuggestions(context);
        }
    }

    // Energy Level Optimization
    private async generateEnergyOptimization(
        context: SchedulingContext,
        analysis: any
    ): Promise<SchedulingSuggestion[]> {
        const { energyPatterns } = context.userPreferences;
        const suggestions: SchedulingSuggestion[] = [];

        const prompt = `
    Optimize meeting schedule based on energy patterns:

    HIGH ENERGY PERIODS: ${energyPatterns.highEnergy.join(', ')}
    LOW ENERGY PERIODS: ${energyPatterns.lowEnergy.join(', ')}

    CURRENT MEETINGS:
    ${context.currentEvents.map(e => `${e.summary}: ${e.start.dateTime}`).join('\n')}

    Suggest reschedules to align important meetings with high energy periods.
    Respond with JSON array of reschedule suggestions.
    `;

        try {
            const response = await this.callOpenAI(prompt, 'energy-optimization');
            const aiSuggestions = JSON.parse(response);

            return aiSuggestions.map((s: any) => ({
                ...s,
                type: 'reschedule',
                priority: 7,
                requiresApproval: true,
                aiReasoning: 'Energy pattern optimization'
            }));
        } catch (error) {
            console.error('Error generating energy optimization:', error);
            return [];
        }
    }

    // Travel Integration & Automatic Rescheduling
    private async generateTravelOptimization(context: SchedulingContext): Promise<SchedulingSuggestion[]> {
        if (!context.travelData?.flights.length) return [];

        const delayedFlights = context.travelData.flights.filter(f => f.status === 'delayed');
        if (!delayedFlights.length) return [];

        const suggestions: SchedulingSuggestion[] = [];

        for (const flight of delayedFlights) {
            const affectedMeetings = this.findAffectedMeetings(context.currentEvents, flight);

            for (const meeting of affectedMeetings) {
                const newTime = this.calculateRescheduleTime(meeting, flight.delayMinutes || 0);

                suggestions.push({
                    id: `travel-${flight.flightNumber}-${meeting.id}`,
                    type: 'reschedule',
                    priority: 10,
                    reason: `Flight ${flight.flightNumber} delayed by ${flight.delayMinutes} minutes`,
                    originalEvent: meeting,
                    suggestedEvent: {
                        ...meeting,
                        start: { ...meeting.start, dateTime: newTime.toISOString() },
                        end: {
                            ...meeting.end,
                            dateTime: new Date(newTime.getTime() + (new Date(meeting.end.dateTime).getTime() - new Date(meeting.start.dateTime).getTime())).toISOString()
                        }
                    },
                    confidence: 0.95,
                    requiresApproval: false, // Auto-approve travel delays
                    aiReasoning: 'Automatic travel delay compensation'
                });
            }
        }

        return suggestions;
    }

    // Buffer Time Optimization
    private async generateBufferOptimization(context: SchedulingContext): Promise<SchedulingSuggestion[]> {
        const { bufferTime } = context.userPreferences;
        const suggestions: SchedulingSuggestion[] = [];

        const events = context.currentEvents.sort((a, b) =>
            new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
        );

        for (let i = 0; i < events.length - 1; i++) {
            const currentEvent = events[i];
            const nextEvent = events[i + 1];

            const gap = new Date(nextEvent.start.dateTime).getTime() - new Date(currentEvent.end.dateTime).getTime();
            const gapMinutes = gap / (1000 * 60);

            if (gapMinutes < bufferTime) {
                const bufferEvent: GoogleCalendarEvent = {
                    id: `buffer-${currentEvent.id}-${nextEvent.id}`,
                    summary: '🧘 Buffer Time',
                    description: 'AI-suggested buffer time for transition',
                    start: {
                        dateTime: currentEvent.end.dateTime,
                        timeZone: currentEvent.end.timeZone
                    },
                    end: {
                        dateTime: new Date(new Date(currentEvent.end.dateTime).getTime() + bufferTime * 60000).toISOString(),
                        timeZone: currentEvent.end.timeZone
                    },
                    status: 'confirmed',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                };

                suggestions.push({
                    id: `buffer-${currentEvent.id}`,
                    type: 'add-buffer',
                    priority: 6,
                    reason: `Insufficient buffer time (${Math.round(gapMinutes)} min < ${bufferTime} min)`,
                    suggestedEvent: bufferEvent,
                    confidence: 0.8,
                    requiresApproval: false,
                    aiReasoning: 'Buffer time optimization for smooth transitions'
                });
            }
        }

        return suggestions;
    }

    // Focus Time Protection
    private async generateFocusTimeProtection(
        context: SchedulingContext,
        analysis: any
    ): Promise<SchedulingSuggestion[]> {
        if (context.workload.focusTimeAvailable >= 4) return []; // Sufficient focus time

        const prompt = `
    FOCUS TIME CRISIS: User only has ${context.workload.focusTimeAvailable} hours of focus time per day.

    Working hours: ${context.userPreferences.workingHours.start} - ${context.userPreferences.workingHours.end}
    Current meetings: ${context.currentEvents.length}

    Generate suggestions to protect and create focus time blocks:
    1. Consolidate meetings
    2. Block focus time periods
    3. Suggest no-meeting periods

    Respond with JSON array of focus protection suggestions.
    `;

        try {
            const response = await this.callClaude(prompt, 'focus-protection');
            const suggestions = JSON.parse(response);

            return suggestions.map((s: any) => ({
                ...s,
                type: 'block-focus-time',
                priority: 8,
                requiresApproval: true,
                aiReasoning: 'Focus time protection algorithm'
            }));
        } catch (error) {
            console.error('Error generating focus protection:', error);
            return this.getFallbackFocusSuggestions(context);
        }
    }

    // OpenAI API Call
    private async callOpenAI(prompt: string, context: string): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openAIKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert AI scheduling assistant. Provide precise, actionable scheduling advice in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Claude API Call
    private async callClaude(prompt: string, context: string): Promise<string> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.claudeKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: `Context: ${context}\n\n${prompt}`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    // Helper Methods
    private findAffectedMeetings(events: GoogleCalendarEvent[], flight: FlightInfo): GoogleCalendarEvent[] {
        const flightArrival = flight.arrival;
        const bufferAfterFlight = 2 * 60 * 60 * 1000; // 2 hours buffer

        return events.filter(event => {
            const eventStart = new Date(event.start.dateTime);
            return eventStart >= flightArrival && eventStart <= new Date(flightArrival.getTime() + bufferAfterFlight);
        });
    }

    private calculateRescheduleTime(meeting: GoogleCalendarEvent, delayMinutes: number): Date {
        const originalStart = new Date(meeting.start.dateTime);
        return new Date(originalStart.getTime() + delayMinutes * 60000);
    }

    private async calculateOptimizationMetrics(
        context: SchedulingContext,
        suggestions: SchedulingSuggestion[]
    ): Promise<any> {
        // Calculate improvement metrics
        const workloadReduction = suggestions
            .filter(s => s.type === 'suggest-break' || s.type === 'block-focus-time')
            .length * 10; // 10% improvement per protective action

        const wellbeingBoost = Math.min(10, 5 + (suggestions.filter(s => s.priority >= 8).length * 0.5));
        const productivityBoost = Math.min(10, 6 + (suggestions.filter(s => s.type === 'block-focus-time').length * 0.8));

        return {
            workloadImprovement: Math.min(50, workloadReduction),
            wellbeingScore: wellbeingBoost,
            productivityScore: productivityBoost
        };
    }

    private async generateOptimizationSummary(
        context: SchedulingContext,
        suggestions: SchedulingSuggestion[],
        metrics: any
    ): Promise<string> {
        const prompt = `
    Generate a friendly, concise summary of schedule optimization:

    METRICS:
    - Workload improvement: ${metrics.workloadImprovement}%
    - Wellbeing score: ${metrics.wellbeingScore}/10
    - Productivity score: ${metrics.productivityScore}/10

    SUGGESTIONS COUNT: ${suggestions.length}
    HIGH PRIORITY: ${suggestions.filter(s => s.priority >= 8).length}

    Create a 2-3 sentence summary that explains the main benefits to the user.
    `;

        try {
            const response = await this.callOpenAI(prompt, 'summary');
            return response.replace(/['"]/g, ''); // Clean quotes
        } catch (error) {
            return `Found ${suggestions.length} ways to optimize your schedule, potentially improving your wellbeing by ${metrics.wellbeingScore}/10 and productivity by ${metrics.productivityScore}/10.`;
        }
    }

    // Fallback methods for when AI APIs fail
    private getFallbackAnalysis(context: SchedulingContext): any {
        return {
            meetingDensity: context.currentEvents.length / 7, // per day
            focusTimeRisk: context.workload.focusTimeAvailable < 2 ? 'high' : 'low',
            burnoutIndicators: context.workload.burnoutRisk > 7 ? ['high-meeting-density', 'low-focus-time'] : [],
            energyMisalignment: 'moderate'
        };
    }

    private getFallbackBurnoutSuggestions(context: SchedulingContext): SchedulingSuggestion[] {
        return [{
            id: 'fallback-break-1',
            type: 'suggest-break',
            priority: 8,
            reason: 'High burnout risk detected - adding protective break',
            suggestedEvent: {
                id: 'break-1',
                summary: '☕ Wellness Break',
                description: 'Protective break for wellbeing',
                start: {
                    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    timeZone: context.userPreferences.timeZone
                },
                end: {
                    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
                    timeZone: context.userPreferences.timeZone
                },
                status: 'confirmed',
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            },
            confidence: 0.9,
            requiresApproval: false,
            aiReasoning: 'Fallback burnout prevention'
        }];
    }

    private getFallbackFocusSuggestions(context: SchedulingContext): SchedulingSuggestion[] {
        return [{
            id: 'fallback-focus-1',
            type: 'block-focus-time',
            priority: 7,
            reason: 'Insufficient focus time - blocking morning slot',
            suggestedEvent: {
                id: 'focus-1',
                summary: '🎯 Deep Focus Time',
                description: 'Protected time for deep work',
                start: {
                    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    timeZone: context.userPreferences.timeZone
                },
                end: {
                    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                    timeZone: context.userPreferences.timeZone
                },
                status: 'confirmed',
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            },
            confidence: 0.8,
            requiresApproval: true,
            aiReasoning: 'Fallback focus protection'
        }];
    }

    // Store and retrieve user preferences
    async saveUserPreferences(preferences: UserPreferences): Promise<void> {
        await AsyncStorage.setItem('scheduling_preferences', JSON.stringify(preferences));
    }

    async getUserPreferences(): Promise<UserPreferences> {
        const stored = await AsyncStorage.getItem('scheduling_preferences');
        if (stored) {
            return JSON.parse(stored);
        }

        // Default preferences
        return {
            workingHours: { start: '09:00', end: '17:00' },
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferredMeetingDuration: 30,
            bufferTime: 15,
            energyPatterns: {
                highEnergy: ['09:00-11:00', '14:00-16:00'],
                lowEnergy: ['13:00-14:00', '16:00-17:00']
            },
            priorities: {
                workLifeBalance: 8,
                productivity: 7,
                flexibility: 6
            },
            automaticApproval: {
                enabled: true,
                maxRescheduleHours: 2,
                requireApprovalFor: ['important-meetings', 'external-meetings']
            }
        };
    }

    // Apply approved suggestions
    async applySuggestions(suggestions: SchedulingSuggestion[]): Promise<void> {
        for (const suggestion of suggestions) {
            try {
                switch (suggestion.type) {
                    case 'reschedule':
                        if (suggestion.originalEvent && suggestion.suggestedEvent) {
                            await this.calendarService.updateEvent(
                                'primary',
                                suggestion.originalEvent.id,
                                suggestion.suggestedEvent
                            );
                        }
                        break;
                    case 'add-buffer':
                    case 'block-focus-time':
                    case 'suggest-break':
                        await this.calendarService.createEvent('primary', suggestion.suggestedEvent);
                        break;
                }
            } catch (error) {
                console.error(`Failed to apply suggestion ${suggestion.id}:`, error);
            }
        }
    }
}

export { AISchedulingService };
export default AISchedulingService;
