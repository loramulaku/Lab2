import { Link, useLocation } from 'react-router-dom';
import { JOB_TYPE_LINKS } from '../constants/navigation';

export default function JobTypeNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="border-b border-gray-200 bg-white sticky top-16 z-30"
      aria-label="Job categories"
    >
      <div className="page-container flex gap-0 overflow-x-auto">
        {JOB_TYPE_LINKS.map(({ label, href }) => {
          const active =
            href === '/jobs'
              ? pathname === '/jobs'
              : pathname === href;

          return (
            <Link
              key={href}
              to={href}
              className={active ? 'tab-link-active whitespace-nowrap' : 'tab-link whitespace-nowrap'}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
