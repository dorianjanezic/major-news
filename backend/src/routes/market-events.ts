import { Router, Request, Response } from 'express';
import { Router as ExpressRouter } from 'express';
import { MarketEventsService } from '../services/market-events.service';
import { aiService } from '../services/ai.service';
import { MarketEventSchema, ApiResponse, MarketEventsResponse } from '../types/market-event';
import { z } from 'zod';
import debug from 'debug';

const log = debug('market-events:routes');
const router: ExpressRouter = Router();
const marketEventsService = new MarketEventsService();

// Query parameters validation
const GetEventsQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  offset: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  type: z.string().optional(),
  significance: z.string().optional(),
  date: z.string().optional(),
});

// GET /api/market-events - Get all market events with optional filtering
router.get('/', async (req: Request, res: Response<ApiResponse<MarketEventsResponse>>) => {
  try {
    const queryParams = GetEventsQuerySchema.safeParse(req.query);

    if (!queryParams.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
      });
    }

    const options = queryParams.data;
    const { events, total } = await marketEventsService.getEvents(options);

    res.json({
      success: true,
      data: {
        events,
        total,
        page: Math.floor((options.offset || 0) / (options.limit || 10)) + 1,
        limit: options.limit || 10,
      },
    });
  } catch (error) {
    log('Error fetching market events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market events',
    });
  }
});

// GET /api/market-events/current-week - Get events for the current week
router.get('/current-week', async (req: Request, res: Response<ApiResponse<MarketEventsResponse['events']>>) => {
  try {
    const events = await marketEventsService.getCurrentWeekEvents();

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    log('Error fetching current week events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current week events',
    });
  }
});

// GET /api/market-events/:id - Get a single market event by ID
router.get('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required',
      });
    }

    const event = await marketEventsService.getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Market event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    log('Error fetching market event by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market event',
    });
  }
});

// POST /api/market-events - Create a new market event
router.post('/', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const validationResult = MarketEventSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
      });
    }

    const eventData = validationResult.data;
    const createdEvent = await marketEventsService.createEvent(eventData);

    res.status(201).json({
      success: true,
      data: createdEvent,
    });
  } catch (error) {
    log('Error creating market event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create market event',
    });
  }
});

// POST /api/market-events/generate - Generate new events using AI
router.post('/generate', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { weekStart } = req.body;
    let targetDate: Date | undefined;

    if (weekStart) {
      targetDate = new Date(weekStart);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid weekStart date format',
        });
      }
    }

    const events = await aiService.generateWeeklyMarketEvents(targetDate);
    const result = await marketEventsService.createEvents(events);

    res.status(201).json({
      success: true,
      data: {
        generated: events.length,
        created: result.created.length,
        skipped: result.skipped,
        events: result.created,
      },
    });
  } catch (error) {
    log('Error generating market events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market events',
    });
  }
});

// PUT /api/market-events/:id - Update a market event
router.put('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required',
      });
    }

    const validationResult = MarketEventSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
      });
    }

    const updates = validationResult.data;
    const updatedEvent = await marketEventsService.updateEvent(id, updates);

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Market event not found',
      });
    }

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    log('Error updating market event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market event',
    });
  }
});

// DELETE /api/market-events/delete-all - Delete all market events
router.delete('/delete-all', async (req: Request, res: Response<ApiResponse<{ deletedCount: number }>>) => {
  try {
    const deletedCount = await marketEventsService.deleteAllEvents();

    res.json({
      success: true,
      data: { deletedCount },
    });
  } catch (error) {
    log('Error deleting all market events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all market events',
    });
  }
});

// DELETE /api/market-events/clear-regenerate - Delete all events and regenerate for current week
router.delete('/clear-regenerate', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    // Step 1: Delete all existing events
    const deletedCount = await marketEventsService.deleteAllEvents();
    log(`Cleared ${deletedCount} old events`);

    // Step 2: Generate fresh events for current week
    const events = await aiService.generateWeeklyMarketEvents(); // Uses current week
    const result = await marketEventsService.createEvents(events);

    res.json({
      success: true,
      data: {
        deleted: deletedCount,
        generated: events.length,
        created: result.created.length,
        skipped: result.skipped,
        events: result.created,
      },
    });
  } catch (error) {
    log('Error in clear-regenerate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear and regenerate market events',
    });
  }
});

// DELETE /api/market-events/:id - Delete a market event
router.delete('/:id', async (req: Request, res: Response<ApiResponse<{ deleted: boolean }>>) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required',
      });
    }

    const deleted = await marketEventsService.deleteEvent(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Market event not found',
      });
    }

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    log('Error deleting market event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete market event',
    });
  }
});


export default router;
