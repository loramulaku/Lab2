import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import AvatarUpload  from '../../components/AvatarUpload';
import FormInput     from '../../components/FormInput';
import FormTextarea  from '../../components/FormTextarea';
import FormSelect    from '../../components/FormSelect';
import SectionHeader from '../../components/SectionHeader';
import Header        from '../../components/Header';

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

const SIZES = [
  { value: '', label: 'Select size…' },
  { value: '1-10',     label: '1–10 employees' },
  { value: '11-50',    label: '11–50 employees' },
  { value: '51-200',   label: '51–200 employees' },
  { value: '201-1000', label: '201–1000 employees' },
  { value: '1000+',    label: '1000+ employees' },
];

// ── Location autocomplete (OpenStreetMap Nominatim — no API key) ──────────────
function LocationAutocomplete({ value, onChange }) {
  const [query, setQuery]             = useState(value ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]               = useState(false);
  const debounceRef                   = useRef(null);
  const containerRef                  = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setQuery(value ?? ''); }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  };

  const handleSelect = (displayName) => {
    setQuery(displayName);
    onChange(displayName);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="e.g. New York, NY"
        className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full border border-gray-200 bg-white shadow-md max-h-52 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s.display_name)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CompanySetup() {
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [logoSrc, setLogoSrc]     = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [company, setCompany] = useState({
    companyName: '', industry: '', location: '',
    size: '', foundedYear: '', website: '', description: '',
  });

  const [recruiter, setRecruiter] = useState({
    jobTitle: '', phone: '', linkedinUrl: '',
  });

  useEffect(() => {
    recruiterService.getProfile()
      .then(data => {
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

  const setC = (key) => (e) => { setError(''); setCompany(p => ({ ...p, [key]: e.target.value })); };
  const setR = (key) => (e) => { setRecruiter(p => ({ ...p, [key]: e.target.value })); };

  const handleLogoUpload = async (file) => {
    try {
      const { path } = await recruiterService.uploadLogo(file);
      setLogoSrc(`${API_BASE}${path}`);
    } catch {}
  };

  const handleSubmit = async (e) => {
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Company Setup</h1>
        <p className="text-sm text-gray-500 mb-8">Complete your company profile to start posting jobs.</p>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 p-6 border border-gray-200 bg-white">

            {/* ── Left — Company Information ── */}
            <div className="border-r border-gray-200 pr-6">
              <SectionHeader title="Company Information" />

              <AvatarUpload
                layout="inline"
                shape="square"
                src={logoSrc}
                onUpload={handleLogoUpload}
                label="Company Logo"
                buttonLabel="Upload Logo"
                hint="PNG, JPG up to 5 MB"
              />

              <div className="space-y-4">
                <FormInput
                  label="Company Name *"
                  value={company.companyName}
                  onChange={setC('companyName')}
                  placeholder="e.g. Acme Corp"
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
                    onChange={(val) => { setError(''); setCompany(p => ({ ...p, location: val })); }}
                  />
                </div>
                <FormSelect
                  label="Company Size"
                  value={company.size}
                  onChange={setC('size')}
                  options={SIZES}
                />
                <FormInput
                  label="Founded Year"
                  type="number"
                  value={company.foundedYear}
                  onChange={setC('foundedYear')}
                  placeholder="e.g. 2010"
                />
                <FormInput
                  label="Website"
                  type="url"
                  value={company.website}
                  onChange={setC('website')}
                  placeholder="https://example.com"
                />
                <FormTextarea
                  label="Description"
                  value={company.description}
                  onChange={setC('description')}
                  placeholder="Tell candidates about your company…"
                  rows={4}
                />
              </div>
            </div>

            {/* ── Right — Recruiter Profile ── */}
            <div>
              <SectionHeader title="Recruiter Profile" />

              <AvatarUpload
                layout="inline"
                shape="circle"
                src={null}
                onUpload={setPhotoFile}
                label="Photo"
                buttonLabel="Upload Photo"
                hint="PNG, JPG up to 5 MB"
              />

              <div className="space-y-4">
                <FormInput
                  label="Job Title"
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
                  label="LinkedIn URL"
                  type="url"
                  value={recruiter.linkedinUrl}
                  onChange={setR('linkedinUrl')}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed rounded-none"
            >
              {saving ? 'Saving…' : 'Create & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
