import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { PageShell, PageCard } from '../components/layout';
import BidModal from '../components/freelance/BidModal';
import FreelanceModeGate from '../components/freelance/FreelanceModeGate';
import ApplicationForm from '../components/jobs/ApplicationForm';
import { JobsSearchHero, JobsFilterSidebar, JobsCategorySidebar, JobListingCard } from '../components/jobs/JobsBoard';
import { SORT_OPTIONS } from '../constants/jobsBoard';
import { useAuth } from '../context/AuthContext';
import freelanceService from '../services/freelanceService';
import candidateService from '../services/candidateService';

export default function Jobs() {
  const { filter: urlFilter } = useParams();
  const { user } = useAuth();
  const isCandidate = (user?.roles ?? []).includes('candidate');

  const [qInput, setQInput]               = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [activeQ, setActiveQ]             = useState('');
  const [activeLoc, setActiveLoc]         = useState('');
  const [jobType, setJobType]             = useState('');
  const [workMode, setWorkMode]           = useState('');
  const [expLevel, setExpLevel]           = useState('');
  const [minSalary, setMinSalary]         = useState('');
  const [maxSalary, setMaxSalary]         = useState('');
  const [category, setCategory]           = useState('');
  const [sort, setSort]                   = useState('relevance');
  const [categories, setCategories]       = useState([]);
  const [jobs, setJobs]                   = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [bidJob, setBidJob]               = useState(null);
  const [applyJob, setApplyJob]           = useState(null);
  const [feedback, setFeedback]           = useState({});
  const [savedIds, setSavedIds]           = useState(new Set());
  const [appliedMap, setAppliedMap]       = useState({});  // { jobId: status }
  const [bidJobIds, setBidJobIds]         = useState(new Set());
  const [freelanceActive, setFreelanceActive] = useState(null);
  const [gateJob, setGateJob]             = useState(null);

  useEffect(() => {
    if (!urlFilter) return;
    if (urlFilter === 'freelance') setJobType('freelance');
    else if (['full-time', 'part-time', 'internship'].includes(urlFilter)) setJobType(urlFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'open', limit: 50, sort };
      if (jobType === 'freelance') params.workMode = 'freelance';
      else if (jobType) params.employmentType = jobType;
      if (workMode && jobType !== 'freelance') params.workMode = workMode;
      if (expLevel) params.experienceLevel = expLevel;
      if (minSalary) params.minSalary = minSalary;
      if (maxSalary) params.maxSalary = maxSalary;
      if (category) params.category = category;
      if (activeQ) params.q = activeQ;
      if (activeLoc) params.location = activeLoc;

      const res = await freelanceService.listJobs(params);
      setJobs(res.data ?? []);
      setTotal(res.total ?? (res.data ?? []).length);
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [jobType, workMode, expLevel, minSalary, maxSalary, category, sort, activeQ, activeLoc]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isCandidate) return;
    candidateService.getSavedJobIds().then(ids => setSavedIds(new Set(ids))).catch(() => {});
    candidateService.getProfile().then(p => setFreelanceActive(!!p.freelanceActive)).catch(() => {});
    candidateService.myApplications({ limit: 200 })
      .then(r => {
        const map = {};
        (r.data ?? []).forEach(a => { map[a.jobId] = a.status; });
        setAppliedMap(map);
      }).catch(() => {});
    freelanceService.myBids({ limit: 200 })
      .then(r => setBidJobIds(new Set((r.data ?? []).filter(b => b.status !== 'withdrawn').map(b => b.jobId))))
      .catch(() => {});
  }, [isCandidate]);

  const handleSearch = () => {
    setActiveQ(qInput.trim());
    setActiveLoc(locationInput.trim());
  };

  const handleToggle = (field, value) => {
    const setters = {
      jobType: setJobType,
      workMode: setWorkMode,
      expLevel: setExpLevel,
    };
    const states = { jobType, workMode, expLevel };
    setters[field](states[field] === value ? '' : value);
  };

  const clearAll = () => {
    setJobType('');
    setWorkMode('');
    setExpLevel('');
    setMinSalary('');
    setMaxSalary('');
    setCategory('');
    setSort('relevance');
    setActiveQ('');
    setActiveLoc('');
    setQInput('');
    setLocationInput('');
  };

  const handleToggleSave = async (jobId) => {
    if (!isCandidate) return;
    if (savedIds.has(jobId)) {
      await candidateService.unsaveJob(jobId).catch(() => {});
      setSavedIds(s => { const n = new Set(s); n.delete(jobId); return n; });
    } else {
      await candidateService.saveJob(jobId).catch(() => {});
      setSavedIds(s => new Set([...s, jobId]));
    }
  };

  const handleBidClick = (job) => {
    if (!freelanceActive) { setGateJob(job); return; }
    setBidJob(job);
  };

  const handleApplySubmit = async (data) => {
    const res = await candidateService.applyToJob(applyJob.id, data);
    const jobId = applyJob.id;
    setAppliedMap(m => ({ ...m, [jobId]: 'pending' }));
    setApplyJob(null);
    setFeedback((f) => ({ ...f, [jobId]: { ok: true, msg: res?.message || 'Applied ✓' } }));
  };

  const submitBid = async (data) => {
    await freelanceService.submitBid(bidJob.id, data);
    const jobId = bidJob.id;
    setBidJobIds(s => new Set([...s, jobId]));
    setFeedback((f) => ({ ...f, [jobId]: { ok: true, msg: 'Bid submitted ✓' } }));
    setBidJob(null);
  };

  const hasFilter = jobType || workMode || expLevel || minSalary || maxSalary || category || activeQ || activeLoc;

  return (
    <PageShell flush>
      <JobsSearchHero
        total={total}
        loading={loading}
        qInput={qInput}
        locationInput={locationInput}
        onQChange={setQInput}
        onLocationChange={setLocationInput}
        onClearQ={() => { setQInput(''); setActiveQ(''); }}
        onClearLocation={() => { setLocationInput(''); setActiveLoc(''); }}
        onSearch={handleSearch}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6 items-start">
        <JobsFilterSidebar
          hasFilter={hasFilter}
          jobType={jobType}
          workMode={workMode}
          expLevel={expLevel}
          minSalary={minSalary}
          maxSalary={maxSalary}
          onToggle={handleToggle}
          onClearAll={clearAll}
          onMinSalaryChange={setMinSalary}
          onMaxSalaryChange={setMaxSalary}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{loading ? '…' : total}</span> job{total !== 1 ? 's' : ''} found
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="page-shell-field text-sm px-3 py-1.5 text-gray-600 focus:outline-none bg-white/70 rounded-md"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <PageCard key={i} className="p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200/80 rounded-lg flex-shrink-0"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200/80 w-1/2 rounded"/>
                      <div className="h-3 bg-gray-100 w-1/3 rounded"/>
                      <div className="h-3 bg-gray-100 w-2/3 rounded"/>
                    </div>
                  </div>
                </PageCard>
              ))}
            </div>
          )}

          {!loading && jobs.length === 0 && (
            <PageCard className="text-center py-16">
              <p className="text-gray-500 text-lg font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different filter or search term.</p>
              {hasFilter && (
                <button onClick={clearAll} className="mt-4 text-sm text-blue-600 hover:underline">Clear all filters</button>
              )}
            </PageCard>
          )}

          <div className="space-y-3">
            {jobs.map((job) => (
              <JobListingCard
                key={job.id}
                job={job}
                user={user}
                isCandidate={isCandidate}
                feedback={feedback[job.id]}
                appliedStatus={appliedMap[job.id]}
                hasBid={bidJobIds.has(job.id)}
                onApply={setApplyJob}
                onBid={handleBidClick}
                isSaved={savedIds.has(job.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </div>

        <JobsCategorySidebar
          categories={categories}
          activeCategory={category}
          onSelect={setCategory}
        />
      </div>

      {bidJob   && <BidModal job={bidJob} onSubmit={submitBid} onClose={() => setBidJob(null)} />}
      {applyJob && <ApplicationForm job={applyJob} onSubmit={handleApplySubmit} onClose={() => setApplyJob(null)} />}
      {gateJob  && (
        <FreelanceModeGate
          onActivate={async () => {
            await candidateService.setFreelanceMode(true);
            setFreelanceActive(true);
            setGateJob(null);
            setBidJob(gateJob);
          }}
          onCancel={() => setGateJob(null)}
        />
      )}
    </PageShell>
  );
}
