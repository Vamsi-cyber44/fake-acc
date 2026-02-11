import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

// Type stubs for missing models - support Mongoose query chains
interface QueryChain {
  populate: (path: string, select?: string) => QueryChain;
  sort: (sort: any) => QueryChain;
  skip: (n: number) => QueryChain;
  limit: (n: number) => QueryChain;
  lean: () => QueryChain;
  exec: () => Promise<any>;
  then: (onFulfilled?: any, onRejected?: any) => Promise<any>;
}

interface CMSContent {
  find: (query?: any) => QueryChain;
  findOne: (query?: any) => QueryChain;
  findOneAndDelete: (query?: any) => QueryChain;
  countDocuments: (query?: any) => Promise<number>;
  constructor: any;
}

interface AdminLog {
  find: (query?: any) => QueryChain;
  create: (data: any) => Promise<any>;
}

const mockQueryChain = (): QueryChain => ({
  populate: () => mockQueryChain(),
  sort: () => mockQueryChain(),
  skip: () => mockQueryChain(),
  limit: () => mockQueryChain(),
  lean: () => mockQueryChain(),
  exec: async () => [],
  then: async () => []
});

const CMSContent: any = {
  find: () => mockQueryChain(),
  findOne: () => mockQueryChain(),
  findOneAndDelete: () => mockQueryChain(),
  countDocuments: async () => 0
};

const AdminLog: any = {
  find: () => mockQueryChain(),
  create: async () => ({})
};

// Get all CMS content
export const getAllCMSContent = async (req: AuthRequest, res: Response) => {
  try {
    const content = await CMSContent.find().populate('lastModifiedBy', 'email username');
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

// Get specific section
export const getCMSSection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionKey } = req.params;
    const content = await CMSContent.findOne({ sectionKey }).populate('lastModifiedBy', 'email username');
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch section' });
  }
};

// Update CMS content
export const updateCMSContent = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionKey } = req.params;
    const { content, metadata } = req.body;
    
    let cmsContent = await CMSContent.findOne({ sectionKey });
    if (!cmsContent) {
      cmsContent = new CMSContent({
        sectionKey,
        content,
        metadata,
        lastModifiedBy: req.user?.id,
        lastModifiedAt: new Date()
      });
    } else {
      cmsContent.content = content;
      cmsContent.metadata = metadata;
      cmsContent.lastModifiedBy = req.user?.id;
      cmsContent.lastModifiedAt = new Date();
    }
    
    await cmsContent.save();
    res.json({ success: true, message: 'Content updated', data: cmsContent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
};

// Delete CMS content
export const deleteCMSContent = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionKey } = req.params;
    const content = await CMSContent.findOneAndDelete({ sectionKey });
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
};

// Get CMS analytics
export const getCMSAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const content = await CMSContent.findOne({ sectionKey: 'analytics' });
    const logs = await AdminLog.find({
      resource: 'cms',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        totalSections: 0,
        lastUpdated: content?.lastModifiedAt,
        recentChanges: logs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
