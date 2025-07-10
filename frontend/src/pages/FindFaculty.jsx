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
      const { data } = await axios.get(`http://localhost:5000/periods/fetchBlocksTimetables`);
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
    <div className="container py-5">
  <div className="position-absolute top-0 end-0 mt-3 me-3">
    <button
      className="btn btn-outline-secondary btn-sm"
      onClick={() => window.history.back()}
    >
      ← Back
    </button>
    
  </div>
  <h1 className="text-primary fw-bold text-center flex-grow-1 m-0">Find Faculty's Current Class</h1>
  <br />


  <div className="d-flex justify-content-center mb-4">
    <input
      type="text"
      placeholder="Search by faculty name..."
      value={searchQuery}
      onChange={handleSearchChange}
      className="form-control w-100"
      style={{ maxWidth: "400px", borderRadius: "0.5rem", padding: "0.75rem" }}
    />
  </div>

  {loading ? (
    <div className="text-center fs-5 text-secondary">
      🔄 Loading current classes...
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
            <div key={index} className="col-md-4 col-sm-6">
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

  );
};

export default FindFaculty;