import { getAvailableStudentUsers } from "../../api/users";
import React, { useEffect, useState } from "react";
import { deleteStudent, updateStudent, createStudent } from "../../api/students";
import { getAvailableStudentUsers as getStudents } from "../../api/users";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { StudentFormModal } from "./StudentFormModal";

export const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data.results);
    } catch (err) {
      console.error("Error al cargar estudiantes", err);
      toast.error("Error al cargar estudiantes");
    }
  };

  const handleToggle = async (student) => {
    try {
      await updateStudent(student.id, { is_active: !student.is_active });
      toast.success(`Estudiante ${student.is_active ? 'desactivado' : 'activado'} correctamente`);
      fetchStudents();
    } catch (err) {
      console.error("Error al actualizar estado del estudiante", err);
      toast.error("Error al actualizar estado del estudiante");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white bg-opacity-90 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
        <button
          onClick={() => {
            setSelectedStudent(null);
            setIsModalOpen(true);
          }}
          className="bg-accent text-gray-900 px-4 py-2 rounded hover:brightness-110 transition"
        >
          Crear Estudiante
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3 text-center">Editar</th>
              <th className="px-6 py-3 text-center">Activo</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4">{student.email}</td>
                <td className="px-6 py-4">{student.phone}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                  >
                    Editar
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div
                    onClick={() => handleToggle(student)}
                    className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ${
                      student.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                        student.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    ></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          try {
            if (selectedStudent) {
              await updateStudent(selectedStudent.id, data);
              toast.success("Estudiante actualizado correctamente");
            } else {
              await createStudent(data);
              toast.success("Estudiante creado correctamente");
            }
            fetchStudents();
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error al guardar estudiante:", err);
            toast.error("Error al guardar estudiante");
          }
        }}
        initialData={selectedStudent}
        parentSelector={() => document.body}
      />
    </div>
  );
};