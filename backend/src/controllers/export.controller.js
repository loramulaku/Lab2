const path = require('path');
const fs   = require('fs');
const { Parser } = require('json2csv');
const ExcelJS    = require('exceljs');
const Export     = require('../models/sql/Export');
const User       = require('../models/sql/User');
const Job        = require('../models/sql/Job');
const Application = require('../models/sql/Application');
const Company    = require('../models/sql/Company');
const Bid        = require('../models/sql/Bid');

const EXPORTS_DIR = path.join(__dirname, '../../public/exports');
fs.mkdirSync(EXPORTS_DIR, { recursive: true });

// ── Entity definitions ────────────────────────────────────────────────────────

const ENTITIES = {
  users: {
    model: User,
    attributes: ['id', 'firstName', 'lastName', 'email', 'isActive', 'created_at'],
    fields: [
      { label: 'ID',         value: 'id' },
      { label: 'First Name', value: 'firstName' },
      { label: 'Last Name',  value: 'lastName' },
      { label: 'Email',      value: 'email' },
      { label: 'Active',     value: 'isActive' },
      { label: 'Created At', value: 'created_at' },
    ],
  },
  jobs: {
    model: Job,
    attributes: ['id', 'title', 'employmentType', 'workMode', 'status', 'createdAt'],
    fields: [
      { label: 'ID',              value: 'id' },
      { label: 'Title',           value: 'title' },
      { label: 'Employment Type', value: 'employmentType' },
      { label: 'Work Mode',       value: 'workMode' },
      { label: 'Status',          value: 'status' },
      { label: 'Created At',      value: 'createdAt' },
    ],
  },
  applications: {
    model: Application,
    attributes: ['id', 'jobId', 'userId', 'status', 'appliedAt'],
    fields: [
      { label: 'ID',         value: 'id' },
      { label: 'Job ID',     value: 'jobId' },
      { label: 'User ID',    value: 'userId' },
      { label: 'Status',     value: 'status' },
      { label: 'Applied At', value: 'appliedAt' },
    ],
  },
  companies: {
    model: Company,
    attributes: ['id', 'name', 'website', 'createdAt'],
    fields: [
      { label: 'ID',         value: 'id' },
      { label: 'Name',       value: 'name' },
      { label: 'Website',    value: 'website' },
      { label: 'Created At', value: 'createdAt' },
    ],
  },
  bids: {
    model: Bid,
    attributes: ['id', 'jobId', 'freelancerId', 'price', 'status', 'deliveryTimeDays'],
    fields: [
      { label: 'ID',                   value: 'id' },
      { label: 'Job ID',               value: 'jobId' },
      { label: 'Freelancer ID',        value: 'freelancerId' },
      { label: 'Price',                value: 'price' },
      { label: 'Status',               value: 'status' },
      { label: 'Delivery Time (days)', value: 'deliveryTimeDays' },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function buildFile(rows, entity, format, filepath) {
  const cfg = ENTITIES[entity];

  if (format === 'json') {
    await fs.promises.writeFile(filepath, JSON.stringify(rows, null, 2));
    return;
  }

  if (format === 'csv') {
    const parser = new Parser({ fields: cfg.fields });
    const csv = parser.parse(rows.length ? rows : []);
    await fs.promises.writeFile(filepath, csv);
    return;
  }

  // excel
  const workbook  = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(entity);
  worksheet.columns = cfg.fields.map(f => ({
    header: f.label,
    key:    f.value,
    width:  Math.max(f.label.length + 4, 14),
  }));
  worksheet.addRows(rows);
  await workbook.xlsx.writeFile(filepath);
}

// ── Controllers ───────────────────────────────────────────────────────────────

const triggerExport = async (req, res) => {
  const { entity, format } = req.params;

  if (!ENTITIES[entity]) {
    return res.status(400).json({ message: `Unknown entity "${entity}". Valid: ${Object.keys(ENTITIES).join(', ')}` });
  }
  if (!['csv', 'excel', 'json'].includes(format)) {
    return res.status(400).json({ message: `Unknown format "${format}". Valid: csv, excel, json` });
  }

  const ext      = format === 'excel' ? 'xlsx' : format;
  const filename = `${entity}_${Date.now()}.${ext}`;
  const filepath = path.join(EXPORTS_DIR, filename);

  try {
    const cfg  = ENTITIES[entity];
    const rows = (await cfg.model.findAll({ attributes: cfg.attributes })).map(r => r.toJSON());

    await buildFile(rows, entity, format, filepath);

    await Export.create({
      userId:   req.user.id,
      type:     `${entity}_${format}`,
      filePath: `/exports/${filename}`,
      createdAt: new Date(),
    });

    res.json({ downloadUrl: `/exports/${filename}` });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Export failed', error: err.message });
  }
};

const getMyExports = async (req, res) => {
  try {
    const exports = await Export.findAll({
      where:  { userId: req.user.id },
      order:  [['created_at', 'DESC']],
      limit:  50,
    });
    res.json(exports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { triggerExport, getMyExports };
