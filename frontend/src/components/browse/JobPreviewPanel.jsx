import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { JobMetaBadges } from '../JobMeta';
import {
  formatSalary,
  formatWorkMode,
  formatRelativeTime,
  companyInitials,
} from '../../utils/format';

export default function JobPreviewPanel({ job, onSave, saved }) {
  if (!job) {
    return (
      <div className="browse-preview-empty">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-300">→</span>
        </div>
        <p className="text-sm font-medium text-gray-700">Select a role to preview</p>
        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
          Click any listing on the left to read details here without leaving the page.
        </p>
      </div>
    );
  }

  const companyName = job.company?.name ?? 'Company';
  const workMode = formatWorkMode(job.workMode);
  const excerpt = job.description?.replace(/\s+/g, ' ').trim().slice(0, 320);

  return (
    <article className="browse-preview-panel animate-fade-in">
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-base font-bold text-white shrink-0">
          {companyInitials(companyName)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h2>
          <p className="text-sm text-gray-600 mt-0.5">{companyName}</p>
          <JobMetaBadges job={job} className="mt-2" />
        </div>
      </div>

      <div className="py-5 border-b border-gray-100">
        <p className="text-2xl font-bold text-gray-900 tracking-tight">
          {formatSalary(job.budgetMin, job.budgetMax)}
        </p>
        {job.createdAt && (
          <p className="text-xs text-gray-500 mt-1">
            Posted {formatRelativeTime(job.createdAt)}
          </p>
        )}
      </div>

      <dl className="py-5 space-y-3 text-sm border-b border-gray-100">
        {workMode && (
          <div className="flex gap-3">
            <dt className="text-gray-400 w-24 shrink-0">Work style</dt>
            <dd className="text-gray-900 font-medium">{workMode}</dd>
          </div>
        )}
        {job.company?.location && (
          <div className="flex gap-3">
            <dt className="text-gray-400 w-24 shrink-0 flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5" />
              Location
            </dt>
            <dd className="text-gray-900 font-medium">{job.company.location}</dd>
          </div>
        )}
        {job.company?.industry && (
          <div className="flex gap-3">
            <dt className="text-gray-400 w-24 shrink-0">Industry</dt>
            <dd className="text-gray-900 font-medium">{job.company.industry}</dd>
          </div>
        )}
      </dl>

      {excerpt && (
        <div className="py-5 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            About the role
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {excerpt}
            {job.description?.length > 320 && '…'}
          </p>
        </div>
      )}

      {(job.skills ?? []).length > 0 && (
        <div className="py-5 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-5 space-y-2.5">
        <Link
          to={`/jobs/${job.id}`}
          className="btn-primary w-full py-3 text-sm font-semibold"
        >
          View full role & apply
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </Link>
        {onSave && (
          <button
            type="button"
            onClick={() => onSave(job.id)}
            className="btn-secondary w-full py-2.5"
          >
            <BookmarkIcon className="w-4 h-4" />
            {saved ? 'Saved' : 'Save for later'}
          </button>
        )}
      </div>
    </article>
  );
}
