import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import './EventAttendeesList.css';

export default function EventAttendeesList({ eventId, token }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending

  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  async function loadAttendees() {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/api/events/${eventId}/attendees`, { token });
      setAttendees(res?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendees');
    } finally {
      setLoading(false);
    }
  }

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'refunded': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="eal-container">
      <div className="eal-header">
        <div className="eal-title-row">
          <h2 className="eal-title">Event Attendees</h2>
          <span className="eal-count">{filteredAttendees.length} / {attendees.length}</span>
        </div>
        
        <div className="eal-controls">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="eal-search"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="eal-filter"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          <button onClick={loadAttendees} className="eal-refresh-btn" disabled={loading}>
            {loading ? '⟳ Loading...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="eal-error">{error}</div>}

      {loading && attendees.length === 0 ? (
        <div className="eal-loading">Loading attendees...</div>
      ) : filteredAttendees.length === 0 ? (
        <div className="eal-empty">
          <p>No attendees found</p>
        </div>
      ) : (
        <div className="eal-table-wrapper">
          <table className="eal-table">
            <thead>
              <tr>
                <th className="eal-th eal-th--name">Name</th>
                <th className="eal-th eal-th--age">Age</th>
                <th className="eal-th eal-th--ticket">Ticket Type</th>
                <th className="eal-th eal-th--status">Payment Status</th>
                <th className="eal-th eal-th--amount">Amount</th>
                <th className="eal-th eal-th--date">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee, idx) => (
                <tr key={attendee.id || idx} className="eal-tr">
                  <td className="eal-td eal-td--name">
                    <div className="eal-user-cell">
                      {attendee.avatar ? (
                        <img src={attendee.avatar} alt={attendee.name} className="eal-avatar" />
                      ) : (
                        <div className="eal-avatar eal-avatar--fallback">
                          {attendee.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <span>{attendee.name}</span>
                    </div>
                  </td>
                  <td className="eal-td">{attendee.age || '-'}</td>
                  <td className="eal-td">{attendee.ticketType || '-'}</td>
                  <td className="eal-td">
                    <span
                      className="eal-status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(attendee.paymentStatus)}22`,
                        color: getStatusColor(attendee.paymentStatus),
                        borderColor: getStatusColor(attendee.paymentStatus)
                      }}
                    >
                      {attendee.paymentStatus ? 
                        attendee.paymentStatus.charAt(0).toUpperCase() + attendee.paymentStatus.slice(1) 
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="eal-td eal-td--amount">${attendee.amount || '0.00'}</td>
                  <td className="eal-td eal-td--date">{formatDate(attendee.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
