import { Link } from 'react-router-dom';
import SiteLayout from '../../components/SiteLayout';

export default function LegalPage({ title, children }) {
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto animate-slide-up">
        <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 font-medium mb-6 inline-flex items-center gap-1 transition-colors">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <div className="prose prose-gray max-w-none space-y-4 text-gray-700 leading-relaxed">
          {children}
        </div>
      </article>
    </SiteLayout>
  );
}
