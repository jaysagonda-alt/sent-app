import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default (authMiddleware: any) => {
  const router = Router();

  // Send connection request
  router.post('/:userId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (userId === req.userId) {
        return res.status(400).json({ error: 'Cannot connect with yourself' });
      }

      // Check if already connected
      const existing = await prisma.connection.findUnique({
        where: {
          fromId_toId: {
            fromId: req.userId,
            toId: userId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Connection already exists' });
      }

      const connection = await prisma.connection.create({
        data: {
          fromId: req.userId,
          toId: userId,
          status: 'pending',
        },
      });

      res.status(201).json(connection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send connection request' });
    }
  });

  // Accept connection request
  router.put('/:connectionId/accept', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { connectionId } = req.params;

      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      if (connection.toId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'connected' },
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to accept connection' });
    }
  });

  // Reject connection request
  router.put('/:connectionId/reject', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { connectionId } = req.params;

      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      if (connection.toId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'rejected' },
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to reject connection' });
    }
  });

  // Get pending connection requests
  router.get('/requests/pending', authMiddleware, async (req: Request, res: Response) => {
    try {
      const requests = await prisma.connection.findMany({
        where: {
          toId: req.userId,
          status: 'pending',
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              missionOrg: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

  // Get user's connections
  router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
      const connections = await prisma.connection.findMany({
        where: {
          AND: [
            {
              OR: [
                { fromId: req.userId },
                { toId: req.userId },
              ],
            },
            { status: 'connected' },
          ],
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              missionOrg: true,
            },
          },
          to: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              missionOrg: true,
            },
          },
        },
      });

      // Transform to return the "other" user in each connection
      const result = connections.map((conn) => ({
        connectionId: conn.id,
        user: conn.fromId === req.userId ? conn.to : conn.from,
        connectedAt: conn.createdAt,
      }));

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch connections' });
    }
  });

  return router;
};
