import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify auth
const authMiddleware = (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
        missionOrg: true,
        denomination: true,
        missionType: true,
        location: true,
        country: true,
        languagesSpoken: true,
        denominationPreference: true,
        missionTypePreference: true,
        createdAt: true,
        lastSeen: true,
        posts: {
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            scriptureRef: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, bio, profileImage, missionOrg, denomination, missionType, location, country, languagesSpoken, denominationPreference, missionTypePreference } = req.body;

    // Check authorization
    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(profileImage && { profileImage }),
        ...(missionOrg && { missionOrg }),
        ...(denomination && { denomination }),
        ...(missionType && { missionType }),
        ...(location && { location }),
        ...(country && { country }),
        ...(languagesSpoken && { languagesSpoken }),
        ...(denominationPreference && { denominationPreference }),
        ...(missionTypePreference && { missionTypePreference }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profileImage: true,
        missionOrg: true,
        denomination: true,
        missionType: true,
        location: true,
        country: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search and filter users
router.get('/search/filter', async (req: Request, res: Response) => {
  try {
    const {
      missionType,
      denomination,
      location,
      country,
      search,
      limit = '20',
      offset = '0',
    } = req.query;

    const where: any = {
      id: { not: req.userId }, // Exclude current user if authenticated
    };

    if (missionType) {
      where.missionTypePreference = { has: missionType as string };
    }

    if (denomination) {
      where.denominationPreference = { has: denomination as string };
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { bio: { contains: search as string, mode: 'insensitive' } },
        { missionOrg: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
        missionOrg: true,
        denomination: true,
        missionType: true,
        location: true,
        country: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get suggested users (for discovery)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { not: req.userId },
        // Match on mission type or denomination preferences
        OR: [
          { missionTypePreference: { hasSome: currentUser.missionTypePreference } },
          { denominationPreference: { hasSome: currentUser.denominationPreference } },
        ],
      },
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
        missionOrg: true,
        denomination: true,
        missionType: true,
        location: true,
        country: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    res.json(suggestedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
