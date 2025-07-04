import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import { useParams ,useNavigate} from 'react-router-dom';

const TimetableMonday = () => {
  const [Timetables,setTimetables] = useState([]);
  const {blockname} = useParams()
  const navigate = useNavigate()
  const today = new Date().toLocaleString("en-US", { weekday: "long" }); // e.g., 'Monday'

  useEffect(()=>{
    fetchTimetables()
  },[])

  const fetchTimetables = async()=>{
  try{
    const {data} = await axios.get(`http://localhost:5000/periods/blockTimetables/${blockname}`)
    // console.log(data)
    setTimetables(data)
  }catch(err){
    console.log(err.message)
  }
}

  return (
  <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Timetable - {today}</h3>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back to Floor</button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col">Class</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} scope="col">Period {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Timetables.map((cls) => {
              const dayData = cls.timetableData.find(
                (day) => day.dayName === today
              );

              const periods = Array(7).fill(""); // Initialize 7 periods
              if (dayData) {
                dayData.periods.forEach((p) => {
                  if (p.periodNumber >= 1 && p.periodNumber <= 7) {
                    periods[p.periodNumber - 1] = p;
                  }
                });
              }

              return (
                <tr key={cls._id}>
                  <th scope="row">{cls.className}</th>
                  {periods.map((p, i) => (
                    <td key={i}>
                      {p ? (
                        <>
                          <strong>{p.subject}</strong><br />
                          <small>{p.startTime} - {p.endTime}</small><br />
                          <small>{p.faculty}</small>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableMonday;
