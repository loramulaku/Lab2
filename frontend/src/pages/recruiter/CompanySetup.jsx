import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import { PageShell, PageCard, PageAlert } from '../../components/layout';
import CompanyInformationSection from '../../components/recruiter/CompanyInformationSection';
import RecruiterProfileSection from '../../components/recruiter/RecruiterProfileSection';

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
  const [logoSrc, setLogoSrc]     = useState(null);
  const [, setPhotoFile]          = useState(null);
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
          if (data.company.logoPath) {
            setLogoSrc(`${API_BASE}${data.company.logoPath}`);
          }
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

  const onLocationChange = (val) => {
    setError('');
    setCompany((prev) => ({ ...prev, location: val }));
  };

  const onLogoUpload = async (file) => {
    try {
      const { path } = await recruiterService.uploadLogo(file);
      setLogoSrc(`${API_BASE}${path}`);
    } catch { /* handled by service */ }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!company.companyName.trim()) {
      setError('Please fill all required fields');
      return;
    }
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

  return (
    <PageShell
      title="Company Setup"
      subtitle="Complete your company profile to start posting jobs."
      loading={loading}
    >
      <PageAlert>{error}</PageAlert>

      <form onSubmit={onSubmit}>
        <PageCard className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <CompanyInformationSection
              company={company}
              logoSrc={logoSrc}
              onFieldChange={onCompanyField}
              onLocationChange={onLocationChange}
              onLogoUpload={onLogoUpload}
            />
            <RecruiterProfileSection
              recruiter={recruiter}
              onFieldChange={onRecruiterField}
              onPhotoUpload={setPhotoFile}
            />
          </div>
        </PageCard>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 text-sm rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Create & Continue'}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
