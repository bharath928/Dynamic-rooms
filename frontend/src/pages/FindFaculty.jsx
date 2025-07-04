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
    <div style={{ padding: '20px' }}>
      <h1>Find Faculty's Current Class</h1>

      <input
        type="text"
        placeholder="Search by faculty name..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{
          padding: '10px',
          width: '300px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />

      {loading ? (
        <div style={{ fontSize: '18px' }}>🔄 Loading current classes...</div>
      ) : (
        <>
          {searchQuery && filteredClasses.length === 0 ? (
            <p>No ongoing class found for "{searchQuery}"</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {filteredClasses.map((cls, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ccc',
                    padding: '15px',
                    borderRadius: '8px',
                    width: '280px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    background: '#f9f9f9',
                  }}
                >
                  <p><strong>Faculty:</strong> {cls.faculty}</p>
                  <p><strong>Block:</strong> {cls.block}</p>
                  <p><strong>Room:</strong> {cls.room}</p>
                  
                  <p><strong>Subject:</strong> {cls.subject}</p>
                  <p><strong>Time:</strong> {cls.time}</p>
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
