// Middleware de logging para desarrollo
export const requestLogger = (req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.body).length > 0) {
      console.log("Body:", req.body);
    }
    next();
  };
  