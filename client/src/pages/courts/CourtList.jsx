import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourts } from "../../api/courts";
import { Spinner } from "../../components/Spinner";

export const CourtList = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const data = await getCourts();
        setCourts(data);
      } catch (error) {
        console.error("Failed to fetch courts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Courts</h1>
      <ul className="space-y-2">
        {courts.map((court) => (
          <li key={court.id} className="border p-4 rounded shadow-sm">
            <Link to={`/courts/${court.id}`} className="text-blue-600 hover:underline">
              {court.name} – {court.location}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
