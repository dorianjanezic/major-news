import { CreateMarketEvent } from '../types/market-event';
import debug from 'debug';

const log = debug('market-events:ai-service');

// Supported AI providers
type AIProvider = 'gemini' | 'grok' | 'xai';

interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model?: string;
}

class AIService {
    private config: AIConfig;
    private geminiClient?: any; // Keep for backward compatibility

    constructor() {
        const provider = (process.env.AI_PROVIDER || 'xai') as AIProvider; // Default to xai
        const apiKey = process.env.AI_API_KEY;

        if (!apiKey) {
            throw new Error(`Missing API key for AI provider: ${provider}`);
        }

        this.config = {
            provider,
            apiKey,
            model: process.env.AI_MODEL || 'grok-4-fast' // Default xAI model
        };

        if (provider === 'gemini') {
            // Keep for backward compatibility if needed
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            this.geminiClient = new GoogleGenerativeAI(apiKey);
        }
    }

    /**
     * Generate weekly market events using AI
     */
    async generateWeeklyMarketEvents(weekStart?: Date): Promise<CreateMarketEvent[]> {
        const targetWeek = weekStart || this.getCurrentWeekStart();

        try {
            log(`Generating market events for week of ${targetWeek.toDateString()} using ${this.config.provider}`);

            const prompt = this.buildMarketEventsPrompt(targetWeek);
            const { content, citations } = await this.callAI(prompt);

            const events = this.parseAIResponse(content, citations);
            log(`Generated ${events.length} market events with ${citations.length} citations`);

            return events;
        } catch (error) {
            log('Error generating market events:', error);
            throw new Error(`Failed to generate market events: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Call the configured AI provider
     */
    private async callAI(prompt: string): Promise<{ content: string; citations: string[] }> {
        switch (this.config.provider) {
            case 'gemini':
                const geminiContent = await this.callGemini(prompt);
                return { content: geminiContent, citations: [] }; // Gemini doesn't provide citations in the same way
            case 'grok':
            case 'xai':
                return this.callGrok(prompt);
            default:
                throw new Error(`Unsupported AI provider: ${this.config.provider}`);
        }
    }

    /**
     * Call Gemini AI
     */
    private async callGemini(prompt: string): Promise<string> {
        if (!this.geminiClient) {
            throw new Error('Gemini client not initialized');
        }

        const model = this.geminiClient.getGenerativeModel({
            model: this.config.model || 'gemini-1.5-pro-latest'
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        return text;
    }

    /**
     * Call xAI (Grok) with web_search and x_search tools
     */
    private async callGrok(prompt: string): Promise<{ content: string; citations: string[] }> {
        const XAI_API_KEY = this.config.apiKey;
        const BASE_URL = 'https://api.x.ai/v1';
        const MODEL = this.config.model || 'grok-4-fast';

        const response = await fetch(`${BASE_URL}/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${XAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                input: [
                    { role: 'system', content: 'You are a financial analyst specializing in market-moving events. Use the available tools to research current market events and provide accurate, timely information.' },
                    { role: 'user', content: prompt }
                ],
                tools: [
                    { type: 'web_search' },
                    { type: 'x_search' }
                ]
            }),
        });

        if (!response.ok) {
            throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        log('xAI Response:', JSON.stringify(data, null, 2));

        // Extract content from xAI responses API format
        const message = data.output?.find((item: any) => item.type === 'message' && item.content);
        const content = message?.content?.[0]?.text || '';

        if (!content) {
            throw new Error('No content received from xAI');
        }

        // Extract citations from annotations
        const citations = message?.content?.[0]?.annotations
            ?.filter((ann: any) => ann.type === 'url_citation')
            ?.map((ann: any) => ann.url) || [];

        return { content, citations };
    }

    /**
     * Build the prompt for generating market events
     */
    private buildMarketEventsPrompt(targetWeek: Date): string {
        const weekEnd = new Date(targetWeek);
        weekEnd.setDate(targetWeek.getDate() + 6);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        };

