import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuildingOffice2Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import recruiterService from '../../services/recruiterService';
import AvatarUpload from '../../components/AvatarUpload';
import FormInput from '../../components/FormInput';
import FormTextarea from '../../components/FormTextarea';
import FormSelect from '../../components/FormSelect';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import SiteLayout from '../../components/SiteLayout';
import Toast from '../../components/Toast';
import PageHeader from '../../components/PageHeader';
import { PageError } from '../../components/PageFeedback';
import useToast from '../../hooks/useToast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

const SIZES = [
  { value: '', label: 'Select size…' },
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-1000', label: '201–1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

function SetupSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      <div className="surface h-96" />
      <div className="surface h-96" />
    </div>
  );
}

export default function CompanySetup() {
  const navigate = useNavigate();
  const { toast, showToast, dismissToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasCompany, setHasCompany] = useState(false);
  const [logoSrc, setLogoSrc] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);

  const [company, setCompany] = useState({
    companyName: '',
    industry: '',
    location: '',
    size: '',
    foundedYear: '',
    website: '',
    description: '',
  });

  const [recruiter, setRecruiter] = useState({
    jobTitle: '',
    phone: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    recruiterService
      .getProfile()
      .then((data) => {
        if (data.company?.name) setHasCompany(true);
        if (data.company) {
          setCompany({
            companyName: data.company.name ?? '',
            industry: data.company.industry ?? '',
            location: data.company.location ?? '',
            size: data.company.size ?? '',
            foundedYear: data.company.foundedYear ?? '',
            website: data.company.website ?? '',
            description: data.company.description ?? '',
          });
          if (data.company.logoPath) {
            setLogoSrc(`${API_BASE}${data.company.logoPath}`);
          }
        }
        setRecruiter({
          jobTitle: data.jobTitle ?? '',
          phone: data.phone ?? '',
          linkedinUrl: data.linkedinUrl ?? '',
        });
        if (data.avatarPath) {
          setAvatarSrc(`${API_BASE}${data.avatarPath}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setC = (key) => (e) => {
    setError('');
    setCompany((p) => ({ ...p, [key]: e.target.value }));
  };

  const setR = (key) => (e) => {
    setRecruiter((p) => ({ ...p, [key]: e.target.value }));
  };

  const handleLogoUpload = async (file) => {
    try {
      const { path } = await recruiterService.uploadLogo(file);
      setLogoSrc(`${API_BASE}${path}`);
      showToast('Logo uploaded');
    } catch {
      showToast('Logo upload failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    try {
      await recruiterService.setup({ ...company, ...recruiter });
      showToast(hasCompany ? 'Company profile saved' : 'Company profile created');
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SiteLayout>
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="max-w-5xl mx-auto">
        <PageHeader
          title={hasCompany ? 'Company settings' : 'Set up your company'}
          subtitle={hasCompany
            ? 'Update how your company appears to candidates on job listings.'
            : 'Complete your profile before posting your first job.'}
          className="mb-8"
        />

        {error && (
          <PageError message={error} className="mb-6" />
        )}

        {loading ? (
          <SetupSkeleton />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="surface p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <BuildingOffice2Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Company</h2>
                    <p className="text-xs text-gray-500">Shown on every job you post</p>
                  </div>
                </div>

                <AvatarUpload
                  layout="inline"
                  shape="square"
                  src={logoSrc}
                  onUpload={handleLogoUpload}
                  label="Company logo"
                  buttonLabel="Upload logo"
                  hint="PNG or JPG, up to 5 MB"
                />

                <div className="space-y-4 mt-6">
                  <FormInput
                    label="Company name *"
                    value={company.companyName}
                    onChange={setC('companyName')}
                    placeholder="e.g. Northwind Labs"
                  />
                  <FormInput
                    label="Industry"
                    value={company.industry}
                    onChange={setC('industry')}
                    placeholder="e.g. Software / Technology"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <LocationAutocomplete
                      value={company.location}
                      onChange={(val) => {
                        setError('');
                        setCompany((p) => ({ ...p, location: val }));
                      }}
                      placeholder="City or region"
                    />
                  </div>
                  <FormSelect
                    label="Company size"
                    value={company.size}
                    onChange={setC('size')}
                    options={SIZES}
                  />
                  <FormInput
                    label="Founded year"
                    type="number"
                    value={company.foundedYear}
                    onChange={setC('foundedYear')}
                    placeholder="e.g. 2018"
                  />
                  <FormInput
                    label="Website"
                    type="url"
                    value={company.website}
                    onChange={setC('website')}
                    placeholder="https://example.com"
                  />
                  <FormTextarea
                    label="About the company"
                    value={company.description}
                    onChange={setC('description')}
                    placeholder="What does your team build? Why do people join?"
                    rows={4}
                  />
                </div>
              </section>

              <section className="surface p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Your recruiter profile</h2>
                    <p className="text-xs text-gray-500">How candidates see you on applications</p>
                  </div>
                </div>

                <AvatarUpload
                  layout="inline"
                  shape="circle"
                  src={avatarSrc}
                  onUpload={() => showToast('Photo upload coming soon', 'error')}
                  label="Profile photo"
                  buttonLabel="Upload photo"
                  hint="Optional — uses your account avatar when set"
                />

                <div className="space-y-4 mt-6">
                  <FormInput
                    label="Job title"
                    value={recruiter.jobTitle}
                    onChange={setR('jobTitle')}
                    placeholder="e.g. Head of Talent"
                  />
                  <FormInput
                    label="Phone"
                    type="tel"
                    value={recruiter.phone}
                    onChange={setR('phone')}
                    placeholder="+1 555 000 0000"
                  />
                  <FormInput
                    label="LinkedIn"
                    type="url"
                    value={recruiter.linkedinUrl}
                    onChange={setR('linkedinUrl')}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </section>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/recruiter/dashboard')}
                className="btn-secondary order-2 sm:order-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary px-8 py-3 order-1 sm:order-2">
                {saving ? 'Saving…' : hasCompany ? 'Save changes' : 'Create & go to dashboard'}
              </button>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
