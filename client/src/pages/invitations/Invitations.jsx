

import React, { useEffect, useState } from "react";
import { getInvitations } from "../../api/invitations";
import { Spinner } from "../../components/Spinner";

export const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const data = await getInvitations();
        setInvitations(data);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invitaciones</h1>
      <ul className="space-y-2">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="border p-4 rounded shadow">
            <p><strong>ID:</strong> {invitation.id}</p>
            <p><strong>Email:</strong> {invitation.email}</p>
            <p><strong>Rol:</strong> {invitation.role}</p>
            <p><strong>Estado:</strong> {invitation.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};