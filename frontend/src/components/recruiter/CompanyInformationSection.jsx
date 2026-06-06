import AvatarUpload from '../AvatarUpload';
import FormInput from '../FormInput';
import FormTextarea from '../FormTextarea';
import FormSelect from '../FormSelect';
import SectionHeader from '../SectionHeader';
import LocationAutocomplete from '../LocationAutocomplete';
import { COMPANY_SIZE_OPTIONS } from '../../constants/companySetup';

export default function CompanyInformationSection({ company, logoSrc, onFieldChange, onLocationChange, onLogoUpload }) {
  return (
    <div className="lg:border-r lg:border-blue-100/80 lg:pr-8">
      <SectionHeader title="Company Information" />

      <AvatarUpload
        layout="inline"
        shape="square"
        src={logoSrc}
        onUpload={onLogoUpload}
        label="Company Logo"
        buttonLabel="Upload Logo"
        hint="PNG, JPG up to 5 MB"
      />

      <div className="space-y-4">
        <FormInput label="Company Name *" value={company.companyName} onChange={onFieldChange('companyName')} placeholder="e.g. Acme Corp" />
        <FormInput label="Industry" value={company.industry} onChange={onFieldChange('industry')} placeholder="e.g. Software / Technology" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <LocationAutocomplete value={company.location} onChange={onLocationChange} />
        </div>
        <FormSelect label="Company Size" value={company.size} onChange={onFieldChange('size')} options={COMPANY_SIZE_OPTIONS} />
        <FormInput label="Founded Year" type="number" value={company.foundedYear} onChange={onFieldChange('foundedYear')} placeholder="e.g. 2010" />
        <FormInput label="Website" type="url" value={company.website} onChange={onFieldChange('website')} placeholder="https://example.com" />
        <FormTextarea label="Description" value={company.description} onChange={onFieldChange('description')} placeholder="Tell candidates about your company…" rows={4} />
      </div>
    </div>
  );
}
