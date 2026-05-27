import SiteLayout from './SiteLayout';
import JobTypeNav from './JobTypeNav';

/** @deprecated Use SiteLayout directly */
export default function PublicLayout({
  children,
  showJobNav = false,
  showFooter = true,
}) {
  return (
    <SiteLayout bare showFooter={showFooter}>
      {showJobNav && <JobTypeNav />}
      {children}
      {/* SiteLayout handles footer; duplicate guard not needed */}
    </SiteLayout>
  );
}
