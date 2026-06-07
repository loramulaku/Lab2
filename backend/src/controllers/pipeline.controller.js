const CreatePipelineCommand       = require('../application/pipeline/commands/CreatePipeline.command');
const EditPipelineCommand         = require('../application/pipeline/commands/EditPipeline.command');
const MoveCandidateToStageCommand = require('../application/pipeline/commands/MoveCandidateToStage.command');
const AddPipelineNoteCommand      = require('../application/pipeline/commands/AddPipelineNote.command');
const GetCompanyPipelineQuery     = require('../application/pipeline/queries/GetCompanyPipeline.query');
const GetPipelineBoardQuery       = require('../application/pipeline/queries/GetPipelineBoard.query');
const GetTransitionNotesQuery     = require('../application/pipeline/queries/GetTransitionNotes.query');

const createPipelineHandler       = require('../application/pipeline/handlers/CreatePipelineHandler');
const editPipelineHandler         = require('../application/pipeline/handlers/EditPipelineHandler');
const getCompanyPipelineHandler   = require('../application/pipeline/handlers/GetCompanyPipelineHandler');
const getPipelineBoardHandler     = require('../application/pipeline/handlers/GetPipelineBoardHandler');
const getTransitionNotesHandler   = require('../application/pipeline/handlers/GetTransitionNotesHandler');
const moveCandidateToStageHandler = require('../application/pipeline/handlers/MoveCandidateToStageHandler');
const addPipelineNoteHandler      = require('../application/pipeline/handlers/AddPipelineNoteHandler');

const pipelineRepo     = require('../repositories/mysql/pipeline.repo');
const RecruiterProfile = require('../models/sql/RecruiterProfile');

async function resolveCompanyId(req) {
  if (req.user.companyId) return req.user.companyId;
  const profile = await RecruiterProfile.findOne({ where: { userId: req.user.id } });
  return profile?.companyId ?? null;
}

// POST /api/pipeline — create the company pipeline
const createPipeline = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'Company profile not set up yet' });
    const result = await createPipelineHandler.handle(
      new CreatePipelineCommand({ companyId, stages: req.body.stages ?? [] })
    );
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'PIPELINE_EXISTS') return res.status(409).json({ message: err.message, code: err.code });
    next(err);
  }
};

// PUT /api/pipeline — edit (destructive: resets all candidate stages)
const editPipeline = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'Company profile not set up yet' });
    const result = await editPipelineHandler.handle(
      new EditPipelineCommand({ companyId, stages: req.body.stages ?? [] })
    );
    res.json(result);
  } catch (err) { next(err); }
};

// GET /api/pipeline/my — get the recruiter's pipeline + stages
const getMyPipeline = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await getCompanyPipelineHandler.handle(new GetCompanyPipelineQuery(companyId));
    if (!result) return res.status(404).json({ message: 'No pipeline found', code: 'NO_PIPELINE' });
    res.json(result);
  } catch (err) { next(err); }
};

// GET /api/pipeline/board — Kanban data (stages + candidate cards with read status)
const getPipelineBoard = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await getPipelineBoardHandler.handle(
      new GetPipelineBoardQuery(companyId, req.query.search)
    );
    if (!result) return res.status(404).json({ message: 'No pipeline found', code: 'NO_PIPELINE' });
    res.json(result);
  } catch (err) { next(err); }
};

// GET /api/pipeline/notes — transition notes view
const getTransitionNotes = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await getTransitionNotesHandler.handle(new GetTransitionNotesQuery(companyId));
    res.json(result);
  } catch (err) { next(err); }
};

// POST /api/pipeline/move — move a candidate to a different stage (note mandatory)
const moveCandidate = async (req, res, next) => {
  try {
    const { applicationId, toStageId, note, interviewDate } = req.body;
    if (!applicationId || !toStageId) return res.status(400).json({ message: 'applicationId and toStageId required' });
    if (!note || !note.trim()) return res.status(400).json({ message: 'A transition note is required', code: 'NOTE_REQUIRED' });
    const result = await moveCandidateToStageHandler.handle(
      new MoveCandidateToStageCommand({ applicationId, toStageId, note, recruiterId: req.user.id, interviewDate })
    );
    res.json(result);
  } catch (err) {
    if (err.code === 'NOTE_REQUIRED') return res.status(400).json({ message: err.message, code: err.code });
    if (err.code === 'NOTIFICATION_NOT_READ') return res.status(403).json({ message: err.message, code: err.code });
    next(err);
  }
};

// POST /api/pipeline/note — add a stage note without moving
const addNote = async (req, res, next) => {
  try {
    const { applicationId, stageId, note } = req.body;
    if (!applicationId || !stageId || !note) return res.status(400).json({ message: 'applicationId, stageId and note required' });
    const result = await addPipelineNoteHandler.handle(
      new AddPipelineNoteCommand({ applicationId, stageId, note, recruiterId: req.user.id })
    );
    res.json(result);
  } catch (err) { next(err); }
};

// ── Legacy routes kept for backward compatibility ─────────────────────────────

const getPipelineByJob = async (req, res) => {
  try {
    const pipeline = await pipelineRepo.getPipelineByJobId(req.params.jobId);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });
    res.json(pipeline);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addStage = async (req, res) => {
  try {
    const { name, orderIndex } = req.body;
    if (!name || orderIndex === undefined) return res.status(400).json({ message: 'name and orderIndex required' });
    const stage = await pipelineRepo.createStage(req.params.pipelineId, name, orderIndex);
    res.status(201).json(stage);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getStageHistory = (_req, res) => res.json([]);

module.exports = {
  createPipeline, editPipeline, getMyPipeline, getPipelineBoard, getTransitionNotes,
  moveCandidate, addNote,
  getPipelineByJob, addStage, getStageHistory,
};
