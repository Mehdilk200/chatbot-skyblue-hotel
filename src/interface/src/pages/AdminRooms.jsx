import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import apiService from '../services/apiService';
import { useCurrentUser, getUserDisplayName, getUserInitials, getUserRole } from '../hooks/useCurrentUser';

export default function AdminRooms() {
  const user = useCurrentUser();
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    number: '', floor: '', category: '', status: 'available', price: '', description: '', characteristics: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [roomData, catData, floorData] = await Promise.all([
        apiService.getRooms(),
        apiService.getCategories(),
        apiService.getFloors()
      ]);
      setRooms(roomData);
      setCategories(catData);
      setFloors(floorData);
    } catch(e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const chars = formData.characteristics ? formData.characteristics.split(',').map(s => s.trim()) : [];
    
    const roomData = {
      number: formData.number,
      floor_id: formData.floor,
      category_id: formData.category,
      status: formData.status,
      description: formData.description,
      characteristics: chars
    };
    if (formData.price) roomData.price = parseFloat(formData.price);

    try {
      const newRoom = await apiService.createRoom(roomData);
      const newRoomId = newRoom.id || newRoom._id;
      notify(`Room ${formData.number} created successfully!`);
      
      if (imageFile) {
        await apiService.uploadRoomImage(newRoomId, imageFile);
        notify('Image uploaded successfully!');
      }
      
      setFormData({
        number: '', floor: '', category: '', status: 'available', price: '', description: '', characteristics: ''
      });
      setImageFile(null);
      fetchData();
    } catch (err) {
      notify('Error: ' + err.message, 'error');
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId || c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const getStyleForRoom = (room, index) => {
    const styles = [
      { background: 'linear-gradient(135deg,#c0d8f0,#90b8e0)', color: '#4488bb' },
      { background: 'linear-gradient(135deg,#f8dcc0,#f0b880)', color: '#c07030' },
      { background: 'linear-gradient(135deg,#d4f0d8,#a8ddb0)', color: '#3a8a44' },
      { background: '#eaeaea', color: '#555' }
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="admin-container" style={{display: 'flex'}}>
      <AdminSidebar />
      <div className="admin-main">
        {notification && (
          <div style={{
            position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
            background: notification.type === 'error' ? 'var(--error)' : 'var(--success)',
            color: 'white', padding: '1rem 1.5rem', borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)', fontWeight: 600, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <i className={`fas fa-${notification.type === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
            {notification.msg}
          </div>
        )}
        <header className="admin-header">
          <div className="header-left">
            <h1 style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)'}}>Room Management</h1>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Manage your hotel inventory and status</p>
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

        <div className="content-offset" style={{marginTop: 0}}>
          <div className="list-panel">
            <div className="list-header">
              <div className="list-title">Rooms</div>
              <div className="search-row">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Search room type, number, etc." />
                </div>
              </div>
              <div className="filter-row">
                <div className="sort-select">
                  <i className="fas fa-sort" style={{color:'#aaa', fontSize:'.75rem'}}></i>
                  <span>Sort by:</span>
                  <select><option>Popular</option><option>Price</option><option>Name</option></select>
                </div>
                <div className="sort-select">
                  <select><option>All Type</option><option>Standard</option><option>Deluxe</option><option>Suite</option></select>
                </div>
              </div>
            </div>

            <div className="room-list">
              {rooms.map((room, idx) => {
                const style = getStyleForRoom(room, idx);
                return (
                  <div key={room._id || idx} className="room-card" style={{cursor:'pointer'}}>
                    <div className="room-img" style={{background: style.background}}><i className="fas fa-bed" style={{color: style.color}}></i></div>
                    <div className="room-info">
                      <div className="room-name-row">
                        <span className="room-name">Room {room.number} <span style={{fontSize: '0.9rem', color: '#666', fontWeight: 'normal'}}>({getCategoryName(room.category_id)})</span></span>
                        <span className={`room-status status-${room.status}`}>{room.status}</span>
                      </div>
                      <div className="room-meta">
                        <span><i className="fas fa-ruler-combined"></i> 25 m²</span>
                        <span><i className="fas fa-bed"></i> {room.characteristics && room.characteristics.length > 0 ? room.characteristics[0] || 'Bed' : 'Bed'}</span>
                        <span><i className="fas fa-user"></i> 2 guests</span>
                      </div>
                      <div className="room-desc">{room.description}</div>
                      <div className="room-avail-price">
                        <span className="room-avail">Availability: {room.status === 'available' ? 'Yes' : 'No'}</span>
                        <span className="room-price">${room.price} <span>/night</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {rooms.length === 0 && <p style={{padding: '20px'}}>No rooms available.</p>}
            </div>
          </div>

          <div className="detail-panel">
            <div className="detail-header">
              <span className="detail-title">Add New Room</span>
            </div>
            <div className="detail-card" style={{padding: '20px'}}>
              <form onSubmit={handleAddRoom}>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Room Number</label>
                  <input type="text" name="number" value={formData.number} onChange={handleChange} required style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}} />
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Floor</label>
                  <select name="floor" value={formData.floor} onChange={handleChange} required style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}>
                    <option value="">Select Floor</option>
                    {floors.map(f => (
                      <option key={f.id || f._id} value={f.id || f._id}>{f.name || f.number}</option>
                    ))}
                  </select>
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} required style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="dirty">Dirty</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Price (optional)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}} />
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}} rows="3"></textarea>
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Characteristics (comma separated)</label>
                  <input type="text" name="characteristics" value={formData.characteristics} onChange={handleChange} style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}} />
                </div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display:'block', fontWeight:600, marginBottom: '5px'}}>Upload Image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{width: '100%', padding: '8px'}} />
                </div>
                <button type="submit" style={{background: 'var(--primary, #007bff)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%'}}>Save Room</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

