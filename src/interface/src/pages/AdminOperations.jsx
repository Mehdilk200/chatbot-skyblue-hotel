import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import apiService from '../services/apiService';
import { useCurrentUser, getUserDisplayName, getUserInitials, getUserRole } from '../hooks/useCurrentUser';

// Build a 22-day window starting from today - 7 days
const buildDateWindow = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 7);
  const days = [];
  for (let i = 0; i < 22; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return { days, todayIdx: 7 };
};

const { days: DATE_WINDOW, todayIdx: TODAY_IDX } = buildDateWindow();
const DAYS = DATE_WINDOW.length;

// Format a date as dd/MM label
const fmtDay = (d) => String(d.getDate()).padStart(2, '0');

// Convert ISO date string to offset index within our 22-day window
const dateToIdx = (isoStr) => {
  if (!isoStr) return -1;
  const d = new Date(isoStr);
  const start = DATE_WINDOW[0];
  const diffMs = d - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function AdminOperations() {
  const user = useCurrentUser();
  const [roomsData, setRoomsData] = useState({ standard: [], deluxe: [], suite: [] });
  const [expandedGroups, setExpandedGroups] = useState({ standard: true, deluxe: true, suite: true });

  const fetchData = useCallback(async () => {
    try {
      const [rooms, reservations, categories] = await Promise.all([
        apiService.getRooms(),
        apiService.getReservations(),
        apiService.getCategories()
      ]);

      if (!Array.isArray(categories)) {
        console.error("Categories is not an array:", categories);
        return;
      }

      const catMap = {};
      categories.forEach(c => {
        const cid = c.id || c._id;
        if (cid) catMap[cid] = c.name.toLowerCase();
      });

      const roomReservations = {};
      if (Array.isArray(reservations)) {
        reservations.forEach(r => {
          const rid = r.room_id;
          if (rid) {
            if (!roomReservations[rid]) roomReservations[rid] = [];
            roomReservations[rid].push(r);
          }
        });
      }

      const buildRoomList = (categoryKeyword, typeClass) => {
        const catRooms = rooms.filter(r => {
          const cname = catMap[r.category_id] || '';
          return cname.includes(categoryKeyword);
        });

        const outList = [];
        catRooms.forEach(room => {
          const rid = room.id || room._id;
          const resForRoom = roomReservations[rid] || [];
          if (resForRoom.length === 0) {
            outList.push({ id: rid, label: room.number, guest: '', start: -1, end: -1, type: typeClass });
          } else {
            resForRoom.forEach(r => {
              // Use real check_in / check_out dates instead of Math.random()
              const startIdx = dateToIdx(r.check_in || r.checkin || r.start_date);
              const endIdx   = dateToIdx(r.check_out || r.checkout || r.end_date);
              outList.push({
                id: (r.id || r._id) + '_' + rid,
                label: room.number,
                guest: r.guest_name || `Guests: ${r.guests || '?'}`,
                start: startIdx,
                end: endIdx >= 0 ? endIdx : startIdx + 1,
                type: typeClass
              });
            });
          }
        });
        return outList;
      };

      setRoomsData({
        standard: buildRoomList('standard', 'standard'),
        deluxe: buildRoomList('deluxe', 'deluxe'),
        suite: buildRoomList('suite', 'suite')
      });
    } catch (error) {
      console.error("Error loading gantt data", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Real month label from the current date window
  const monthLabel = DATE_WINDOW[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  const renderDateHeader = () => (
    <div className="date-header-row">
      <div className="date-header-label">ALL ROOMS</div>
      <div className="date-cells">
        {DATE_WINDOW.map((d, i) => (
          <div key={i} className={`date-cell ${i === TODAY_IDX ? 'today' : ''}`}>
            {fmtDay(d)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderGroup = (groupKey, title, iconBg, count) => {
    const list = roomsData[groupKey];
    const expanded = expandedGroups[groupKey];

    return (
      <div className="gantt-group" key={groupKey}>
        <div className="gantt-group-header">
          <div className="gg-meta">
            <div className="gg-icon" style={iconBg ? {background: iconBg} : {}}><i className="fas fa-calendar-alt"></i></div>
            <span className="gg-title">{title}</span>
            <div className="gg-collapse" onClick={() => toggleGroup(groupKey)} style={{cursor:'pointer'}}>
              <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
            </div>
          </div>
          <div className="gg-header-dates">
            <span className="gg-month-label">{monthLabel}</span>
            <div className="booked-badge">{count} Booked</div>
          </div>
        </div>

        {expanded && renderDateHeader()}

        {expanded && (
          <div className="gantt-body">
            {list.map((item, idx) => (
              <div className="gantt-row" key={item.id || idx}>
                <div className="room-label">{item.label}</div>
                <div className="gantt-timeline" style={{position: 'relative'}}>
                  <div className="today-line" style={{left: `${(TODAY_IDX / DAYS) * 100}%`}}>
                    <div className="today-dot"></div>
                  </div>
                  {item.start >= 0 && item.start < DAYS && (
                    <div
                      className={`booking-bar ${item.type}`}
                      style={{
                        left: `${(Math.max(0, item.start) / DAYS) * 100}%`,
                        width: `${((Math.min(DAYS, item.end) - Math.max(0, item.start)) / DAYS) * 100}%`
                      }}
                    >
                      {item.guest}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {list.length === 0 && <div style={{padding: '10px 20px', color: '#888'}}>No rooms found for this category.</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-container" style={{display: 'flex'}}>
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)'}}>Room Operations</h1>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Monitor room occupancy and bookings in real-time</p>
          </div>
          <div className="header-right">
            <div className="user-profile" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.9rem', fontWeight: 600}}>{getUserDisplayName(user)}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{getUserRole(user)}</div>
              </div>
              <div className="user-avatar" style={{width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>{getUserInitials(user)}</div>
            </div>
          </div>
        </header>

        <div className="gantt-wrapper" id="ganttWrapper" style={{marginTop: 0, background: 'white', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)'}}>
          <div className="tab-group" style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
            <div className="tab active">All Rooms <span className="tab-count">{roomsData.standard.length + roomsData.deluxe.length + roomsData.suite.length}</span></div>
            <div className="tab">Check in <span className="tab-count">{[...roomsData.standard, ...roomsData.deluxe, ...roomsData.suite].filter(r => r.start >= 0 && r.start <= TODAY_IDX && r.end > TODAY_IDX).length}</span></div>
            <div className="tab">Checkout <span className="tab-count">{[...roomsData.standard, ...roomsData.deluxe, ...roomsData.suite].filter(r => r.end === TODAY_IDX).length}</span></div>
          </div>
          {renderGroup('standard', 'STANDARD ROOMS', null, roomsData.standard.filter(r => r.start >= 0).length)}
          {renderGroup('deluxe', 'DELUXE ROOMS', 'linear-gradient(135deg,#2ECC71,#1a9955)', roomsData.deluxe.filter(r => r.start >= 0).length)}
          {renderGroup('suite', 'SUITE ROOMS', 'linear-gradient(135deg,#FF9F1C,#e07000)', roomsData.suite.filter(r => r.start >= 0).length)}
        </div>
      </div>
    </div>
  );
}
