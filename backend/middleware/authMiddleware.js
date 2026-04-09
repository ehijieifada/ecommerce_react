import jwt from "jsonwebtoken";

const isDev = process.env.NODE_ENV !== 'production';

const redactAuth = (a) => {
  if (!a) return a;
  try {
    if (a.length > 24) return `${a.slice(0,12)}...${a.slice(-8)}`;
    return a;
  } catch (e) {
    return a;
  }
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const tokenCookie = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("token="));

  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Middleware to require a valid JWT; sets req.user and req.isAdmin
export const requireAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (isDev) console.log('[auth] Incoming token:', redactAuth(token));
    if (!token) return res.status(401).json({ message: "Missing auth token" });
    const payload = verifyToken(token);
    if (isDev) console.log('[auth] Decoded token payload:', payload);
    req.user = payload;
    req.isAdmin = !!payload.isAdmin;
    next();
  } catch (err) {
    if (isDev) console.log('[auth] Token verify error:', err && err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (isDev) console.log('[auth] Incoming token (optional):', redactAuth(token));
    if (token) {
      const payload = verifyToken(token);
      if (isDev) console.log('[auth] Decoded token payload (optional):', payload);
      req.user = payload;
      req.isAdmin = !!payload.isAdmin;
    } else {
      req.user = null;
      req.isAdmin = false;
    }
    next();
  } catch (err) {
    if (isDev) console.log('[auth] Optional token verify error:', err && err.message);
    req.user = null;
    req.isAdmin = false;
    next();
  }
};
