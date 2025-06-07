import React from "react";

const tables = ["libros", "usuarios", "mensajes", "capitulos"];

const TableDownloadButtons = () => {
  const handleDownload = async (table) => {
    try {
      const response = await fetch(`https://libreriabackend-production.up.railway.app/export/csv/${table}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error al descargar CSV:", error);
    }
  };

  return (
    <div className="d-flex flex-column gap-2 mt-3">
      {tables.map((table) => (
        <button
          key={table}
          onClick={() => handleDownload(table)}
          className="btn btn-success text-capitalize"
        >
          Descargar {table}.csv
        </button>
      ))}
    </div>
  );
};

export default TableDownloadButtons;
