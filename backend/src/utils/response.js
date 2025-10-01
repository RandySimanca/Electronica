// Función para respuestas exitosas
export const successResponse = (res, data = {}, message = "Operación exitosa") => {
    return res.json({
      success: true,
      message,
      data,
    });
  };
  
  // Función para respuestas de error personalizadas (opcional)
  export const errorResponse = (res, error = "Error interno", status = 500) => {
    return res.status(status).json({
      success: false,
      error,
    });
  };
  