const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const btnBase =
    'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 text-sm font-medium rounded-lg border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-10" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
          >
            1
          </button>
          {startPage > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnBase} ${
            page === currentPage
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
