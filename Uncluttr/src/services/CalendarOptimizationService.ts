import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleCalendarService } from './GoogleCalendarService';
import AISchedulingService from './AISchedulingService';
import TravelIntegrationService from './TravelIntegrationService';

interface OptimizationResult {
    id: string;
    type: 'reschedule' | 'buffer' | 'energy_alignment' | 'focus_protection' | 'travel_adjustment';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    reasoning: string;
    impact: string;
    autoApprove: boolean;
    eventId?: string;
    newTime?: {
        start: string;
        end: string;
    };
    bufferMinutes?: number;
}

interface UserPreferences {
    workingHours: {
        start: string;
        end: string;
        timezone: string;
    };
    energyPattern: {
        highEnergy: string[];
        lowEnergy: string[];
    };
    meetingPreferences: {
        maxConsecutiveMeetings: number;
        preferredBufferTime: number;
        focusTimeBlocks: string[];
        noMeetingDays?: string[];
    };
    travelPreferences: {
        autoRescheduleOnDelay: boolean;
        bufferTimeForTravel: number;
        allowRemoteAlternatives: boolean;
    };
    automationLevel: 'minimal' | 'moderate' | 'aggressive';
    notificationPreferences: {
        burnoutWarnings: boolean;
        optimizationSuggestions: boolean;
        travelAlerts: boolean;
    };
}

