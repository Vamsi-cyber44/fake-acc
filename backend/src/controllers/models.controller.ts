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

interface MLModel {
  find: (query?: any) => QueryChain;
  findById: (id: string) => QueryChain;
  findByIdAndDelete: (id: string) => QueryChain;
  findByIdAndUpdate: (id: string, updates: any) => QueryChain;
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

const MLModel: any = {
  find: () => mockQueryChain(),
  findById: () => mockQueryChain(),
  findByIdAndDelete: () => mockQueryChain(),
  findByIdAndUpdate: () => mockQueryChain(),
  countDocuments: async () => 0,
  aggregate: async () => []
};

// Get all ML models
export const getAllModels = async (req: AuthRequest, res: Response) => {
  try {
    const models = await MLModel.find()
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch models' });
  }
};

// Get active model
export const getActiveModel = async (req: AuthRequest, res: Response) => {
  try {
    const model = await MLModel.findOne({ active: true })
      .populate('uploadedBy', 'username email')
      .lean();

    if (!model) {
      return res.status(404).json({ success: false, message: 'No active model found' });
    }

    res.json({ success: true, data: model });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch active model' });
  }
};

// Upload new model
export const uploadModel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, version, description, modelType, accuracy, precision, recall } = req.body;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Model file required' });
    }

    const model = new MLModel({
      name,
      version,
      description,
      modelType,
      accuracy,
      precision,
      recall,
      fileUrl: file.path,
      fileSize: file.size,
      uploadedBy: req.user?.id,
      active: false
    });

    res.status(201).json({ success: true, data: model });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload model' });
  }
};

// Activate model
export const activateModel = async (req: AuthRequest, res: Response) => {
  try {
    const { modelId } = req.params;

    // Deactivate all other models
    await MLModel.findByIdAndUpdate({ active: true }, { active: false });

    // Activate specified model
    const model = await MLModel.findByIdAndUpdate(modelId, { 
      active: true,
      activatedAt: new Date(),
      activatedBy: req.user?.id
    }, { new: true });

    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    res.json({ success: true, data: model, message: 'Model activated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to activate model' });
  }
};

// Delete model
export const deleteModel = async (req: AuthRequest, res: Response) => {
  try {
    const { modelId } = req.params;
    const model = await MLModel.findById(modelId);

    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    if (model.active) {
      return res.status(400).json({ success: false, message: 'Cannot delete active model' });
    }

    await MLModel.findByIdAndDelete(modelId);
    res.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete model' });
  }
};

// Get model statistics
export const getModelStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalModels = await MLModel.countDocuments();
    const activeModel = await MLModel.findOne({ active: true }).lean();
    
    const models = await MLModel.find().lean();
    const avgAccuracy = models.reduce((acc: number, m: any) => acc + (m.accuracy || 0), 0) / models.length || 0;

    res.json({
      success: true,
      data: {
        total: totalModels,
        active: activeModel ? activeModel.name : 'None',
        avgAccuracy: avgAccuracy.toFixed(2),
        latestUpload: models[0]?.createdAt || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// Compare models
export const compareModels = async (req: AuthRequest, res: Response) => {
  try {
    const { modelIds } = req.body;

    if (!Array.isArray(modelIds) || modelIds.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 model IDs required' });
    }

    const models = await MLModel.find({ _id: { $in: modelIds } }).lean();

    const comparison = {
      models,
      bestByAccuracy: models.reduce((best: any, m: any) => m.accuracy > (best.accuracy || 0) ? m : best),
      bestByPrecision: models.reduce((best: any, m: any) => m.precision > (best.precision || 0) ? m : best),
      bestByRecall: models.reduce((best: any, m: any) => m.recall > (best.recall || 0) ? m : best)
    };

    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compare models' });
  }
};

// Predict using model
export const predictWithModel = async (req: AuthRequest, res: Response) => {
  try {
    const { modelId, features } = req.body;

    const model = await MLModel.findById(modelId).lean();
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    // Simulated prediction
    const prediction = {
      modelId,
      prediction: Math.random() > 0.5 ? 'suspicious' : 'legitimate',
      confidence: (Math.random() * 0.5 + 0.5).toFixed(3),
      features,
      timestamp: new Date()
    };

    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to make prediction' });
  }
};
