import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HotelChatbot from '../components/HotelChatbot';
import apiService from '../services/apiService';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const roomsPerPage = 6;
  
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  // References for intersection observers
  const cardsRef = useRef([]);

  useEffect(() => {
    apiService.getRooms().then(data => {
      setRooms(data);
    }).catch(err => {
      console.error("Failed to fetch rooms:", err);
    });

    // Parallax hero effect
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const hero = document.querySelector('.hero-content');
      const video = document.querySelector('.hero-video');
      if (scrolled < window.innerHeight) {
        if (hero) {
          hero.style.transform = `translateY(${scrolled * 0.4}px)`;
          hero.style.opacity = Math.max(0, 1 - (scrolled / 700));
        }
        if (video) {
          video.style.transform = `scale(${1 + scrolled * 0.0005})`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Fade-in Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    cardsRef.current.forEach(el => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <>
      <Navbar />

      <section className="modern-hero" id="home">
        <div className="hero-overlay"></div>
        <div className="hero-video">
          <video autoPlay muted loop playsInline>
            <source src="https://cdn.pixabay.com/video/2022/07/04/123075-726838226_large.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>⭐ Luxury Experience</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-line-1">Exhale Now,</span>
            <span className="hero-line-2">Check In.</span>
          </h1>
          <p className="hero-subtitle">
            Discover luxury redefined at SkyBlue Hotel — where every moment becomes a lasting memory
          </p>
          
          <div className="hero-actions">
            <a href="#" className="btn-book">
              <i className="fas fa-calendar-check"></i> Book Your Stay
            </a>
            <a href="#rooms" className="btn-explore">
              <i className="fas fa-eye"></i> Explore Rooms
            </a>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Guest Rating</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Luxury Rooms</span>
            </div>
          </div>
        </div>
        
        <div className="hero-scroll">
          <span>Scroll to explore</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      <section className="booking-widget">
        <div className="widget-container">
          <div className="widget-title">
            <i className="fas fa-search"></i>
            <h3>Find Your Perfect Stay</h3>
          </div>
          
          <div className="widget-form">
            <div className="form-group">
              <label><i className="fas fa-calendar-alt"></i> Check-in</label>
              <input type="date" className="form-input" />
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-calendar-alt"></i> Check-out</label>
              <input type="date" className="form-input" />
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-user-friends"></i> Guests</label>
              <select className="form-input">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-bed"></i> Room Type</label>
              <select className="form-input">
                <option>All Rooms</option>
                <option>Deluxe Suite</option>
                <option>Executive Room</option>
                <option>Presidential Suite</option>
              </select>
            </div>
            
            <button className="btn-check" onClick={() => alert("Booking functionality coming soon!")}>
              <i className="fas fa-search"></i> Check Availability
            </button>
          </div>
        </div>
      </section>

      {/* Hotel Rooms Section (New Structure) */}
      <section className="rooms-section new-style-rooms" id="rooms" style={{ padding: '5rem 2rem', background: '#fff' }}>
        
        <div className="rooms-header-controls">
          <div className="rooms-count">{rooms.length} properties found</div>
          <div className="rooms-controls-right">
            <div className="sort-dropdown">
              Sort by: <strong>Recommended</strong> <i className="fas fa-chevron-down"></i>
            </div>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
              <button className="view-btn">
                <i className="fas fa-map-marked-alt"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="rooms-container-wrapper" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
          <div className={viewMode === 'grid' ? "new-rooms-grid" : "rooms-list-view"} id="roomsScrollContainer">
            {currentRooms.length > 0 ? currentRooms.map((room) => (
              viewMode === 'grid' ? (
                <div className="new-room-card" key={room.id || room._id} ref={addToRefs}>
                  <img 
                    src={room.images && room.images.length > 0 ? (room.images[0].startsWith('http') ? room.images[0] : `${apiService.baseUrl}${room.images[0]}`) : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop"} 
                    alt={room.number} 
                  />
                  <div className="new-room-info">
                    <div className="new-room-details">
                      <h3>{room.category_name || 'Luxury Room'}</h3>
                      <p className="new-room-price">${room.price || 1500}/per night</p>
                      <div className="new-room-rating">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star-half-alt"></i>
                        <span>4.9</span>
                      </div>
                    </div>
                    <button className="new-btn-book">Book Now</button>
                  </div>
                </div>
              ) : (
                <div className="list-room-card" key={room.id || room._id} ref={addToRefs}>
                  <div className="list-room-image">
                    <div className="list-badge-stars">
                      <i className="fas fa-star" style={{color: '#e67e22'}}></i> 5
                    </div>
                    <div className="list-badge-heart">
                      <i className="far fa-heart" style={{color: '#e67e22'}}></i>
                    </div>
                    <img 
                      src={room.images && room.images.length > 0 ? (room.images[0].startsWith('http') ? room.images[0] : `${apiService.baseUrl}${room.images[0]}`) : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop"} 
                      alt={room.number} 
                    />
                  </div>
                  
                  <div className="list-room-middle">
                    <div className="list-room-title">
                      <h3>{room.category_name || 'Luxury Room'}</h3>
                      <i className="fas fa-check-circle" style={{color: '#e67e22', marginLeft: '8px'}}></i>
                    </div>
                    <p className="list-room-location">SkyBlue Hotel • <a href="#">Show on map</a> • Premium Location</p>
                    <p className="list-room-desc">
                      {room.description || "Indulge in absolute luxury with our meticulously designed rooms featuring panoramic views and world-class amenities for an unforgettable stay."}
                    </p>
                  </div>
                  
                  <div className="list-room-right">
                    <div className="list-rating-block">
                      <div className="rating-score" style={{color: '#e67e22'}}>4.9/5</div>
                      <div className="rating-reviews">Exceptional</div>
                    </div>
                    <div className="list-price-block">
                      <div className="price-amount">${room.price || 1500}</div>
                      <div className="price-taxes">per night</div>
                      <button className="list-btn-book">Book Now</button>
                    </div>
                  </div>
                </div>
              )
            )) : (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>
                <p>No rooms found. Please check back later.</p>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="rooms-pagination">
              <button 
                className="page-btn nav-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className="page-btn nav-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us-section" id="about">
        <div className="about-images" ref={addToRefs}>
          <img className="img-back" src="https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1974&auto=format&fit=crop" alt="Hotel Interior" />
          <img className="img-front" src="https://cdn.pixabay.com/photo/2019/08/19/13/58/bed-4416515_1280.jpg" alt="Hotel Pool" />
        </div>
        <div className="about-content" ref={addToRefs}>
          <h2>About Us</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur. Ultricies fringilla non viverra commodo nulla morbi dolor bibendum ipsum. Pellentesque ut tristique vitae accumsan. Consequat aliquet cursus consectetur pellentesque volutpat morbi vestibulum nisl. Ultricies fringilla non viverra commodo nulla morbi dolor bibendum ipsum.
          </p>
          <p>
            Ultricies fringilla non viverra commodo nulla morbi dolor bibendum ipsum. Pellentesque ut tristique vitae accumsan. Consequat aliquet cursus consectetur pellentesque volutpat morbi vestibulum nisl.
          </p>
          <button className="btn-read-more">Read More</button>
        </div>
      </section>

      <section className="facilities-section" id="facilities">
        <div className="section-header">
          <h2>World-Class Facilities</h2>
          <p>Experience unparalleled amenities during your stay</p>
        </div>
        
        <div className="new-facilities-grid">
          <div className="new-facility-card" ref={addToRefs}>
            <img src="https://cdn.pixabay.com/photo/2019/11/20/01/06/swimming-pool-4638912_1280.jpg" alt="Infinity Pool" />
            <div className="facility-content">
              <div className="facility-icon-small">
                <i className="fas fa-swimming-pool"></i>
              </div>
              <h3>Infinity Pool</h3>
              <p>Stunning rooftop pool with city views</p>
            </div>
          </div>
          
          <div className="new-facility-card" ref={addToRefs}>
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop" alt="Luxury Spa" />
            <div className="facility-content">
              <div className="facility-icon-small">
                <i className="fas fa-spa"></i>
              </div>
              <h3>Luxury Spa</h3>
              <p>Rejuvenating treatments & therapies</p>
            </div>
          </div>
          
          <div className="new-facility-card" ref={addToRefs}>
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Fitness Center" />
            <div className="facility-content">
              <div className="facility-icon-small">
                <i className="fas fa-dumbbell"></i>
              </div>
              <h3>Fitness Center</h3>
              <p>State-of-the-art gym equipment</p>
            </div>
          </div>
          
          <div className="new-facility-card" ref={addToRefs}>
            <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop" alt="Fine Dining" />
            <div className="facility-content">
              <div className="facility-icon-small">
                <i className="fas fa-utensils"></i>
              </div>
              <h3>Fine Dining</h3>
              <p>Multiple restaurants & bars</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2>Guest Experiences</h2>
          <p>What our guests say about their stay</p>
        </div>
        
        <div className="testimonials-slider">
          <div className="testimonial-card" ref={addToRefs}>
            <div className="testimonial-rating">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p>"Absolutely stunning hotel with exceptional service. Will definitely return!"</p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah M." />
              <div>
                <h4>Sarah M.</h4>
                <span>Business Traveler</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card" ref={addToRefs}>
            <div className="testimonial-rating">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p>"The presidential suite exceeded all expectations. Pure luxury!"</p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/men/54.jpg" alt="James L." />
              <div>
                <h4>James L.</h4>
                <span>Honeymooner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Travel Section */}
      <section className="business-travel-section">
        <div className="business-travel-overlay"></div>
        <div className="business-travel-content" ref={addToRefs}>
          <h2 className="business-travel-title">
            STREAMLINE YOUR<br />
            <strong>BUSINESS TRAVEL</strong><br />
            EXPERIENCE.
          </h2>
          <p className="business-travel-text">
            Secure your reservation today and enjoy exclusive business rates and packages tailored for frequent guests.
          </p>
          <button className="btn-book-business">Book your stay today!</button>
        </div>
      </section>

      {/* Help & Experience Section */}
      <section className="help-experience-section">
        <div className="help-experience-container">
          <div className="experience-card" ref={addToRefs}>
            <div className="experience-overlay">
              <div className="experience-badge">
                <div className="experience-badge-text">
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                    <text fontSize="10" fill="white" letterSpacing="2">
                      <textPath href="#circlePath" startOffset="0%">
                        PREMIUM SERVICE • BEST FACILITIES • 
                      </textPath>
                    </text>
                  </svg>
                </div>
                <i className="fas fa-plus"></i>
              </div>
              <h3 className="experience-title">
                Unforgettable holiday<br />
                experiences.<br />
                <strong>Exceptional service awaits!</strong>
              </h3>
            </div>
          </div>
          
          <div className="help-content" ref={addToRefs}>
            <h2 className="help-title">Have questions about your booking or need assistance? We're here to help!</h2>
            <p className="help-text">For your safety, please adhere to all provided guidelines and protocols.</p>
            <a href="#" className="help-link">GET IN TOUCH</a>
            
            <div className="stats-card">
              <div className="stats-info">
                <h4>FREQUENTLY VISITED BY</h4>
                <h2>415,000+ Guests Served</h2>
                <div className="stats-avatars">
                  <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Guest" />
                  <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="Guest" />
                  <img src="https://randomuser.me/api/portraits/women/3.jpg" alt="Guest" />
                  <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="Guest" />
                  <img src="https://randomuser.me/api/portraits/women/5.jpg" alt="Guest" />
                </div>
              </div>
              <div className="stats-icon">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="stats-decor"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section (Redesigned) */}
      <section className="new-contact-section" id="contact" ref={addToRefs}>
        <div className="new-contact-form-panel">
          <h2 className="new-contact-title">Get in touch!</h2>
          <div className="title-underline"></div>
          <form className="new-contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Name*" required />
            <input type="email" placeholder="E-mail*" required />
            <input type="text" placeholder="Subject" />
            <textarea placeholder="Message" rows="4"></textarea>
            <button type="submit" className="new-btn-submit">Submit</button>
          </form>
        </div>
        
        <div className="new-contact-info-card">
          <div className="info-item">
            <div className="info-icon"><i className="fas fa-envelope"></i></div>
            <div className="info-text">
              <h4>Email</h4>
              <p>kheirmoahmed@gmail.com</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><i className="fas fa-phone-alt"></i></div>
            <div className="info-text">
              <h4>Phone</h4>
              <p>+212604653456</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div className="info-text">
              <h4>Location</h4>
              <p>2774 Rogue St, Naperville, USA</p>
              <a href="#" className="get-direction">Get Direction &gt;</a>
            </div>
          </div>
        </div>

        <div className="new-map-panel">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2583.565780183389!2d8.005166315703772!3d49.66014497937402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47963d31481b4db1%3A0xc6c7d0d62a4d94b0!2sUhlandstra%C3%9Fe%201%2C%2067292%20Kirchheimbolanden%2C%20Germany!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
            allowFullScreen="" 
            loading="lazy"
            title="Google Maps"
          ></iframe>
        </div>
      </section>

      <Footer />
      <HotelChatbot />
    </>
  );
}