export class CalendarOptimizationService {
    private calendarService: GoogleCalendarService;
    private aiService: AISchedulingService;
    private travelService: TravelIntegrationService;
    private isRunning: boolean = false;
    private optimizationInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.calendarService = new GoogleCalendarService();
        this.aiService = new AISchedulingService();
        this.travelService = new TravelIntegrationService();
    }

    // Initialize the optimization service
    async initialize(): Promise<void> {
        try {
            await this.calendarService.initialize();
            // Note: AI and Travel services don't require initialization

            // Start continuous optimization
            this.startContinuousOptimization();
        } catch (error) {
            console.error('Failed to initialize CalendarOptimizationService:', error);
            throw error;
        }
    }

    // Start continuous optimization monitoring
    private startContinuousOptimization(): void {
        if (this.isRunning) return;

        this.isRunning = true;

        // Run optimization every 30 minutes
        this.optimizationInterval = setInterval(async () => {
            try {
                await this.runAutomaticOptimization();
            } catch (error) {
                console.error('Error in automatic optimization:', error);
            }
        }, 30 * 60 * 1000); // 30 minutes

        console.log('🤖 Calendar optimization service started');
    }

    // Stop continuous optimization
    stopContinuousOptimization(): void {
        if (this.optimizationInterval) {
            clearInterval(this.optimizationInterval);
            this.optimizationInterval = null;
        }
        this.isRunning = false;
        console.log('🛑 Calendar optimization service stopped');
    }

    // Run comprehensive calendar optimization
    async runFullOptimization(): Promise<OptimizationResult[]> {
        try {
            console.log('🔄 Running full calendar optimization...');

            const [
                energyOptimizations,
                bufferOptimizations,
                travelOptimizations,
                focusProtections,
                burnoutPrevention
            ] = await Promise.all([
                this.optimizeForEnergyLevels(),
                this.optimizeBufferTimes(),
                this.optimizeForTravel(),
                this.protectFocusTime(),
                this.preventBurnout()
            ]);

            const allOptimizations = [
                ...energyOptimizations,
                ...bufferOptimizations,
                ...travelOptimizations,
                ...focusProtections,
                ...burnoutPrevention
            ];

            // Sort by priority and impact
            const sortedOptimizations = allOptimizations.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            // Store optimizations for user review
            await this.storeOptimizations(sortedOptimizations);

            // Auto-apply safe optimizations
            await this.autoApplyOptimizations(sortedOptimizations.filter(o => o.autoApprove));

            console.log(`✅ Found ${sortedOptimizations.length} optimization opportunities`);
            return sortedOptimizations;
        } catch (error) {
            console.error('Error running full optimization:', error);
            return [];
        }
    }

    // Optimize calendar based on energy levels
    private async optimizeForEnergyLevels(): Promise<OptimizationResult[]> {
        try {
            const preferences = await this.getUserPreferences();
            if (!preferences?.energyPattern) return [];

            const eventsResponse = await this.calendarService.getEvents(
                'primary',
                new Date(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            const events = eventsResponse.items || [];

            const energyOptimizations = await this.calendarService.optimizeForEnergy(
                events,
                {
                    high: preferences.energyPattern.highEnergy,
                    low: preferences.energyPattern.lowEnergy
                }
            );

            return energyOptimizations.map(opt => ({
                id: `energy-${opt.eventId}-${Date.now()}`,
                type: 'energy_alignment' as const,
                priority: opt.energyAlignment === 'poor' ? 'high' : 'medium' as const,
                suggestion: `Move meeting to ${new Date(opt.suggestedTime).toLocaleTimeString()}`,
                reasoning: opt.reasoning,
                impact: 'Improved performance and focus during meeting',
                autoApprove: opt.energyAlignment === 'poor',
                eventId: opt.eventId,
                newTime: {
                    start: opt.suggestedTime,
                    end: new Date(new Date(opt.suggestedTime).getTime() + 60 * 60 * 1000).toISOString()
                }
            }));
        } catch (error) {
            console.error('Error optimizing for energy levels:', error);
            return [];
        }
    }

    // Optimize buffer times between meetings
    private async optimizeBufferTimes(): Promise<OptimizationResult[]> {
        try {
            const eventsResponse = await this.calendarService.getEvents(
                'primary',
                new Date(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            const events = eventsResponse.items || [];

            const bufferEvents = await this.calendarService.insertSmartBuffers(events);

            return bufferEvents.map(buffer => ({
                id: `buffer-${buffer.id}`,
                type: 'buffer' as const,
                priority: 'medium' as const,
                suggestion: 'Add transition buffer between meetings',
                reasoning: 'Prevents rushed transitions and improves meeting quality',
                impact: 'Better preparation and mental clarity',
                autoApprove: true,
                bufferMinutes: 15,
                newTime: {
                    start: buffer.start.dateTime,
                    end: buffer.end.dateTime
                }
            }));
        } catch (error) {
            console.error('Error optimizing buffer times:', error);
            return [];
        }
    }

    // Optimize for travel considerations
    private async optimizeForTravel(): Promise<OptimizationResult[]> {
        try {
            const travelImpacts = await this.travelService.monitorTravelImpacts();

            return travelImpacts.flatMap(impact =>
                impact.suggestedActions.map(action => ({
                    id: `travel-${action.eventId}-${Date.now()}`,
                    type: 'travel_adjustment' as const,
                    priority: impact.urgency === 'high' ? 'high' : 'medium' as const,
                    suggestion: `${action.type}: ${action.reason}`,
                    reasoning: action.reason,
                    impact: `Prevents ${action.type} delays`,
                    autoApprove: action.confidence > 0.8,
                    eventId: action.eventId,
                    newTime: action.newTime ? {
                        start: action.newTime.toISOString(),
                        end: new Date(action.newTime.getTime() + 60 * 60 * 1000).toISOString()
                    } : undefined
                }))
            );
        } catch (error) {
            console.error('Error optimizing for travel:', error);
            return [];
        }
    }

    // Protect focus time blocks
    private async protectFocusTime(): Promise<OptimizationResult[]> {
        try {
            const preferences = await this.getUserPreferences();
            if (!preferences?.meetingPreferences?.focusTimeBlocks) return [];

            const eventsResponse = await this.calendarService.getEvents(
                'primary',
                new Date(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            const events = eventsResponse.items || [];

            const focusViolations = this.detectFocusTimeViolations(events, preferences.meetingPreferences.focusTimeBlocks);

            return focusViolations.map(violation => ({
                id: `focus-${violation.eventId}-${Date.now()}`,
                type: 'focus_protection' as const,
                priority: 'high' as const,
                suggestion: `Move meeting out of protected focus time (${violation.focusBlock})`,
                reasoning: 'Preserves dedicated time for deep work and concentration',
                impact: 'Maintains productivity and reduces context switching',
                autoApprove: false,
                eventId: violation.eventId,
                newTime: violation.suggestedTime ? {
                    start: violation.suggestedTime.start,
                    end: violation.suggestedTime.end
                } : undefined
            }));
        } catch (error) {
            console.error('Error protecting focus time:', error);
            return [];
        }
    }

    // Prevent burnout through smart scheduling
    private async preventBurnout(): Promise<OptimizationResult[]> {
        try {
            const burnoutRisk = await this.calendarService.detectBurnoutRisk();

            if (burnoutRisk.risk === 'low') return [];

            return burnoutRisk.recommendations.map((recommendation, index) => ({
                id: `burnout-${Date.now()}-${index}`,
                type: 'reschedule' as const,
                priority: burnoutRisk.risk === 'critical' ? 'high' : 'medium' as const,
                suggestion: recommendation,
                reasoning: `Burnout risk detected: ${burnoutRisk.risk} (${burnoutRisk.score}%)`,
                impact: 'Reduces stress and maintains sustainable productivity',
                autoApprove: burnoutRisk.risk === 'critical'
            }));
        } catch (error) {
            console.error('Error preventing burnout:', error);
            return [];
        }
    }

    // Detect focus time violations
    private detectFocusTimeViolations(events: any[], focusBlocks: string[]): Array<{
        eventId: string;
        focusBlock: string;
        suggestedTime?: { start: string; end: string };
    }> {
        const violations = [];

        for (const event of events) {
            const eventStart = new Date(event.start.dateTime);
            const eventHour = eventStart.getHours();

            for (const block of focusBlocks) {
                const [startTime, endTime] = block.split('-');
                const [startHour] = startTime.split(':').map(Number);
                const [endHour] = endTime.split(':').map(Number);

                if (eventHour >= startHour && eventHour < endHour) {
                    violations.push({
                        eventId: event.id,
                        focusBlock: block,
                        suggestedTime: this.findAlternativeTime(event, events)
                    });
                }
            }
        }

        return violations;
    }

    // Find alternative time slot for an event
    private findAlternativeTime(event: any, allEvents: any[]): { start: string; end: string } | undefined {
        const eventDuration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
        const eventDate = new Date(event.start.dateTime);

        // Try 2 hours after the original time
        const alternativeStart = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
        const alternativeEnd = new Date(alternativeStart.getTime() + eventDuration);

        // Check if this time is free
        const hasConflict = allEvents.some(e => {
            if (e.id === event.id) return false;

            const eStart = new Date(e.start.dateTime);
            const eEnd = new Date(e.end.dateTime);

            return alternativeStart < eEnd && alternativeEnd > eStart;
        });

        if (!hasConflict) {
            return {
                start: alternativeStart.toISOString(),
                end: alternativeEnd.toISOString()
            };
        }

        return undefined;
    }

    // Auto-apply safe optimizations
    private async autoApplyOptimizations(optimizations: OptimizationResult[]): Promise<void> {
        for (const optimization of optimizations) {
            try {
                if (optimization.type === 'buffer' && optimization.newTime) {
                    // Create buffer event
                    await this.calendarService.createEvent('primary', {
                        summary: '🧘 Transition Buffer',
                        description: 'AI-suggested buffer time',
                        start: {
                            dateTime: optimization.newTime.start,
                            timeZone: 'UTC'
                        },
                        end: {
                            dateTime: optimization.newTime.end,
                            timeZone: 'UTC'
                        }
                    });

                    console.log(`✅ Auto-applied buffer optimization: ${optimization.id}`);
                }

                // Add other auto-apply logic here

            } catch (error) {
                console.error(`Error auto-applying optimization ${optimization.id}:`, error);
            }
        }
    }

    // Store optimizations for user review
    private async storeOptimizations(optimizations: OptimizationResult[]): Promise<void> {
        await AsyncStorage.setItem('pending_optimizations', JSON.stringify(optimizations));
    }

    // Get pending optimizations
    async getPendingOptimizations(): Promise<OptimizationResult[]> {
        try {
            const stored = await AsyncStorage.getItem('pending_optimizations');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting pending optimizations:', error);
            return [];
        }
    }

    // Apply user-approved optimization
    async applyOptimization(optimizationId: string): Promise<boolean> {
        try {
            const optimizations = await this.getPendingOptimizations();
            const optimization = optimizations.find(o => o.id === optimizationId);

            if (!optimization) {
                console.error('Optimization not found:', optimizationId);
                return false;
            }

            // Apply the optimization based on type
            switch (optimization.type) {
                case 'reschedule':
                    if (optimization.eventId && optimization.newTime) {
                        await this.calendarService.updateEvent('primary', optimization.eventId, {
                            start: {
                                dateTime: optimization.newTime.start,
                                timeZone: 'UTC'
                            },
                            end: {
                                dateTime: optimization.newTime.end,
                                timeZone: 'UTC'
                            }
                        });
                    }
                    break;

                case 'buffer':
                    if (optimization.newTime) {
                        await this.calendarService.createEvent('primary', {
                            summary: '🧘 Transition Buffer',
                            description: 'User-approved buffer time',
                            start: {
                                dateTime: optimization.newTime.start,
                                timeZone: 'UTC'
                            },
                            end: {
                                dateTime: optimization.newTime.end,
                                timeZone: 'UTC'
                            }
                        });
                    }
                    break;

                // Add other optimization types
            }

            // Remove from pending optimizations
            const updatedOptimizations = optimizations.filter(o => o.id !== optimizationId);
            await AsyncStorage.setItem('pending_optimizations', JSON.stringify(updatedOptimizations));

            console.log(`✅ Applied optimization: ${optimizationId}`);
            return true;
        } catch (error) {
            console.error('Error applying optimization:', error);
            return false;
        }
    }

    // Reject optimization
    async rejectOptimization(optimizationId: string): Promise<void> {
        const optimizations = await this.getPendingOptimizations();
        const updatedOptimizations = optimizations.filter(o => o.id !== optimizationId);
        await AsyncStorage.setItem('pending_optimizations', JSON.stringify(updatedOptimizations));
    }

    // Run automatic optimization (called by interval)
    private async runAutomaticOptimization(): Promise<void> {
        try {
            const preferences = await this.getUserPreferences();
            if (!preferences || preferences.automationLevel === 'minimal') return;

            console.log('🤖 Running automatic optimization check...');

            // Check for travel disruptions
            const travelImpacts = await this.travelService.monitorTravelImpacts();
            const criticalTravelIssues = travelImpacts.filter(i => i.urgency === 'high')
                .flatMap(impact => impact.suggestedActions)
                .filter(action => action.confidence > 0.8);

            // Auto-handle critical travel issues
            for (const action of criticalTravelIssues) {
                if (action.newTime) {
                    await this.calendarService.updateEvent('primary', action.eventId, {
                        start: {
                            dateTime: action.newTime.toISOString(),
                            timeZone: 'UTC'
                        },
                        end: {
                            dateTime: new Date(action.newTime.getTime() + 60 * 60 * 1000).toISOString(),
                            timeZone: 'UTC'
                        }
                    });

                    console.log(`🚀 Auto-rescheduled event due to ${action.type}: ${action.eventId}`);
                }
            }

            // Check burnout risk
            if (preferences.automationLevel === 'aggressive') {
                const burnoutRisk = await this.calendarService.detectBurnoutRisk();
                if (burnoutRisk.risk === 'critical') {
                    // Send notification about critical burnout risk
                    await this.sendBurnoutAlert(burnoutRisk);
                }
            }

        } catch (error) {
            console.error('Error in automatic optimization:', error);
        }
    }

    // Send burnout alert
    private async sendBurnoutAlert(burnoutRisk: any): Promise<void> {
        // Implementation would depend on your notification system
        console.log('🚨 CRITICAL BURNOUT RISK DETECTED:', burnoutRisk);
        // You could integrate with push notifications, email, etc.
    }

    // User preference management
    async saveUserPreferences(preferences: UserPreferences): Promise<void> {
        await AsyncStorage.setItem('optimization_preferences', JSON.stringify(preferences));
    }

    async getUserPreferences(): Promise<UserPreferences | null> {
        try {
            const stored = await AsyncStorage.getItem('optimization_preferences');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return null;
        }
    }

    // Get optimization statistics
    async getOptimizationStats(): Promise<{
        totalOptimizations: number;
        appliedOptimizations: number;
        timesSaved: number; // in minutes
        burnoutPrevented: number;
        focusTimeProtected: number; // in hours
    }> {
        try {
            const stats = await AsyncStorage.getItem('optimization_stats');
            return stats ? JSON.parse(stats) : {
                totalOptimizations: 0,
                appliedOptimizations: 0,
                timesSaved: 0,
                burnoutPrevented: 0,
                focusTimeProtected: 0
            };
        } catch (error) {
            console.error('Error getting optimization stats:', error);
            return {
                totalOptimizations: 0,
                appliedOptimizations: 0,
                timesSaved: 0,
                burnoutPrevented: 0,
                focusTimeProtected: 0
            };
        }
    }

    // Update optimization statistics
    async updateOptimizationStats(update: Partial<{
        totalOptimizations: number;
        appliedOptimizations: number;
        timesSaved: number;
        burnoutPrevented: number;
        focusTimeProtected: number;
    }>): Promise<void> {
        const currentStats = await this.getOptimizationStats();
        const newStats = { ...currentStats, ...update };
        await AsyncStorage.setItem('optimization_stats', JSON.stringify(newStats));
    }
}
