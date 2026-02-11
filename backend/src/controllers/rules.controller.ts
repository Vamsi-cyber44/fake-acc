import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

// Type stubs for missing models - support Mongoose query chains
interface QueryChain {
  populate: (path: string, select?: string) => QueryChain;
  sort: (sort: any) => QueryChain;
  lean: () => QueryChain;
  exec: () => Promise<any>;
  then: (onFulfilled?: any, onRejected?: any) => Promise<any>;
}

interface DetectionRule {
  find: (query?: any) => QueryChain;
  findById: (id: string) => QueryChain;
  findByIdAndDelete: (id: string) => QueryChain;
  countDocuments: (query?: any) => Promise<number>;
  aggregate: (pipeline: any[]) => Promise<any>;
  constructor: any;
}

const mockQueryChain = (): QueryChain => ({
  populate: () => mockQueryChain(),
  sort: () => mockQueryChain(),
  lean: () => mockQueryChain(),
  exec: async () => [],
  then: async () => []
});

const DetectionRule: any = {
  find: () => mockQueryChain(),
  findById: () => mockQueryChain(),
  findByIdAndDelete: () => mockQueryChain(),
  countDocuments: async () => 0,
  aggregate: async () => []
};

// Get all detection rules
export const getAllRules = async (req: AuthRequest, res: Response) => {
  try {
    const rules = await DetectionRule.find().populate('lastModifiedBy', 'email username').sort({ weight: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rules' });
  }
};

// Get enabled rules only
export const getEnabledRules = async (req: AuthRequest, res: Response) => {
  try {
    const rules = await DetectionRule.find({ enabled: true }).sort({ weight: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rules' });
  }
};

// Create new detection rule
export const createRule = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, indicatorType, weight, threshold, riskScore, confidenceLevel } = req.body;
    
    const rule = new DetectionRule({
      name,
      description,
      indicatorType,
      weight,
      threshold,
      riskScore,
      confidenceLevel,
      enabled: true,
      createdBy: req.user?.id,
      lastModifiedBy: req.user?.id
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create rule' });
  }
};

// Update detection rule
export const updateRule = async (req: AuthRequest, res: Response) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    const rule = await DetectionRule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    Object.assign(rule, updates);
    rule.lastModifiedBy = req.user?.id;
    rule.lastModifiedAt = new Date();
    
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update rule' });
  }
};

// Delete detection rule
export const deleteRule = async (req: AuthRequest, res: Response) => {
  try {
    const { ruleId } = req.params;
    const rule = await DetectionRule.findByIdAndDelete(ruleId);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete rule' });
  }
};

// Get rule statistics
export const getRuleStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const total = await DetectionRule.countDocuments();
    const enabled = await DetectionRule.countDocuments({ enabled: true });
    const avgWeight = await DetectionRule.aggregate([
      { $group: { _id: null, avg: { $avg: '$weight' } } }
    ]);
    const totalRiskPoints = await DetectionRule.aggregate([
      { $group: { _id: null, total: { $sum: '$riskScore' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        enabled,
        disabled: total - enabled,
        avgWeight: avgWeight[0]?.avg || 0,
        totalRiskPoints: totalRiskPoints[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};
