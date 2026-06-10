import { useEffect, useState } from 'react';
import recruiterService from '../../services/recruiterService';
import { PageCard, PageAlert } from '../../components/layout';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import CompanySetupForm from '../../components/recruiter/CompanySetupForm';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

const EMPTY_COMPANY = {
  companyName: '', industry: '', location: '',
  size: '', foundedYear: '', website: '', description: '',
};

const EMPTY_RECRUITER = {
  jobTitle: '', phone: '', linkedinUrl: '',
};

export default function CompanySetup() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [logoSrc, setLogoSrc]   = useState(null);
  const [photoSrc, setPhotoSrc] = useState(null);
  const [company, setCompany]     = useState(EMPTY_COMPANY);
  const [recruiter, setRecruiter] = useState(EMPTY_RECRUITER);

  useEffect(() => {
    recruiterService.getProfile()
      .then((data) => {
        if (data.company) {
          setCompany({
            companyName: data.company.name        ?? '',
            industry:    data.company.industry    ?? '',
            location:    data.company.location    ?? '',
            size:        data.company.size        ?? '',
            foundedYear: data.company.foundedYear ?? '',
            website:     data.company.website     ?? '',
            description: data.company.description ?? '',
          });
          if (data.company.logoPath) setLogoSrc(`${API_BASE}${data.company.logoPath}`);
        }
        if (data.avatarPath) setPhotoSrc(`${API_BASE}${data.avatarPath}`);
        setRecruiter({
          jobTitle:    data.jobTitle    ?? '',
          phone:       data.phone       ?? '',
          linkedinUrl: data.linkedinUrl ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Any field change marks the form as having unsaved edits
  const markUnsaved = () => setSaved(false);

  const onCompanyField = (key) => (e) => {
    setError('');
    markUnsaved();
    setCompany((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onRecruiterField = (key) => (e) => {
    markUnsaved();
    setRecruiter((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!company.companyName.trim()) { setError('Please fill all required fields'); return; }
    setSaving(true);
    setError('');
    try {
      await recruiterService.setup({ ...company, ...recruiter });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout title="Company Profile">
        <p className="text-sm text-gray-400">Loading…</p>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout title="Company Profile">
      <PageAlert>{error}</PageAlert>
      <form onSubmit={onSubmit}>
        <div className="page-shell-card rounded-xl p-6 sm:p-8">
          <CompanySetupForm
            company={company}
            recruiter={recruiter}
            logoSrc={logoSrc}
            photoSrc={photoSrc}
            onCompanyField={onCompanyField}
            onRecruiterField={onRecruiterField}
            onLocationChange={(val) => {
              setError('');
              markUnsaved();
              setCompany((p) => ({ ...p, location: val }));
            }}
            onLogoUpload={async (file) => {
              markUnsaved();
              try {
                const { path } = await recruiterService.uploadLogo(file);
                setLogoSrc(`${API_BASE}${path}`);
              } catch { /* service handles */ }
            }}
            onPhotoUpload={async (file) => {
              try {
                const { path } = await recruiterService.uploadAvatar(file);
                setPhotoSrc(`${API_BASE}${path}`);
              } catch { /* service handles */ }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end">
          {saved ? (
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition"
            >
              {/* checkmark icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Saved — click to edit
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save & Continue'}
            </button>
          )}
        </div>
      </form>
    </RecruiterLayout>
  );
}
