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
  const [notifications, setNotifications] = useState([]);

  // Función para obtener estadísticas de libros
  const fetchLibraryStats = async () => {
    if (!token) {
      setError("No hay token de autenticación");
      setLoading(false);
      return;
    }

    try {
      // Obtener todos los libros
      const booksResponse = await fetch("http://localhost:8080/libros", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!booksResponse.ok) {
        throw new Error(`Error al obtener libros: ${booksResponse.status}`);
      }

      const books = await booksResponse.json();
      
      // Si tu API tiene endpoints específicos para estadísticas, úsalos aquí
      // Por ejemplo: /api/stats/library
      
      // Calcular estadísticas basadas en los datos de libros
      const totalBooks = books.length;
      
      // Estas estadísticas las puedes calcular según tu lógica de negocio
      // o crear endpoints específicos en tu backend
      const mockStats = {
        totalBooks: totalBooks,
        availableBooks: Math.floor(totalBooks * 0.75), // 75% disponibles
        borrowedBooks: Math.floor(totalBooks * 0.20),  // 20% prestados
        lostBooks: Math.floor(totalBooks * 0.05),      // 5% perdidos
        newBooks: Math.floor(totalBooks * 0.10)        // 10% nuevos
      };

      setStats(mockStats);
      
      // Generar notificaciones basadas en los datos
      generateNotifications(mockStats);
      
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar notificaciones
  const generateNotifications = (statsData) => {
    const notifications = [];
    
    if (statsData.lostBooks > 0) {
      notifications.push({
        type: 'warning',
        message: `${statsData.lostBooks} libros están reportados como perdidos`,
        icon: '⚠️'
      });
    }
    
    if (statsData.borrowedBooks > statsData.availableBooks) {
      notifications.push({
        type: 'info',
        message: 'Hay más libros prestados que disponibles',
        icon: '📚'
      });
    }
    
    if (statsData.newBooks > 0) {
      notifications.push({
        type: 'success',
        message: `${statsData.newBooks} libros nuevos agregados recientemente`,
        icon: '✅'
      });
    }

    setNotifications(notifications);
  };

  useEffect(() => {
    fetchLibraryStats();
  }, [token]);

  // Configuración de datos para el gráfico
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

  // Datos de las tarjetas de estadísticas
  const statsCards = [
    {
      title: 'Libros Nuevos',
      value: stats.newBooks,
      description: `${stats.newBooks} libros agregados recientemente`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-journal-plus" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
        </svg>
      ),
      color: 'text-primary'
    },
    {
      title: 'Libros Perdidos',
      value: stats.lostBooks,
      description: `${stats.lostBooks} libros no están en biblioteca`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-journal-x" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M6.146 6.146a.5.5 0 0 1 .708 0L8 7.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 8l1.147 1.146a.5.5 0 0 1-.708.708L8 8.707 6.854 9.854a.5.5 0 0 1-.708-.708L7.293 8 6.146 6.854a.5.5 0 0 1 0-.708"/>
          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
        </svg>
      ),
      color: 'text-danger'
    },
    {
      title: 'Libros Prestados',
      value: stats.borrowedBooks,
      description: `${stats.borrowedBooks} libros prestados`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-journal-arrow-up" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M8 11a.5.5 0 0 0 .5-.5V6.707l1.146 1.147a.5.5 0 0 0 .708-.708l-2-2a.5.5 0 0 0-.708 0l-2 2a.5.5 0 1 0 .708.708L7.5 6.707V10.5a.5.5 0 0 0 .5.5"/>
          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
        </svg>
      ),
      color: 'text-warning'
    },
    {
      title: 'Libros Disponibles',
      value: stats.availableBooks,
      description: `${stats.availableBooks} libros disponibles para prestar`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-journals" viewBox="0 0 16 16">
          <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1H1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2"/>
        </svg>
      ),
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
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="row w-100">
        {/* Panel de Notificaciones */}
        <div className="col-xl-6 col-md-12 mb-4">
          <div className="card shadow h-100">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Notificaciones</h6>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-bell-slash fa-2x mb-3"></i>
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {notifications.map((notification, index) => (
                    <div key={index} className={`list-group-item border-0 px-0 alert alert-${
                      notification.type === 'warning' ? 'warning' :
                      notification.type === 'success' ? 'success' : 'info'
                    } mb-2`}>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{notification.icon}</span>
                        <span className="small">{notification.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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