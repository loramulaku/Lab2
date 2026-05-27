import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="page-container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <BrandLogo variant="footer" />
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Search roles, apply in one click, and track every step — for candidates and hiring teams.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-3">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/jobs" className="footer-link">Find jobs</Link></li>
            <li><Link to="/register" className="footer-link">Create account</Link></li>
            <li><Link to="/#how-it-works" className="footer-link">How it works</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-3">For teams</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register?role=recruiter" className="footer-link">Post a job</Link></li>
            <li><Link to="/login" className="footer-link">Recruiter sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-3">Legal</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="footer-link">Terms</Link></li>
            <li><Link to="/privacy" className="footer-link">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <p className="page-container pb-8 text-xs text-gray-500 border-t border-gray-800 pt-8">
        © {new Date().getFullYear()} HireFlow. All rights reserved.
      </p>
    </footer>
  );
}
