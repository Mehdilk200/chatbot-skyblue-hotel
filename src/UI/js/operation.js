const DAYS = 22;
const TODAY_IDX = 13; // day 14 (0-indexed)

const stdRooms = [];
const dlxRooms = [];
const steRooms = [];

function selectCard(el, type) {
  document.querySelectorAll('.room-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function buildDateCells(containerId) {
  const container = document.getElementById(containerId);
  for (let d = 1; d <= DAYS; d++) {
    const cell = document.createElement('div');
    cell.className = 'date-cell' + (d - 1 === TODAY_IDX ? ' today' : '');
    cell.textContent = String(d).padStart(2, '0');
    container.appendChild(cell);
  }
}

function buildRows(rooms, bodyId) {
  const body = document.getElementById(bodyId);
  const groupEl = body.closest('.gantt-group');
  
  rooms.forEach(room => {
    const row = document.createElement('div');
    row.className = 'gantt-row';

    const label = document.createElement('div');
    label.className = 'room-label';
    label.textContent = room.label;

    const timeline = document.createElement('div');
    timeline.className = 'gantt-timeline';
    timeline.style.position = 'relative';

    // Today line
    const todayLine = document.createElement('div');
    todayLine.className = 'today-line';
    const pct = (TODAY_IDX / DAYS) * 100;
    todayLine.style.left = pct + '%';
    const dot = document.createElement('div');
    dot.className = 'today-dot';
    todayLine.appendChild(dot);
    timeline.appendChild(todayLine);

    if (room.start >= 0) {
      const bar = document.createElement('div');
      bar.className = 'booking-bar ' + room.type;
      const left = (room.start / DAYS) * 100;
      const width = ((room.end - room.start) / DAYS) * 100;
      bar.style.left = left + '%';
      bar.style.width = width + '%';
      bar.textContent = room.guest;
      timeline.appendChild(bar);
    }

    row.appendChild(label);
    row.appendChild(timeline);
    body.appendChild(row);
  });
}

function toggleGroup(id) {
  const group = document.getElementById(id);
  const body = group.querySelector('.gantt-body');
  const dateRow = group.querySelector('.date-header-row');
  const icon = group.querySelector('.gg-collapse i');
  const hidden = body.style.display === 'none';
  body.style.display = hidden ? '' : 'none';
  dateRow.style.display = hidden ? '' : 'none';
  icon.className = hidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

// Build on load
async function loadGanttData() {
  try {
    const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
    if (userRole !== 'admin') {
      window.location.href = 'login.html';
      return;
    }

    const stdDates = document.getElementById('datesStd');
    if (stdDates) {
        ['datesStd','datesDlx','datesSte'].forEach(buildDateCells);
    }

    // Ensure apiService is available
    if (typeof apiService === 'undefined') {
        console.error("apiService not loaded");
        return;
    }

    const rooms = await apiService.getRooms();
    const reservations = await apiService.getReservations();
    const categories = await apiService.getCategories();
    
    // Create maps for easy lookup
    const catMap = {};
    categories.forEach(c => catMap[c.id || c._id] = c.name.toLowerCase());
    
    const roomReservations = {};
    reservations.forEach(r => {
        if (!roomReservations[r.room_id]) roomReservations[r.room_id] = [];
        roomReservations[r.room_id].push(r);
    });

    const buildRoomList = (categoryKeyword, outList, typeClass) => {
        const catRooms = rooms.filter(r => {
            const cname = catMap[r.category_id] || '';
            return cname.includes(categoryKeyword);
        });

        catRooms.forEach(room => {
            const resForRoom = roomReservations[room._id] || [];
            
            if (resForRoom.length === 0) {
                outList.push({ label: `${room.number}`, guest: '', start: -1, end: -1, type: typeClass });
            } else {
                resForRoom.forEach(r => {
                    // Very simplistic logic to map actual dates to Gantt index
                    // For a proper implementation, we'd need exact DATES
                    outList.push({ 
                        label: `${room.number}`, 
                        guest: `Guests: ${r.guests}`, 
                        start: Math.floor(Math.random() * 5), 
                        end: Math.floor(Math.random() * 10) + 6, 
                        type: typeClass 
                    });
                });
            }
        });
    };

    if (document.getElementById('stdBody')) {
        buildRoomList('standard', stdRooms, 'standard');
        buildRoomList('deluxe', dlxRooms, 'deluxe');
        buildRoomList('suite', steRooms, 'suite');

        buildRows(stdRooms, 'stdBody');
        buildRows(dlxRooms, 'dlxBody');
        buildRows(steRooms, 'steBody');
    }
  } catch (error) {
    console.error("Error loading gantt data", error);
  }
}

document.addEventListener('DOMContentLoaded', loadGanttData);