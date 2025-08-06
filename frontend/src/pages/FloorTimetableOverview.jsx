import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


const TimetableMonday = () => {
  const [Timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { blockname } = useParams();
  const navigate = useNavigate();
  const today = new Date().toLocaleString("en-US", { weekday: "long" });


  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get(`https://dr-backend-32ec.onrender.com/periods/blockTimetables/${blockname}`);
    // console.log(data)
    // Sort by className alphabetically
    data.sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: 'base' }));

    setTimetables(data);
    const response = fetchOngoingClasses(data)
    console.log(response)
  } catch (err) {
    console.log(err.message);
  } finally {
    setLoading(false);
  }
};



  // Check if all rows for today are empty
  const isTodayEmpty = Timetables.every(cls => {
    const dayData = cls.timetableData.find(day => day.dayName === today);
    return !dayData || dayData.periods.length === 0;
  });

  //For displaying the current period.....
  const isCurrentPeriod = (start, end) => {
  const now = new Date();

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  };

  const startTime = parseTime(start);
  const endTime = parseTime(end);

  const startDate = new Date();
  startDate.setHours(startTime.hours, startTime.minutes, 0);

  const endDate = new Date();
  endDate.setHours(endTime.hours, endTime.minutes, 0);

  return now >= startDate && now <= endDate;
};


  const fetchOngoingClasses = (data) => {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });

  return data.flatMap((cls) => {
    const todayData = cls.timetableData.find((d) => d.dayName === today);
    if (!todayData) return [];

    // Find periods currently ongoing
    const ongoingPeriods = todayData.periods.filter((p) =>
      isCurrentPeriod(p.startTime, p.endTime)
    );

    return ongoingPeriods.map((p) => ({
      className: cls.className,
      subject: p.subject,
      faculty: p.faculty,
      time: `${p.startTime} - ${p.endTime}`,
    }));
  });
};



  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0 text-danger">
              📅 Timetable - <span className="text-dark">{today}</span>
            </h3>
            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate(-1)}>
              ⬅ Back to Floor
            </button>
          </div>


          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 fw-semibold text-secondary">Loading timetable...</p>
            </div>
          ) : isTodayEmpty ? (
            <div className="text-center py-5">
              <h5 className="text-muted">📌 No classes scheduled for <strong>{today}</strong></h5>
            </div>
          ) : (
            <div className="table-responsive rounded-4 shadow-sm">
              <table className="table table-bordered align-middle text-center table-hover mb-0">
                <thead className="table-primary">
                  <tr>
                    <th scope="col" className="bg-primary text-white">Class</th>
                    {[...Array(7)].map((_, i) => (
                      <th key={i} scope="col">Period {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Timetables.map((cls) => {
                    const dayData = cls.timetableData.find(day => day.dayName === today);
                    const periods = Array(7).fill("");
                    if (dayData) {
                      dayData.periods.forEach((p) => {
                        if (p.periodNumber >= 1 && p.periodNumber <= 7) {
                          periods[p.periodNumber - 1] = p;
                        }
                      });
                    }
                    return (
                      <tr key={cls._id}>
                        <th scope="row" className="fw-semibold text-primary">{cls.className}</th>
                        {periods.map((p, i) => (
                         <td key={i}>
                           
                            <>
                              <span className="fw-bold d-block text-dark">{p.subject}</span>
                              <span className="badge bg-light text-secondary">
                                {p.startTime} - {p.endTime}
                              </span>
                              <br />
                              <small className="text-muted">
                                {p.faculty ? p.faculty : '-'}
                              </small>
                            </>
                          
                        </td>

                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default TimetableMonday;
