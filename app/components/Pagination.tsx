interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const Pagination = ({ page, totalPages, setPage }: PaginationProps) => {
  return (
    <div className="flex space-x-2 mt-4">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded">Prev</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded">Next</button>
    </div>
  );
};

export default Pagination;
