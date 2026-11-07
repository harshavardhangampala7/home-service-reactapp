
import React, { useState } from 'react';

// SERVICE DATA
const SERVICES = [
  { n: 'Plumber', i: '🚰', d: 'Leaks, taps, pipes and bathroom fittings.', p: 299 },
  { n: 'Electrician', i: '💡', d: 'Wiring, switches, fans and fittings.', p: 249 },
  { n: 'Carpenter', i: '🪚', d: 'Furniture repair, doors and custom work.', p: 349 },
  { n: 'Cleaner', i: '🧹', d: 'Home and deep cleaning.', p: 399 },
  { n: 'Painter', i: '🎨', d: 'Interior and exterior painting.', p: 499 },
  { n: 'AC Technician', i: '❄️', d: 'AC servicing and repairs.', p: 449 },
  { n: 'Appliance Repair', i: '🔧', d: 'Washing machine, fridge and microwave.', p: 349 }
];

// WORKER DATA
const WORKERS = [
  ['Ravi Kumar', 'Plumber', 'Guntur', 6, 4.8, true, 160],
  ['Suresh Babu', 'Electrician', 'Tenali', 9, 4.7, true, 140],
  ['Lakshmi Devi', 'Cleaner', 'Guntur', 5, 4.9, true, 180],
  ['Venkat Rao', 'Carpenter', 'Vijayawada', 12, 4.6, false, 200],
  ['Mohan Reddy', 'Painter', 'Guntur', 8, 4.5, true, 170],
  ['Imran Khan', 'AC Technician', 'Vijayawada', 7, 4.8, true, 190],
  ['Prasad N.', 'Appliance Repair', 'Tenali', 10, 4.7, false, 150],
  ['Srinivas K.', 'Plumber', 'Vijayawada', 4, 4.4, true, 150],
  ['Padma S.', 'Cleaner', 'Tenali', 3, 4.6, true, 170],
  ['Ajay Verma', 'Electrician', 'Guntur', 11, 4.9, true, 160]
].map((w, i) => ({
  id: i + 1,
  name: w[0],
  svc: w[1],
  city: w[2],
  exp: w[3],
  rate: w[4],
  avail: w[5],
  rph: w[6],
  dist: +(0.8 + ((i * 37) % 90) / 10).toFixed(1)
}));

