import AvatarUpload from '../AvatarUpload';
import FormInput from '../FormInput';
import FormTextarea from '../FormTextarea';
import FormSelect from '../FormSelect';
import SectionHeader from '../SectionHeader';
import LocationAutocomplete from '../LocationAutocomplete';

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'Select size…' },
  { value: '1-10',     label: '1–10 employees' },
  { value: '11-50',    label: '11–50 employees' },
  { value: '51-200',   label: '51–200 employees' },
  { value: '201-1000', label: '201–1000 employees' },
  { value: '1000+',    label: '1000+ employees' },
];

export default function CompanySetupForm({ company, recruiter, logoSrc, photoSrc, onCompanyField, onRecruiterField, onLocationChange, onLogoUpload, onPhotoUpload }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="lg:border-r lg:border-blue-100/80 lg:pr-8">
        <SectionHeader title="Company Information" />
        <AvatarUpload layout="inline" shape="square" src={logoSrc} onUpload={onLogoUpload} label="Company Logo" buttonLabel="Upload Logo" hint="PNG, JPG up to 5 MB" />
        <div className="space-y-4">
          <FormInput label="Company Name *" value={company.companyName} onChange={onCompanyField('companyName')} placeholder="e.g. Acme Corp" />
          <FormInput label="Industry" value={company.industry} onChange={onCompanyField('industry')} placeholder="e.g. Software / Technology" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <LocationAutocomplete value={company.location} onChange={onLocationChange} />
          </div>
          <FormSelect label="Company Size" value={company.size} onChange={onCompanyField('size')} options={COMPANY_SIZE_OPTIONS} />
          <FormInput label="Founded Year" type="number" value={company.foundedYear} onChange={onCompanyField('foundedYear')} placeholder="e.g. 2010" />
          <FormInput label="Website" type="url" value={company.website} onChange={onCompanyField('website')} placeholder="https://example.com" />
          <FormTextarea label="Description" value={company.description} onChange={onCompanyField('description')} placeholder="Tell candidates about your company…" rows={4} />
        </div>
      </div>
      <div>
        <SectionHeader title="Recruiter Profile" />
        <AvatarUpload layout="inline" shape="circle" src={photoSrc} onUpload={onPhotoUpload} label="Photo" buttonLabel="Upload Photo" hint="PNG, JPG up to 5 MB" />
        <div className="space-y-4">
          <FormInput label="Job Title" value={recruiter.jobTitle} onChange={onRecruiterField('jobTitle')} placeholder="e.g. Head of Talent" />
          <FormInput label="Phone" type="tel" value={recruiter.phone} onChange={onRecruiterField('phone')} placeholder="+1 555 000 0000" />
          <FormInput label="LinkedIn URL" type="url" value={recruiter.linkedinUrl} onChange={onRecruiterField('linkedinUrl')} placeholder="https://linkedin.com/in/yourprofile" />
        </div>
      </div>
    </div>
  );
}
