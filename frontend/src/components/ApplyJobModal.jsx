import { useEffect, useRef, useState } from 'react';
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import candidateService from '../services/candidateService';

export default function ApplyJobModal({ job, isOpen, onClose, onSubmit, submitting }) {
  const { token } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeSource, setResumeSource] = useState('profile');
  const [resumeFile, setResumeFile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileName, setProfileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCoverLetter('');
      setResumeSource('profile');
      setResumeFile(null);
      setProfileLoaded(false);
      return;
    }

    if (token) {
      candidateService
        .getProfile()
        .then((profile) => {
          const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
          setProfileName(name || 'Your profile');
          setProfileLoaded(true);
        })
        .catch(() => setProfileLoaded(true));
    }
  }, [isOpen, token]);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      jobId: job.id,
      coverLetter: coverLetter.trim(),
      resumeFile: resumeSource === 'upload' ? resumeFile : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Apply for this role</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label htmlFor="cover-letter" className="block text-sm font-medium text-gray-700 mb-2">
              Cover letter
            </label>
            <textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              required
              placeholder="Tell the hiring team why you're a great fit for this role…"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Resume</p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="resumeSource"
                  value="profile"
                  checked={resumeSource === 'profile'}
                  onChange={() => setResumeSource('profile')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Use profile information</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {profileLoaded
                      ? `Submit with ${profileName}'s HireFlow profile`
                      : 'Loading profile…'}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="resumeSource"
                  value="upload"
                  checked={resumeSource === 'upload'}
                  onChange={() => setResumeSource('upload')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Upload a new resume</p>
                  <p className="text-xs text-gray-500 mt-0.5">PDF or Word document, max 5 MB</p>
                  {resumeSource === 'upload' && (
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        {resumeFile ? resumeFile.name : 'Choose file'}
                      </button>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (resumeSource === 'upload' && !resumeFile)}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
