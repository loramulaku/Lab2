import { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import recruiterService from '../../services/recruiterService';
import { useAuth } from '../../context/AuthContext';

/**
 * Team Members — recruiters belonging to the company.
 * The backend currently models one recruiter profile per user (1:1), and team
 * administration is centralised under the Admin → Users panel, so this view
 * surfaces the signed-in recruiter and links out for full management.
 */
export default function TeamMembers() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const p = await recruiterService.getProfile(); setCompany(p?.company ?? null); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <RecruiterLayout title="Team Members">
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <div className="space-y-4 max-w-2xl">
          <div className="page-shell-card rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-2">Company</p>
            <p className="font-medium text-gray-900">{company?.name ?? 'Your company'}</p>
          </div>
          <div className="page-shell-card rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-5 py-3 text-gray-900">{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'You'}</td>
                  <td className="px-5 py-3 text-gray-700">{user?.email}</td>
                  <td className="px-5 py-3 text-gray-700">Recruiter (owner)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            Adding or removing team members is handled by an administrator from the Admin → Users panel.
          </p>
        </div>
      )}
    </RecruiterLayout>
  );
}
