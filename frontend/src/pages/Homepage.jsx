import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const [block, setBlock] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await axios.get("http://localhost:5000/block/get-data");
        setBlock(details.data);
      } catch (err) {
        setErr(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  if (loading) {
    return (
      <div className="loading-con">
        <div className="loading"></div>
      </div>
    );
  }

  if (err) {
    return <div className="error">Error occurred: {err}</div>;
  }

  return (
    <div className="container">
      <button
        className="add-block-button"
        onClick={() => navigate("/add-block")}
      >
        Add Block
      </button>
      <h1>Home Page</h1>
      {!block.length ? (
        <h1>No data found...</h1>
      ) : (
        <div className="card-container">
          {block.map((e, index) => (
            <div
              key={index}
              className="card"
              onClick={() => navigate(`/get-data/${e.__id}`, { state: { block: e } })}
            >
              <div className="img"></div>
              <h4>{e.block_name}</h4>
              <p>No of Floors: {e.no_of_floor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Homepage;
