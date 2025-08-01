import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FlightData {
    flightNumber: string;
    airline: string;
    departure: {
        airport: string;
        scheduled: Date;
        actual?: Date;
        gate?: string;
        terminal?: string;
    };
    arrival: {
        airport: string;
        scheduled: Date;
        actual?: Date;
        gate?: string;
        terminal?: string;
    };
    status: 'scheduled' | 'boarding' | 'departed' | 'delayed' | 'cancelled' | 'arrived';
    delay?: {
        minutes: number;
        reason: string;
    };
    aircraft?: {
        type: string;
        registration: string;
    };
}

export interface LocationData {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    timeZone: string;
}

export interface TravelRoute {
    from: LocationData;
    to: LocationData;
    mode: 'driving' | 'transit' | 'walking' | 'flying';
    duration: number; // minutes
    distance: number; // kilometers
    trafficFactor: number; // 1.0 = normal traffic
    cost?: number;
}

export interface TravelImpact {
    affectedMeetings: string[]; // event IDs
    suggestedActions: TravelAction[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface TravelAction {
    type: 'reschedule' | 'cancel' | 'virtual' | 'delegate';
    eventId: string;
    reason: string;
    newTime?: Date;
    confidence: number;
}

class TravelIntegrationService {
    private apiKey: string;
    private readonly FLIGHT_API_BASE = 'https://api.aviationstack.com/v1';
    private readonly MAPS_API_BASE = 'https://maps.googleapis.com/maps/api/';

    constructor() {
        this.apiKey = Config.GOOGLE_CLOUD_API_KEY || '';
    }

    // Main travel monitoring orchestration
    async monitorTravelImpacts(): Promise<TravelImpact[]> {
        console.log('🛫 Starting travel impact monitoring...');

        try {
            const trackedFlights = await this.getTrackedFlights();
            const impacts: TravelImpact[] = [];

            for (const flight of trackedFlights) {
                const flightData = await this.getFlightStatus(flight.flightNumber);
                if (flightData && this.hasSignificantDelay(flightData)) {
                    const impact = await this.assessFlightImpact(flightData);
                    impacts.push(impact);
                }
            }

            // Monitor ground transportation
            const routeImpacts = await this.monitorCommuteRoutes();
            impacts.push(...routeImpacts);

            return impacts;
        } catch (error) {
            console.error('Error monitoring travel impacts:', error);
            return [];
        }
    }

    // Flight Status Tracking
    async getFlightStatus(flightNumber: string): Promise<FlightData | null> {
        try {
            // Use FlightAware or similar API
            const response = await fetch(`${this.FLIGHT_API_BASE}/flights?access_key=${this.apiKey}&flight_iata=${flightNumber}`);

            if (!response.ok) {
                throw new Error(`Flight API error: ${response.statusText}`);
            }

            const data = await response.json();
            const flight = data.data[0];

            if (!flight) return null;

            return {
                flightNumber: flight.flight.iata,
                airline: flight.airline.name,
                departure: {
                    airport: flight.departure.airport,
                    scheduled: new Date(flight.departure.scheduled),
                    actual: flight.departure.actual ? new Date(flight.departure.actual) : undefined,
                    gate: flight.departure.gate,
                    terminal: flight.departure.terminal
                },
                arrival: {
                    airport: flight.arrival.airport,
                    scheduled: new Date(flight.arrival.scheduled),
                    actual: flight.arrival.actual ? new Date(flight.arrival.actual) : undefined,
                    gate: flight.arrival.gate,
                    terminal: flight.arrival.terminal
                },
                status: this.mapFlightStatus(flight.flight_status),
                delay: flight.departure.delay ? {
                    minutes: flight.departure.delay,
                    reason: flight.departure.delay_reason || 'Unknown'
                } : undefined
            };
        } catch (error) {
            console.error('Error fetching flight status:', error);
            // Return mock data for development
            return this.getMockFlightData(flightNumber);
        }
    }

    // Real-time Commute Monitoring
    async monitorCommuteRoutes(): Promise<TravelImpact[]> {
        const savedRoutes = await this.getSavedCommuteRoutes();
        const impacts: TravelImpact[] = [];

        for (const route of savedRoutes) {
            const currentConditions = await this.getTrafficConditions(route);

            if (currentConditions.trafficFactor > 1.5) { // 50% longer than normal
                const impact = await this.assessCommuteImpact(route, currentConditions);
                impacts.push(impact);
            }
        }

        return impacts;
    }

    // Get real-time traffic conditions
    async getTrafficConditions(route: TravelRoute): Promise<TravelRoute> {
        try {
            const directionsUrl = `${this.MAPS_API_BASE}directions/json?` +
                `origin=${route.from.coordinates.lat},${route.from.coordinates.lng}&` +
                `destination=${route.to.coordinates.lat},${route.to.coordinates.lng}&` +
                `departure_time=now&` +
                `traffic_model=best_guess&` +
                `key=${this.apiKey}`;

            const response = await fetch(directionsUrl);
            const data = await response.json();

            if (data.status === 'OK' && data.routes.length > 0) {
                const routeData = data.routes[0];
                const leg = routeData.legs[0];

                return {
                    ...route,
                    duration: Math.round(leg.duration_in_traffic.value / 60), // convert to minutes
                    trafficFactor: leg.duration_in_traffic.value / leg.duration.value,
                    distance: Math.round(leg.distance.value / 1000) // convert to km
                };
            }

            return route; // Return original if API fails
        } catch (error) {
            console.error('Error getting traffic conditions:', error);
            return route;
        }
    }

    // Assess flight delay impact on schedule
    private async assessFlightImpact(flightData: FlightData): Promise<TravelImpact> {
        const delayMinutes = flightData.delay?.minutes || 0;
        const arrivalDelay = flightData.arrival.actual
            ? (flightData.arrival.actual.getTime() - flightData.arrival.scheduled.getTime()) / 60000
            : delayMinutes;

        // Find affected meetings (within 4 hours of arrival)
        const affectedMeetings = await this.findMeetingsNearTime(
            flightData.arrival.actual || flightData.arrival.scheduled,
            4 * 60 // 4 hours in minutes
        );

        const actions: TravelAction[] = [];

        for (const meetingId of affectedMeetings) {
            if (arrivalDelay > 30) { // Significant delay
                actions.push({
                    type: 'reschedule',
                    eventId: meetingId,
                    reason: `Flight ${flightData.flightNumber} delayed by ${Math.round(arrivalDelay)} minutes`,
                    newTime: new Date((flightData.arrival.actual || flightData.arrival.scheduled).getTime() + 2 * 60 * 60 * 1000), // 2 hours after landing
                    confidence: 0.9
                });
            } else if (arrivalDelay > 15) {
                actions.push({
                    type: 'virtual',
                    eventId: meetingId,
                    reason: `Flight delay may cause late arrival - suggest virtual attendance`,
                    confidence: 0.7
                });
            }
        }

        return {
            affectedMeetings,
            suggestedActions: actions,
            urgency: arrivalDelay > 60 ? 'critical' : arrivalDelay > 30 ? 'high' : 'medium'
        };
    }

    // Assess commute impact on schedule
    private async assessCommuteImpact(route: TravelRoute, conditions: TravelRoute): Promise<TravelImpact> {
        const extraTime = (conditions.trafficFactor - 1) * route.duration;

        // Find meetings that might be affected by travel delays
        const affectedMeetings = await this.findMeetingsRequiringTravel(route);

        const actions: TravelAction[] = affectedMeetings.map(meetingId => ({
            type: 'reschedule',
            eventId: meetingId,
            reason: `Heavy traffic on ${route.from.address} to ${route.to.address} - ${Math.round(extraTime)} min delay expected`,
            newTime: new Date(Date.now() + (conditions.duration + 30) * 60 * 1000), // Add 30 min buffer
            confidence: 0.8
        }));

        return {
            affectedMeetings,
            suggestedActions: actions,
            urgency: extraTime > 30 ? 'high' : 'medium'
        };
    }

    // Weather Impact Integration
    async getWeatherImpact(location: LocationData): Promise<{
        condition: string;
        impact: 'none' | 'low' | 'medium' | 'high';
        suggestions: string[];
    }> {
        try {
            const weatherUrl = `${this.MAPS_API_BASE}weather?` +
                `lat=${location.coordinates.lat}&` +
                `lon=${location.coordinates.lng}&` +
                `appid=${this.apiKey}&units=metric`;

            const response = await fetch(weatherUrl);
            const data = await response.json();

            const weather = data.weather[0];
            const impact = this.assessWeatherImpact(weather);

            return {
                condition: weather.description,
                impact: impact.level,
                suggestions: impact.suggestions
            };
        } catch (error) {
            console.error('Error getting weather impact:', error);
            return {
                condition: 'unknown',
                impact: 'none',
                suggestions: []
            };
        }
    }

    // Smart notifications for travel disruptions
    async sendTravelAlert(impact: TravelImpact): Promise<void> {
        const message = this.formatTravelAlert(impact);

        // Store for UI pickup
        await AsyncStorage.setItem('travel_alerts', JSON.stringify({
            timestamp: new Date(),
            impact,
            message,
            read: false
        }));

        console.log('🚨 Travel Alert:', message);
    }

    // Automatic rescheduling with user preferences
    async autoRescheduleWithApproval(actions: TravelAction[]): Promise<{
        autoApproved: TravelAction[];
        requiresApproval: TravelAction[];
    }> {
        const userPrefs = await this.getUserTravelPreferences();
        const autoApproved: TravelAction[] = [];
        const requiresApproval: TravelAction[] = [];

        for (const action of actions) {
            if (this.shouldAutoApprove(action, userPrefs)) {
                autoApproved.push(action);
            } else {
                requiresApproval.push(action);
            }
        }

        // Execute auto-approved actions
        for (const action of autoApproved) {
            await this.executeAction(action);
        }

        return { autoApproved, requiresApproval };
    }

    // Helper Methods
    private hasSignificantDelay(flightData: FlightData): boolean {
        return flightData.delay ? flightData.delay.minutes > 15 : false;
    }

    private mapFlightStatus(status: string): FlightData['status'] {
        const statusMap: { [key: string]: FlightData['status'] } = {
            'scheduled': 'scheduled',
            'active': 'departed',
            'landed': 'arrived',
            'cancelled': 'cancelled',
            'incident': 'delayed',
            'diverted': 'delayed'
        };
        return statusMap[status] || 'scheduled';
    }

    private async findMeetingsNearTime(time: Date, bufferMinutes: number): Promise<string[]> {
        // This would integrate with calendar service to find meetings
        // Mock implementation for now
        return ['meeting-1', 'meeting-2'];
    }

    private async findMeetingsRequiringTravel(route: TravelRoute): Promise<string[]> {
        // Find meetings that require traveling this route
        return ['meeting-3'];
    }

    private assessWeatherImpact(weather: any): { level: 'none' | 'low' | 'medium' | 'high'; suggestions: string[] } {
        const condition = weather.main.toLowerCase();

        if (condition.includes('storm') || condition.includes('snow')) {
            return {
                level: 'high',
                suggestions: ['Consider virtual meetings', 'Allow extra travel time', 'Check transportation status']
            };
        } else if (condition.includes('rain')) {
            return {
                level: 'medium',
                suggestions: ['Add 15-30 minutes to travel time', 'Have backup transportation']
            };
        }

        return { level: 'none', suggestions: [] };
    }

    private formatTravelAlert(impact: TravelImpact): string {
        const urgencyEmoji = {
            low: '🟡',
            medium: '🟠',
            high: '🔴',
            critical: '🚨'
        };

        return `${urgencyEmoji[impact.urgency]} Travel Disruption: ${impact.suggestedActions.length} meetings may be affected. ${impact.suggestedActions[0]?.reason || 'Check your schedule for updates.'}`;
    }

    private shouldAutoApprove(action: TravelAction, prefs: any): boolean {
        // Auto-approve travel delays but require approval for major changes
        return action.type === 'reschedule' && action.confidence > 0.8;
    }

    private async executeAction(action: TravelAction): Promise<void> {
        console.log(`🤖 Auto-executing: ${action.type} for ${action.eventId}`);
        // Implementation would call calendar service
    }

    // Storage methods
    async trackFlight(flightNumber: string): Promise<void> {
        const tracked = await this.getTrackedFlights();
        tracked.push({ flightNumber, addedAt: new Date() });
        await AsyncStorage.setItem('tracked_flights', JSON.stringify(tracked));
    }

    async getTrackedFlights(): Promise<Array<{ flightNumber: string; addedAt: Date }>> {
        const stored = await AsyncStorage.getItem('tracked_flights');
        return stored ? JSON.parse(stored) : [];
    }

    async saveCommuteRoute(route: TravelRoute): Promise<void> {
        const routes = await this.getSavedCommuteRoutes();
        routes.push(route);
        await AsyncStorage.setItem('commute_routes', JSON.stringify(routes));
    }

    async getSavedCommuteRoutes(): Promise<TravelRoute[]> {
        const stored = await AsyncStorage.getItem('commute_routes');
        return stored ? JSON.parse(stored) : [];
    }

    private async getUserTravelPreferences(): Promise<any> {
        const stored = await AsyncStorage.getItem('travel_preferences');
        return stored ? JSON.parse(stored) : {
            autoReschedule: true,
            maxDelayForAuto: 60, // minutes
            bufferTime: 30 // minutes
        };
    }

    // Mock data for development
    private getMockFlightData(flightNumber: string): FlightData {
        return {
            flightNumber,
            airline: 'Mock Airlines',
            departure: {
                airport: 'JFK',
                scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                actual: new Date(Date.now() + 2.5 * 60 * 60 * 1000) // 30 min delay
            },
            arrival: {
                airport: 'LAX',
                scheduled: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now  
                actual: new Date(Date.now() + 8.5 * 60 * 60 * 1000) // 30 min delay
            },
            status: 'delayed',
            delay: {
                minutes: 30,
                reason: 'Air traffic control delay'
            }
        };
    }
}

export { TravelIntegrationService };
export default TravelIntegrationService;
