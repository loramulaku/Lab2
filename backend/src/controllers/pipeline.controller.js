const pipelineRepo = require('../repositories/mysql/pipeline.repo');

const createPipeline = async (req, res) => {
  try {
    const { jobId, name } = req.body;
    if (!jobId || !name) return res.status(400).json({ message: 'jobId and name are required' });
    const pipeline = await pipelineRepo.createPipeline(jobId, name);
    res.status(201).json(pipeline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPipelineByJob = async (req, res) => {
  try {
    const pipeline = await pipelineRepo.getPipelineByJobId(req.params.jobId);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addStage = async (req, res) => {
  try {
    const { name, orderIndex } = req.body;
    if (!name || orderIndex === undefined) return res.status(400).json({ message: 'name and orderIndex are required' });
    const stage = await pipelineRepo.createStage(req.params.pipelineId, name, orderIndex);
    res.status(201).json(stage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const moveCandidate = async (req, res) => {
  try {
    const { applicationId, fromStageId, toStageId } = req.body;
    if (!applicationId || !toStageId) return res.status(400).json({ message: 'applicationId and toStageId are required' });
    const history = await pipelineRepo.moveCandidate(applicationId, fromStageId, toStageId, req.user.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStageHistory = async (req, res) => {
  try {
    const history = await pipelineRepo.getStageHistory(req.params.applicationId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPipeline, getPipelineByJob, addStage, moveCandidate, getStageHistory };