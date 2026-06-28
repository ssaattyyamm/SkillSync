import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StudentCard from '../components/common/StudentCard';
import './DiscoverPage.css';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'Other'];

export default function DiscoverPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '', skills: '', branch: '', year: '', sortBy: 'cpScore', page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStudents = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) params.append(k, v); });
      const { data } = await api.get(`/discover?${params}`);
      setStudents(data.users);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(filters); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents({ ...filters, page: 1 });
  };

  const handleFilterChange = (key, val) => {
    const updated = { ...filters, [key]: val, page: 1 };
    setFilters(updated);
    fetchStudents(updated);
  };

  const handlePageChange = (page) => {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchStudents(updated);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Discover Students</h1>
        <p className="page-subtitle">Find coders, developers & collaborators in your college</p>
      </div>

      {}
      <form onSubmit={handleSearch} className="search-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="form-input" style={{ paddingLeft: 42 }}
            placeholder="Search by name or skill..."
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-secondary" onClick={() => setShowFilters(s => !s)}>
          <SlidersHorizontal size={16} /> Filters
        </button>
      </form>

      {}
      {showFilters && (
        <div className="filters-panel card">
          <div className="filters-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Skills</label>
              <input value={filters.skills} onChange={e => handleFilterChange('skills', e.target.value)}
                className="form-input" placeholder="React, Python, DSA..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Branch</label>
              <select value={filters.branch} onChange={e => handleFilterChange('branch', e.target.value)}
                className="form-input form-select">
                <option value="">All Branches</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year</label>
              <select value={filters.year} onChange={e => handleFilterChange('year', e.target.value)}
                className="form-input form-select">
                <option value="">All Years</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort by</label>
              <select value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)}
                className="form-input form-select">
                <option value="cpScore">CP Score</option>
                <option value="devScore">Dev Score</option>
                <option value="name">Name</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            const reset = { search: '', skills: '', branch: '', year: '', sortBy: 'cpScore', page: 1 };
            setFilters(reset);
            fetchStudents(reset);
          }}>Clear filters</button>
        </div>
      )}

      {}
      <div className="results-header">
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {loading ? 'Loading...' : `${pagination.total || 0} students found`}
        </span>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <h3>No students found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="students-grid">
          {students.map(student => <StudentCard key={student._id} student={student} />)}
        </div>
      )}

      {}
      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => handlePageChange(page)}
              className={`btn btn-sm ${page === filters.page ? 'btn-primary' : 'btn-secondary'}`}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
