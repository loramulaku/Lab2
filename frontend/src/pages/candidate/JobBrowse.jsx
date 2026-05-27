import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SiteLayout from '../../components/SiteLayout';
import JobBrowseHero from '../../components/browse/JobBrowseHero';
import JobBrowseToolbar from '../../components/browse/JobBrowseToolbar';
import JobListItem, { JobListItemSkeleton } from '../../components/browse/JobListItem';
import JobPreviewPanel from '../../components/browse/JobPreviewPanel';
import JobFilters, {
  JOB_TYPE_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
} from '../../components/JobFilters';
import JobBrowseEmpty from '../../components/JobBrowseEmpty';
import Pagination from '../../components/Pagination';
import jobService from '../../services/jobService';
import useDebounce from '../../hooks/useDebounce';
import useMediaQuery from '../../hooks/useMediaQuery';
import { isJobSaved, toggleSavedJob } from '../../utils/savedJobs';

const PAGE_SIZE = 12;
const FETCH_LIMIT = 100;

function applyClientFilters(jobs, { search, location, types, workModes, salaryRange }) {
  return jobs.filter((job) => {
    if (types.length > 0 && !types.includes(job.employmentType)) return false;

    if (workModes.length > 0) {
      const mode = (job.workMode ?? '').toLowerCase();
      const normalized = workModes.map((m) => m.toLowerCase());
      if (!normalized.includes(mode)) return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [
        job.title,
        job.description,
        job.company?.name,
        ...(job.skills ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (location.trim()) {
      const city = location.split(',')[0].trim().toLowerCase();
      const haystack = [
        job.company?.location,
        job.title,
        job.description,
        job.company?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(city)) return false;
    }

    const jobMin = job.budgetMin ?? 0;
    const jobMax = job.budgetMax ?? salaryRange[1];
    if (jobMax < salaryRange[0] || jobMin > salaryRange[1]) return false;

    return true;
  });
}

function sortJobs(jobs, sort, search) {
  const sorted = [...jobs];

  if (sort === 'salary') {
    return sorted.sort((a, b) => (b.budgetMax ?? 0) - (a.budgetMax ?? 0));
  }

  if (sort === 'date') {
    return sorted.sort(
      (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
    );
  }

  if (sort === 'relevance' && search.trim()) {
    const q = search.trim().toLowerCase();
    return sorted.sort((a, b) => {
      const score = (job) => {
        let s = 0;
        if (job.title?.toLowerCase().includes(q)) s += 3;
        if (job.company?.name?.toLowerCase().includes(q)) s += 2;
        if (job.skills?.some((sk) => sk.toLowerCase().includes(q))) s += 1;
        return s;
      };
      return score(b) - score(a);
    });
  }

  return sorted.sort(
    (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
  );
}

export default function JobBrowse({ defaultType = null }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWide = useMediaQuery('(min-width: 1280px)');

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [location, setLocation] = useState(() => searchParams.get('where') ?? '');
  const [selectedTypes, setSelectedTypes] = useState(() => {
    const typesParam = searchParams.getAll('type');
    return typesParam.length > 0 ? typesParam : (defaultType ? [defaultType] : []);
  });
  const [selectedWorkModes, setSelectedWorkModes] = useState(() =>
    searchParams.getAll('work')
  );
  const [salaryRange, setSalaryRange] = useState(() => {
    const min = parseInt(searchParams.get('minSalary'), 10);
    const max = parseInt(searchParams.get('maxSalary'), 10);
    return [
      isNaN(min) ? SALARY_MIN : min,
      isNaN(max) ? SALARY_MAX : max
    ];
  });
  const [sort, setSort] = useState(() => searchParams.get('sort') ?? 'relevance');
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get('page'), 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [savedRevision, setSavedRevision] = useState(0);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedLocation = useDebounce(location, 300);

  const singleType = selectedTypes.length === 1 ? selectedTypes[0] : undefined;
  const singleWorkMode = selectedWorkModes.length === 1 ? selectedWorkModes[0] : undefined;

  const { data: jobsData, isLoading: loading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['jobs', 'browse', debouncedSearch, debouncedLocation, singleType, singleWorkMode],
    queryFn: async () => {
      const result = await jobService.getJobs({
        status: 'open',
        search: debouncedSearch || undefined,
        location: debouncedLocation || undefined,
        type: singleType,
        employmentType: singleType,
        workMode: singleWorkMode,
        page: 1,
        limit: FETCH_LIMIT,
      });
      return result.data ?? [];
    },
  });

  const jobs = jobsData ?? [];
  const error = isError ? 'Unable to load jobs. Please try again.' : '';

  useEffect(() => {
    if (defaultType) {
      setSelectedTypes([defaultType]);
      setPage(1);
    }
  }, [defaultType]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedLocation, selectedTypes, selectedWorkModes, salaryRange, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    if (debouncedLocation.trim()) params.set('where', debouncedLocation.trim());
    selectedWorkModes.forEach((mode) => params.append('work', mode));
    selectedTypes.forEach((type) => params.append('type', type));
    
    if (salaryRange[0] > SALARY_MIN) params.set('minSalary', salaryRange[0].toString());
    if (salaryRange[1] < SALARY_MAX) params.set('maxSalary', salaryRange[1].toString());
    
    if (sort !== 'relevance') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch, debouncedLocation, selectedWorkModes, selectedTypes, salaryRange, sort, page, searchParams, setSearchParams]);

  const filteredJobs = useMemo(
    () =>
      sortJobs(
        applyClientFilters(jobs, {
          search: debouncedSearch,
          location: debouncedLocation,
          types: selectedTypes,
          workModes: selectedWorkModes,
          salaryRange,
        }),
        sort,
        debouncedSearch
      ),
    [jobs, debouncedSearch, debouncedLocation, selectedTypes, selectedWorkModes, salaryRange, sort]
  );

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = filteredJobs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const selectedJob = paginatedJobs.find((j) => j.id === selectedJobId) ?? null;

  useEffect(() => {
    if (!isWide) {
      setSelectedJobId(null);
      return;
    }
    if (paginatedJobs.length === 0) {
      setSelectedJobId(null);
      return;
    }
    const stillVisible = paginatedJobs.some((j) => j.id === selectedJobId);
    if (!stillVisible) {
      setSelectedJobId(paginatedJobs[0].id);
    }
  }, [paginatedJobs, isWide, selectedJobId]);

  const hasActiveFilters =
    debouncedSearch ||
    debouncedLocation ||
    selectedTypes.length > (defaultType ? 1 : 0) ||
    selectedWorkModes.length > 0 ||
    salaryRange[0] > SALARY_MIN ||
    salaryRange[1] < SALARY_MAX;

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setSelectedTypes(defaultType ? [defaultType] : []);
    setSelectedWorkModes([]);
    setSalaryRange([SALARY_MIN, SALARY_MAX]);
    setSort('relevance');
    setPage(1);
  };

  const handleSelectJob = (job) => {
    if (!isWide) {
      navigate(`/jobs/${job.id}`);
      return;
    }
    setSelectedJobId(job.id);
  };

  const handleSaveJob = (jobId) => {
    toggleSavedJob(jobId);
    setSavedRevision((n) => n + 1);
  };

  return (
    <SiteLayout bare showFooter>
      <JobBrowseHero
        search={search}
        location={location}
        onSearchChange={setSearch}
        onLocationChange={setLocation}
        selectedWorkModes={selectedWorkModes}
        onWorkModesChange={setSelectedWorkModes}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        defaultType={defaultType}
        resultCount={loading ? 0 : filteredJobs.length}
        loading={loading}
      />

      <div className="page-container pb-16">
        <JobBrowseToolbar
          salaryRange={salaryRange}
          onSalaryChange={setSalaryRange}
          sort={sort}
          onSortChange={setSort}
          onOpenFilters={() => setMobileFiltersOpen((o) => !o)}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          mobileFiltersOpen={mobileFiltersOpen}
        />

        {mobileFiltersOpen && (
          <div className="lg:hidden mb-6 animate-slide-up">
            <JobFilters
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              selectedWorkModes={selectedWorkModes}
              onWorkModesChange={setSelectedWorkModes}
              salaryRange={salaryRange}
              onSalaryChange={setSalaryRange}
              onClear={handleClearFilters}
              hideTypeFilter={Boolean(defaultType)}
              className="!static"
            />
          </div>
        )}

        {error && (
          <div className="surface border-red-200 bg-red-50 px-4 py-3 mb-6 animate-fade-in">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 pt-4">
            <div className="xl:col-span-2 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobListItemSkeleton key={i} />
              ))}
            </div>
            <div className="hidden xl:block xl:col-span-3">
              <div className="browse-preview-empty animate-pulse h-96" />
            </div>
          </div>
        ) : paginatedJobs.length === 0 ? (
          <div className="pt-6">
            <JobBrowseEmpty
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 pt-4">
            <div className="xl:col-span-2 space-y-2.5">
              <p className="text-xs text-gray-500 mb-3 xl:hidden">
                Tap a role to view details
              </p>
              {paginatedJobs.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  selected={selectedJobId === job.id}
                  onSelect={handleSelectJob}
                  searchQuery={debouncedSearch}
                />
              ))}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>

            <div className="hidden xl:block xl:col-span-3">
              <JobPreviewPanel
                job={selectedJob}
                onSave={handleSaveJob}
                saved={selectedJob ? isJobSaved(selectedJob.id) : false}
                key={`${selectedJob?.id ?? 'empty'}-${savedRevision}`}
              />
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
