import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FindFaculty = () => {
  const [allClasses, setAllClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse time "hh:mm AM/PM" to minutes
  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  // Fetch data on page load
  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`https://dr-backend-32ec.onrender.com/periods/fetchBlocksTimetables`);
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const results = [];

      data.forEach(block => {
        block.rooms.forEach(room => {
          const timetable = room.timetableData.find(t => t.dayName === currentDay);
          if (timetable) {
            timetable.periods.forEach(period => {
              const startMinutes = parseTime(period.startTime);
              const endMinutes = parseTime(period.endTime);

              if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                results.push({
                  faculty: period.faculty,
                  subject: period.subject,
                  room: room.className,
                  block: block.blockName,
                  time: `${period.startTime} - ${period.endTime}`,
                });
              }
            });
          }
        });
      });

      setAllClasses(results);
    } catch (err) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredClasses([]); // Don't show anything
    } else {
      const filtered = allClasses.filter(cls =>
        cls.faculty.toLowerCase().includes(query)
      );
      setFilteredClasses(filtered);
    }
  };

  return (
   <>
  {/* Slim, Responsive Navbar */}
  <div
    className="container-fluid px-0"
    style={{
      background: 'linear-gradient(90deg, #2c6dbbff 0%, #3177c2ff 100%)',
      borderBottom: '3px solid #0d6efd',
      padding: '0.75rem 0',
      zIndex: 1050,
    }}
  >
    <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 px-3">
      {/* Title */}
      <h5 className="text-white fw-bold m-0 text-center text-md-start flex-shrink-0">
        📘 Find Faculty's Current Class
      </h5>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by faculty name..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="form-control shadow-sm"
        style={{
          maxWidth: '400px',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          border: 'none',
        }}
      />

      {/* Back Button */}
      <button
        className="btn btn-outline-light btn-sm fw-semibold"
        onClick={() => window.history.back()}
        style={{
          whiteSpace: 'nowrap',
          borderWidth: '2px',
          padding: '0.4rem 0.75rem',
          transition: '0.3s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 8px #ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        ⬅ Back
      </button>
    </div>
  </div>

  {/* Main Content Section */}
  <div className="container py-4">
    {loading ? (
      <div className="text-center fs-5 text-secondary">
        Loading current classes...
      </div>
    ) : (
      <>
        {searchQuery && filteredClasses.length === 0 ? (
          <p className="text-center text-danger">
            No ongoing class found for "<strong>{searchQuery}</strong>"
          </p>
        ) : (
          <div className="row g-4 justify-content-center">
            {filteredClasses.map((cls, index) => (
              <div key={index} className="col-12 col-sm-6 col-md-4">
                <div className="card shadow-sm border-start border-primary border-4 h-100">
                  <div className="card-body">
                    <p className="mb-2"><strong>Faculty:</strong> {cls.faculty}</p>
                    <p className="mb-2"><strong>Block:</strong> {cls.block}</p>
                    <p className="mb-2"><strong>Room:</strong> {cls.room}</p>
                    <p className="mb-2"><strong>Subject:</strong> {cls.subject}</p>
                    <p className="mb-0"><strong>Time:</strong> {cls.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
</>



  );
};

export default FindFaculty;