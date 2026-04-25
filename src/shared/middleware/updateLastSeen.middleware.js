// src/shared/middleware/updateLastSeen.middleware.js
import { User } from '../../modules/index.js';

export const updateLastSeen = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await User.update(
        { last_seen: new Date() },
        { where: { id: req.user.id } }
      );
    }
  } catch (error) {
    console.error('Update last seen error:', error);
  }
  next();
};