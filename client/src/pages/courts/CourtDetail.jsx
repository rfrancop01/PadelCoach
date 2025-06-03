import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourt } from "../../api/courts";
import { Spinner } from "../../components/Spinner";

export const CourtDetail = () => {
  const { id } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const data = await getCourt(id);
        setCourt(data);
      } catch (error) {
        console.error("Error fetching court:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [id]);

  if (loading) return <Spinner />;

  if (!court) return <p>Court not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{court.name}</h1>
      <p>Location: {court.location}</p>
      <p>Surface: {court.surface}</p>
      <p>Indoor: {court.indoor ? "Yes" : "No"}</p>
    </div>
  );
};