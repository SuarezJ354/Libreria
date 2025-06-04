import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from "../../context/AuthContext";
import NotificationsPanel from './Notifications';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LibraryStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    lostBooks: 0,
    newBooks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLibraryStats = async () => {
    if (!token) {
      setError("No hay token de autenticación");
      setLoading(false);
      return;
    }

    try {
      const booksResponse = await fetch("https://libreriabackend-production.up.railway.app/libros", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!booksResponse.ok) {
        throw new Error(`Error al obtener libros: ${booksResponse.status}`);
      }

      const books = await booksResponse.json();

      const totalBooks = books.length;

      const mockStats = {
        totalBooks: totalBooks,
        availableBooks: Math.floor(totalBooks * 0.75),
        borrowedBooks: Math.floor(totalBooks * 0.20),
        lostBooks: Math.floor(totalBooks * 0.05),
        newBooks: Math.floor(totalBooks * 0.10)
      };

      setStats(mockStats);

    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryStats();
  }, [token]);

  const chartData = {
    labels: ['Libros Disponibles', 'Libros Prestados', 'Libros Perdidos', 'Libros Nuevos'],
    datasets: [
      {
        label: 'Estado de la Biblioteca',
        data: [stats.availableBooks, stats.borrowedBooks, stats.lostBooks, stats.newBooks],
        backgroundColor: ['#4CAF50', '#FF5722', '#FF1744', '#2196F3'],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  const statsCards = [
    {
      title: 'Libros Nuevos',
      value: stats.newBooks,
      description: `${stats.newBooks} libros agregados recientemente`,
      icon: <i className="bi bi-journal-plus fs-2 text-primary"></i>,
      color: 'text-primary'
    },
    {
      title: 'Libros Perdidos',
      value: stats.lostBooks,
      description: `${stats.lostBooks} libros no están en biblioteca`,
      icon: <i className="bi bi-journal-x fs-2 text-danger"></i>,
      color: 'text-danger'
    },
    {
      title: 'Libros Prestados',
      value: stats.borrowedBooks,
      description: `${stats.borrowedBooks} libros prestados`,
      icon: <i className="bi bi-journal-arrow-up fs-2 text-warning"></i>,
      color: 'text-warning'
    },
    {
      title: 'Libros Disponibles',
      value: stats.availableBooks,
      description: `${stats.availableBooks} libros disponibles para prestar`,
      icon: <i className="bi bi-journals fs-2 text-success"></i>,
      color: 'text-success'
    }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar estadísticas</h4>
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={fetchLibraryStats}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Tarjetas de estadísticas */}
      {statsCards.map((stat, index) => (
        <div key={index} className="col-xl-3 col-md-6 mb-4">
          <div className="card shadow h-100 py-2 border-left-primary">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">
                    {stat.title}
                  </div>
                  <div className={`h5 mb-0 font-weight-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-muted small mt-1">
                    {stat.description}
                  </div>
                </div>
                <div className="col-auto">
                  <div>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="row w-100">
        {/* Panel de Notificaciones - Nuevo componente */}
        <div className="col-xl-6 col-md-12 mb-4">
          <NotificationsPanel />
        </div>

        {/* Gráfico circular */}
        <div className="col-xl-6 col-md-12 mb-4">
          <div className="card shadow h-100">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Resumen de la Biblioteca</h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <h4 className="text-gray-800">Total: {stats.totalBooks} libros</h4>
              </div>
              <div style={{ width: '300px', height: '300px', margin: 'auto' }}>
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}