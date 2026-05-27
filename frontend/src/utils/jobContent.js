import { formatLabel } from './format';

function extractBullets(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[\s\-*•]+\s*/, '').trim())
    .filter((line) => line.length > 0);
}

function splitSection(description, pattern) {
  const match = description.match(pattern);
  if (!match) return { before: description, section: '' };
  const index = match.index ?? 0;
  return {
    before: description.slice(0, index).trim(),
    section: match[1]?.trim() ?? '',
  };
}

export function parseJobContent(job) {
  const description = job?.description ?? '';
  const skills = job?.skills ?? [];
  const categories = job?.categories ?? [];
  const experienceLevel = job?.experienceLevel;

  const reqSplit = splitSection(
    description,
    /(?:^|\n)\s*(?:requirements?|qualifications?)\s*:?\s*\n([\s\S]*?)(?=(?:^|\n)\s*responsibilities?\s*:?\s*\n|$)/i
  );

  const respSplit = splitSection(
    reqSplit.before + (reqSplit.section ? '' : description),
    /(?:^|\n)\s*responsibilities?\s*:?\s*\n([\s\S]*?)$/i
  );

  let body = reqSplit.before.trim();
  let requirements = extractBullets(reqSplit.section);
  let responsibilities = extractBullets(respSplit.section);

  if (!requirements.length && skills.length) {
    requirements = [...skills];
  }

  if (experienceLevel) {
    requirements.push(`${formatLabel(experienceLevel)} level experience`);
  }

  if (!responsibilities.length && categories.length) {
    responsibilities = categories.map(
      (category) => `Contribute to ${category.toLowerCase()} projects and initiatives`
    );
  }

  if (!responsibilities.length && body) {
    responsibilities = body
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 24)
      .slice(0, 4);
  }

  if (!body && description) {
    body = description;
  }

  return {
    body,
    requirements: [...new Set(requirements)],
    responsibilities: [...new Set(responsibilities)],
  };
}

export function formatDescriptionParagraphs(text) {
  if (!text) return [];
  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
}
