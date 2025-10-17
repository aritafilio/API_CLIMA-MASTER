module.exports = function consentRequired(kind = 'analytics') {
  return (req, res, next) => {
    const user = users.find(u => decrypt(u.email) === req.user.email);
    if (!user) return res.status(401).json({ error: 'No autorizado' });
    const p = user.privacy || {};
    const ok = p.consent?.given &&
               (kind !== 'analytics' || p.analytics) &&
               (kind !== 'marketing' || p.marketing);
    if (!ok) return res.status(403).json({ error: 'Consentimiento requerido' });
    next();
  };
};