        return `You are a financial analyst researching CURRENT market-moving events. Use web_search and x_search tools to find real-time information about significant events happening THIS WEEK (${formatDate(targetWeek)} to ${formatDate(weekEnd)}).

RESEARCH INSTRUCTIONS:
1. Use web_search to find official economic calendars, central bank announcements, corporate earnings, and geopolitical developments
2. Use x_search to check recent Twitter discussions about market-moving events, breaking news, and analyst commentary
3. Focus on events that will actually occur this week - not hypothetical future events
4. Look for specific dates, times, and expected outcomes

EVENT TYPES TO RESEARCH:
- Economic data releases (GDP, inflation, employment, PMI, etc.)
- Central bank meetings, rate decisions, and press conferences
- Corporate earnings reports and guidance
- Geopolitical developments, trade talks, conflicts
- Regulatory announcements and policy changes
- Major conferences, summits, or technological releases
- Market holidays and closures

For each event you find through research, provide:
1. Date (exact date like "December 1 2025" or date range like "December 1-3 2025")
2. Event name (official name)
3. Type (descriptive category based on your research)
4. Description & Potential Impact (what it is, when it happens, expected outcomes, market impact)
5. Significance (High, Medium, Low based on historical market impact)
6. Market Sentiment (Bullish, Bearish, Neutral, Mixed based on expected outcome)

Format your response as a valid JSON array. Use the tools to ensure accuracy and timeliness.

Example format:
[
  {
    "date": "December 1 2025",
    "event": "US ISM Manufacturing PMI",
    "type": "Economic",
    "description": "Manufacturing activity indicator released at 10:00 AM ET. Expected 48.5 vs previous 47.8. Key gauge of US manufacturing health.",
    "significance": "High",
    "marketSentiment": "Mixed"
  }
]

Valid event types: "Economic", "Fed", "Crypto", "Retail/Geopolitical", "Holiday", "Geopolitical", "Corporate"

Generate 10-15 events based on your research findings. Focus on events with confirmed dates this week.`;
    }

    /**
     * Parse AI response into market events
     */
    private parseAIResponse(response: string, citations: string[] = []): CreateMarketEvent[] {
        try {
            // Extract JSON from response (AI might add extra text)
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No JSON array found in AI response');
            }

            const events = JSON.parse(jsonMatch[0]);

            if (!Array.isArray(events)) {
                throw new Error('AI response is not a valid array');
            }

            // Validate each event using Zod schema
            const validEvents: CreateMarketEvent[] = [];
            for (const event of events) {
                try {
                    // Basic validation
                    if (!event.date || !event.event || !event.type || !event.description || !event.significance || !event.marketSentiment) {
                        log(`Skipping invalid event: missing required fields`, event);
                        continue;
                    }

                    // Only validate required enum values for significance and sentiment
                    const validSignificance = ['High', 'Medium', 'Low'];
                    const validSentiment = ['Bullish', 'Bearish', 'Neutral', 'Mixed'];

                    if (!validSignificance.includes(event.significance) ||
                        !validSentiment.includes(event.marketSentiment)) {
                        log(`Skipping invalid event: invalid significance or sentiment`, event);
                        continue;
                    }

                    // Normalize event type to valid enum values
                    const validTypes = ['Economic', 'Fed', 'Crypto', 'Retail/Geopolitical', 'Holiday', 'Geopolitical', 'Corporate'];
                    let normalizedType = event.type;

                    // Map common variations to valid types
                    const typeMappings: Record<string, string> = {
                        'US Economic Data': 'Economic',
                        'Economic Data': 'Economic',
                        'Federal Reserve': 'Fed',
                        'Fed Meeting': 'Fed',
                        'FOMC': 'Fed',
                        'Cryptocurrency': 'Crypto',
                        'Crypto Event': 'Crypto',
                        'Retail Sales': 'Retail/Geopolitical',
                        'Geopolitical Event': 'Geopolitical',
                        'Holiday': 'Holiday',
                        'Corporate Earnings': 'Corporate',
                        'Corporate Event': 'Corporate'
                    };

                    if (typeMappings[event.type]) {
                        normalizedType = typeMappings[event.type];
                    } else if (!validTypes.includes(event.type)) {
                        log(`Skipping invalid event: invalid type "${event.type}". Using "Economic" as fallback.`, event);
                        normalizedType = 'Economic'; // Default fallback
                    }

                    validEvents.push({
                        date: event.date,
                        event: event.event,
                        type: normalizedType,
                        description: event.description,
                        significance: event.significance,
                        market_sentiment: event.marketSentiment,
                        citations: citations.length > 0 ? citations : undefined
                    });
                } catch (error) {
                    log(`Error validating event:`, error, event);
                    continue;
                }
            }

            if (validEvents.length === 0) {
                throw new Error('No valid events found in AI response');
            }

            return validEvents;
        } catch (error) {
            log('Error parsing AI response:', error);
            throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get the start date of the current week (Sunday)
     */
    private getCurrentWeekStart(): Date {
        const today = new Date();
        const currentSunday = new Date(today);
        currentSunday.setDate(today.getDate() - today.getDay());
        return currentSunday;
    }
}

// Export singleton instance
export const aiService = new AIService();
