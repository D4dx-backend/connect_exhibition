import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaTimesCircle,
  FaUserShield,
  FaUser
} from 'react-icons/fa';
import { userAPI } from '../../services/apiServices';
import * as XLSX from 'xlsx';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getAll(filters);
        setUsers(response.data.data || []);
        setPagination({
          page: response.data.page || 1,
          pages: response.data.pages || 1,
          total: response.data.total || 0
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load users');
        setUsers([]);
        setPagination({ page: 1, pages: 1, total: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  const startIndex = useMemo(() => {
    if (pagination.total === 0) return 0;
    return (pagination.page - 1) * filters.limit + 1;
  }, [pagination.page, pagination.total, filters.limit]);

  const endIndex = useMemo(() => {
    if (pagination.total === 0) return 0;
    const raw = pagination.page * filters.limit;
    return raw > pagination.total ? pagination.total : raw;
  }, [pagination.page, pagination.total, filters.limit]);

  const handlePageChange = (nextPage) => {
    setFilters((prev) => ({ ...prev, page: nextPage }));
  };

  const fetchAllUsersForExport = async () => {
    const exportFilters = {
      search: filters.search,
      role: filters.role,
      status: filters.status,
      page: 1,
      limit: 200
    };

    const allUsers = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const response = await userAPI.getAll({ ...exportFilters, page: currentPage });
      const responseUsers = response.data.data || [];
      allUsers.push(...responseUsers);
      totalPages = response.data.pages || 1;
      currentPage += 1;
    } while (currentPage <= totalPages);

    return allUsers;
  };

  const exportToExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const allUsers = await fetchAllUsersForExport();
      if (allUsers.length === 0) {
        toast.warning('No users to export');
        return;
      }

      const exportData = allUsers.map((user) => ({
        Name: user.name || 'N/A',
        Phone: user.mobile || 'N/A',
        Place: user.place || 'N/A',
        Gender: user.gender === true ? 'Male' : user.gender === false ? 'Female' : 'N/A',
        Role: user.role || 'user',
        Status: user.isActive ? 'Active' : 'Inactive',
        Joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A',
        LastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : '—'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet['!cols'] = [
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 20 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      const filename = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600">Manage registered users and access levels</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={loading || exporting}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg font-semibold shadow-lg transition duration-200"
        >
          <FaDownload />
          <span>{exporting ? 'Exporting...' : 'Export to Excel'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search name, phone, place..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Gender</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || <FaUser />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaPhone className="text-gray-400" />
                        <span>{user.mobile || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span>{user.place || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.gender === true ? 'Male' : user.gender === false ? 'Female' : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <FaUserShield className="mr-2" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex}-{endIndex} of {pagination.total}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft />
                <span>Previous</span>
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
