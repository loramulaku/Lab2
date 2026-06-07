import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [logoSrc, setLogoSrc] = useState(null);
  const [, setPhotoFile]      = useState(null);
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
        setRecruiter({
          jobTitle:    data.jobTitle    ?? '',
          phone:       data.phone       ?? '',
          linkedinUrl: data.linkedinUrl ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onCompanyField = (key) => (e) => {
    setError('');
    setCompany((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onRecruiterField = (key) => (e) => {
    setRecruiter((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!company.companyName.trim()) { setError('Please fill all required fields'); return; }
    setSaving(true);
    try {
      await recruiterService.setup({ ...company, ...recruiter });
      navigate('/recruiter/company');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout title="Company Setup">
        <p className="text-sm text-gray-400">Loading…</p>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout title="Company Setup">
      <PageAlert>{error}</PageAlert>
      <form onSubmit={onSubmit}>
        <div className="bg-white border border-gray-200 p-6 sm:p-8">
          <CompanySetupForm
            company={company}
            recruiter={recruiter}
            logoSrc={logoSrc}
            onCompanyField={onCompanyField}
            onRecruiterField={onRecruiterField}
            onLocationChange={(val) => { setError(''); setCompany((p) => ({ ...p, location: val })); }}
            onLogoUpload={async (file) => {
              try {
                const { path } = await recruiterService.uploadLogo(file);
                setLogoSrc(`${API_BASE}${path}`);
              } catch { /* service handles */ }
            }}
            onPhotoUpload={setPhotoFile}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </RecruiterLayout>
  );
}