const money = n => '₹' + Number(n).toLocaleString('en-IN');

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('hsb_user') || 'null')
  );

  const [mode, setMode] = useState('login');
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem('hsb_users') || '[]')
  );

  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('d');

  const [bookings, setBookings] = useState(
    JSON.parse(localStorage.getItem(
      'hsb_bookings_' + (user?.id || '')
    ) || '[]')
  );

  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '', id: '', pw: '', cp: ''
  });

  const [booking, setBooking] = useState({
    svc: 'Plumber',
    wid: 1,
    date: '',
    time: '',
    addr: '',
    desc: '',
    hrs: 1,
    urgent: false
  });

  const [modal, setModal] = useState('');

  // SAVE BOOKINGS
  function saveBookings(data) {
    setBookings(data);
    localStorage.setItem(
      'hsb_bookings_' + user.id,
      JSON.stringify(data)
    );
  }

  // LOGIN AND REGISTRATION
  function handleAuth(e) {
    e.preventDefault();
    setMessage('');

    const { name, id, pw, cp } = form;
    const validMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(id);
    const validPhone = /^[6-9]\d{9}$/.test(id);

    if (!validMail && !validPhone) {
      return setMessage('Enter a valid email or mobile number.');
    }

    if (pw.length < 6) {
      return setMessage('Password must contain 6 characters.');
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        return setMessage('Enter your full name.');
      }

      if (cp !== pw) {
        return setMessage('Passwords do not match.');
      }

      if (users.some(u => u.id === id)) {
        return setMessage('Account already exists. Please login.');
      }

      const updated = [...users, { name, id, pw }];
      setUsers(updated);
      localStorage.setItem('hsb_users', JSON.stringify(updated));
      login({ name, id });
    } else {
      const found = users.find(u => u.id === id && u.pw === pw);

      if (!found) {
        return setMessage('Incorrect login details.');
      }

      login({ name: found.name, id: found.id });
    }
  }

  function login(u) {
    setUser(u);
    localStorage.setItem('hsb_user', JSON.stringify(u));
    setBookings(
      JSON.parse(localStorage.getItem('hsb_bookings_' + u.id) || '[]')
    );
  }

  function logout() {
    localStorage.removeItem('hsb_user');
    setUser(null);
    setBookings([]);
    setMode('login');
    setMessage('');
  }

  // FILTER AND SORT WORKERS
  const filteredServices = SERVICES.filter(s =>
    (filter === 'All' || s.n === filter) &&
    (!query || (s.n + s.d).toLowerCase().includes(query.toLowerCase()))
  );

  const filteredWorkers = WORKERS.filter(w =>
    (filter === 'All' || w.svc === filter) &&
    (!location || w.city.toLowerCase().includes(location.toLowerCase())) &&
    (!query || (w.svc + w.name + w.city).toLowerCase().includes(query.toLowerCase()))
  ).sort((a, b) =>
    sort === 'r' ? b.rate - a.rate :
    sort === 'p' ? a.rph - b.rph :
    a.dist - b.dist
  );

  // OPEN BOOKING
  function openBooking(service, workerId) {
    const worker = WORKERS.find(w => w.svc === service);
    setBooking({
      svc: service,
      wid: workerId || worker?.id || 1,
      date: new Date().toLocaleDateString('en-CA'),
      time: '',
      addr: '',
      desc: '',
      hrs: 1,
      urgent: false
    });
    setModal('booking');
  }

  // BOOKING COST
  const selectedWorker = WORKERS.find(w => w.id === Number(booking.wid));
  const service = SERVICES.find(s => s.n === booking.svc);
  const cost = selectedWorker && service
    ? Math.max(service.p, selectedWorker.rph * Number(booking.hrs)) +
      (booking.urgent ? 150 : 0) + 49
    : 0;

  // CONFIRM BOOKING
  function confirmBooking(e) {
    e.preventDefault();

    const newBooking = {
      id: Date.now(),
      svc: booking.svc,
      wid: Number(booking.wid),
      date: booking.date,
      time: booking.time,
      addr: booking.addr,
      desc: booking.desc,
      cost,
      status: selectedWorker.avail ? 'Confirmed' : 'Pending'
    };

    saveBookings([...bookings, newBooking]);
    setModal('success');
  }

  // CANCEL BOOKING
  function cancelBooking(id) {
    const updated = bookings.map(b =>
      b.id === id ? { ...b, status: 'Cancelled' } : b
    );
    saveBookings(updated);
  }

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="auth">
        <div className="aside">
          <div className="logo" style={{ color: 'white' }}>
            🏠 HomeServe
          </div>
          <h1>Skilled help, booked in a minute.</h1>
          <ul>
            <li>Verified plumbers, electricians and cleaners</li>
            <li>See ratings, prices and distance before booking</li>
            <li>Track every booking in one place</li>
          </ul>
        </div>

        <div className="pane">
          <div className="in">
            <h2>Welcome</h2>
            <p className="sub">Log in or create an account.</p>

            <div className="tabs">
              <button className={mode === 'login' ? 'on' : ''}
                onClick={() => { setMode('login'); setMessage(''); }}>
                Login
              </button>
              <button className={mode === 'register' ? 'on' : ''}
                onClick={() => { setMode('register'); setMessage(''); }}>
                Register
              </button>
            </div>

            <form className="f" onSubmit={handleAuth}>
              {mode === 'register' && (
                <label>Full Name
                  <input required value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} />
                </label>
              )}

              <label>Email or Mobile Number
                <input required value={form.id}
                  placeholder="you@email.com or 9876543210"
                  onChange={e => setForm({...form, id: e.target.value.trim()})} />
              </label>

              <label>Password
                <input required type="password" value={form.pw}
                  placeholder="At least 6 characters"
                  onChange={e => setForm({...form, pw: e.target.value})} />
              </label>

              {mode === 'register' && (
                <label>Confirm Password
                  <input required type="password" value={form.cp}
                    onChange={e => setForm({...form, cp: e.target.value})} />
                </label>
              )}

              <button className="btn amber">
                {mode === 'login' ? 'Login' : 'Create Account'}
              </button>

              <p className="err">{message}</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // MAIN HOME PAGE
  return (
    <>
      <nav>
        <div className="wrap">
          <a href="#home" className="logo">🏠 HomeServe</a>
          <div className="links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#workers">Workers</a>
            <a href="#bookings">Bookings</a>
            <button className="btn sm" onClick={() => setModal('profile')}>
              👤 {user.name.split(' ')[0]}
            </button>
            <button className="btn sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <header className="hero" id="home">
        <div className="wrap">
          <h1>Trusted Home Services at Your Doorstep</h1>
          <p>Book verified plumbers, electricians, cleaners and more near you.</p>

          <div className="search">
            <input placeholder="What do you need?"
              value={query} onChange={e => setQuery(e.target.value)} />
            <input placeholder="Your city or area"
              value={location} onChange={e => setLocation(e.target.value)} />
            <button className="btn amber"
              onClick={() => document.getElementById('workers').scrollIntoView()}>
              Search
            </button>
          </div>
        </div>
      </header>

      {/* SERVICES */}
      <section id="services">
        <div className="wrap">
          <h2>Popular Services</h2>
          <p className="sub">Choose a service to see its price and availability.</p>

          <div className="chips">
            {['All', ...SERVICES.map(s => s.n)].map(n => (
              <button key={n}
                className={`chip ${filter === n ? 'on' : ''}`}
                onClick={() => setFilter(n)}>
                {n}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredServices.map(s => (
              <div className="card" key={s.n}>
                <div className="ico">{s.i}</div>
                <h3>{s.n}</h3>
                <p>{s.d}</p>
                <div className="row">
                  <span className="price">From {money(s.p)}</span>
                  <button className="btn sm"
                    onClick={() => openBooking(s.n)}>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKERS */}
      <section className="alt" id="workers">
        <div className="wrap">
          <div className="row">
            <div>
              <h2>Workers Near You</h2>
              <p className="sub">
                Showing {filteredWorkers.length} workers.
              </p>
            </div>

            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ width: 'auto' }}>
              <option value="d">Nearest First</option>
              <option value="r">Top Rated</option>
              <option value="p">Lowest Price</option>
            </select>
          </div>

          <div className="grid">
            {filteredWorkers.map(w => (
              <div className="card worker" key={w.id}>
                <h3>{w.name}</h3>
                <p>{w.svc} · {w.city}</p>
                <div className="stars">★★★★★</div>
                <div className="meta">
                  <span>🧰 {w.exp} yrs experience</span>
                  <span>📍 {w.dist} km away</span>
                  <span>💰 {money(w.rph)}/hr</span>
                  <span>{w.avail ? 'Available' : 'Busy today'}</span>
                  <span>⭐ {w.rate}/5</span>
                </div>
                <button className="btn"
                  onClick={() => openBooking(w.svc, w.id)}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKINGS */}
      <section id="bookings">
        <div className="wrap">
          <h2>My Bookings</h2>
          <p className="sub">Your booked services and their status.</p>

          <div className="grid">
            {bookings.slice().reverse().map(b => {
              const w = WORKERS.find(w => w.id === b.wid);
              return (
                <div className="card" key={b.id}>
                  <h3>{b.svc}</h3>
                  <p>{w?.name} · {w?.city}</p>
                  <p>📅 {b.date} · ⏰ {b.time}</p>
                  <p>📍 {b.addr}</p>
                  <p className="price">{money(b.cost)}</p>
                  <p><b>Status: {b.status}</b></p>
                  {b.status !== 'Cancelled' && (
                    <button className="btn ghost sm"
                      onClick={() => cancelBooking(b.id)}>
                      Cancel Booking
                    </button>
                  )}
                </div>
              );
            })}
            {bookings.length === 0 && (
              <div className="empty">No bookings yet. Choose a service above.</div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="alt" id="about">
        <div className="wrap">
          <h2>About HomeServe</h2>
          <p className="sub">
            HomeServe helps customers find and book home service professionals
            with transparent prices and convenient booking management.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="wrap">
          <h2>Contact Us</h2>
          <p className="sub">Need help? Contact our support team.</p>
          <p>Email: support@homeserve.example</p>
        </div>
      </section>

      <footer className="main">
        © 2026 HomeServe. All rights reserved.
      </footer>

      {/* BOOKING MODAL */}
      {modal === 'booking' && (
        <div className="modal open">
          <div className="box">
            <button className="x" onClick={() => setModal('')}>×</button>
            <h3>Book a Service</h3>

            <form className="f" onSubmit={confirmBooking}>
              <label>Service
                <select value={booking.svc}
                  onChange={e => {
                    const svc = e.target.value;
                    setBooking({...booking, svc, wid: WORKERS.find(w => w.svc === svc)?.id || 1});
                  }}>
                  {SERVICES.map(s => <option key={s.n}>{s.n}</option>)}
                </select>
              </label>

              <label>Choose Worker
                <select value={booking.wid}
                  onChange={e => setBooking({...booking, wid: Number(e.target.value)})}>
                  {WORKERS.filter(w => w.svc === booking.svc).map(w =>
                    <option key={w.id} value={w.id}>
                      {w.name} - {money(w.rph)}/hr
                    </option>
                  )}
                </select>
              </label>

              <label>Date
                <input type="date" required min={new Date().toLocaleDateString('en-CA')}
                  value={booking.date}
                  onChange={e => setBooking({...booking, date: e.target.value})} />
              </label>

              <label>Time
                <input type="time" required value={booking.time}
                  onChange={e => setBooking({...booking, time: e.target.value})} />
              </label>

              <label>Address
                <input required value={booking.addr}
                  onChange={e => setBooking({...booking, addr: e.target.value})} />
              </label>

              <label>Description
                <textarea value={booking.desc}
                  onChange={e => setBooking({...booking, desc: e.target.value})} />
              </label>

              <label>Estimated Hours
                <input type="number" min="1" max="12" required
                  value={booking.hrs}
                  onChange={e => setBooking({...booking, hrs: e.target.value})} />
              </label>

              <label>
                <input type="checkbox" checked={booking.urgent}
                  onChange={e => setBooking({...booking, urgent: e.target.checked})} />
                Urgent service (+₹150)
              </label>

              <div className="est">
                <span>Estimated Cost</span>
                <span>{money(cost)}</span>
              </div>

              <button className="btn amber">Confirm Booking</button>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {modal === 'success' && (
        <div className="modal open">
          <div className="box">
            <h3>🎉 Booking Successful!</h3>
            <p>Your service booking has been saved.</p>
            <button className="btn" onClick={() => setModal('')}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {modal === 'profile' && (
        <div className="modal open">
          <div className="box">
            <button className="x" onClick={() => setModal('')}>×</button>
            <h3>Your Profile</h3>
            <p><b>{user.name}</b></p>
            <p>{user.id}</p>
            <p>{bookings.length} booking(s)</p>
          </div>
        </div>
      )}
    </>
  );
}
