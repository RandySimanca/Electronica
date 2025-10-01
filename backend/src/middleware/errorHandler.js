// Manejo de rutas no encontradas
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
      error: "Ruta no encontrada",
      path: req.originalUrl,
    });
  };
  
  // Middleware global de errores
  export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  };
  