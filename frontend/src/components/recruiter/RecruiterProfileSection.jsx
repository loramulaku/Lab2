import AvatarUpload from '../AvatarUpload';
import FormInput from '../FormInput';
import SectionHeader from '../SectionHeader';

export default function RecruiterProfileSection({ recruiter, onFieldChange, onPhotoUpload }) {
  return (
    <div>
      <SectionHeader title="Recruiter Profile" />

      <AvatarUpload
        layout="inline"
        shape="circle"
        src={null}
        onUpload={onPhotoUpload}
        label="Photo"
        buttonLabel="Upload Photo"
        hint="PNG, JPG up to 5 MB"
      />

      <div className="space-y-4">
        <FormInput label="Job Title" value={recruiter.jobTitle} onChange={onFieldChange('jobTitle')} placeholder="e.g. Head of Talent" />
        <FormInput label="Phone" type="tel" value={recruiter.phone} onChange={onFieldChange('phone')} placeholder="+1 555 000 0000" />
        <FormInput label="LinkedIn URL" type="url" value={recruiter.linkedinUrl} onChange={onFieldChange('linkedinUrl')} placeholder="https://linkedin.com/in/yourprofile" />
      </div>
    </div>
  );
}
