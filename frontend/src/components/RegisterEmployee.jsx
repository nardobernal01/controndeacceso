import React, { useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

function RegisterEmployee() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Registrando...");
    setIsError(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("entryTime", entryTime);
    formData.append("photo", photo);

    try {
      const response = await api.post("/persons", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`¡${response.data.name} registrado con éxito!`);
    } catch (error) {
      setMessage("Error al registrar. Revisa la consola.");
      setIsError(true);
    }
  };

  return (
    <div className="form-card">
      <h2>Registrar Empleado</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Edad:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Horario de Entrada:</label>
          <input
            type="time"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Foto:</label>
          <input
            type="file"
            onChange={(e) => setPhoto(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Registrar
        </button>
      </form>
      {message && (
        <p className={`message ${isError ? "error" : "success"}`}>{message}</p>
      )}
    </div>
  );
}

export default RegisterEmployee;
