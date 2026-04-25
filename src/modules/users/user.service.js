import userRepository from './user.repository.js';
import { generateToken } from '../../shared/utils/jwt.js';
import { formatLastSeen, isOnline } from '../../shared/utils/dateUtils.js';

class UserService {
    async getUserById(id) {
        return await userRepository.findById(id);
    }
  
    async getUserByEmail(email) {
        return await userRepository.findByEmail(email);
    }
  
    async createUser(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }
        
        if (userData.username) {
            const existingUsername = await userRepository.findByUsername(userData.username);
            if (existingUsername) {
                throw new Error('Username already taken');
            }
        }
        
        return await userRepository.create(userData);
    }

   async getUserWithStatus(userId) {
  const user = await userRepository.findById(userId);
  if (!user) return null;
  
  const userData = user.toJSON();
  const now = new Date();
  const lastSeen = new Date(user.last_seen || now);
  const diffMs = now - lastSeen;
  
  // Онлайн если активность была менее 2 минут назад
  userData.isOnline = diffMs < 2 * 60 * 1000;
  userData.lastSeenFormatted = user.getLastSeenFormatted();
  
  return userData;
}

    async getUserByUsername(username) {
        return await userRepository.findByUsername(username);
    }
    
    async updateUser(id, updateData) {
        if (updateData.username) {
            const existingUsername = await userRepository.findByUsername(updateData.username);
            if (existingUsername && existingUsername.id !== id) {
                throw new Error('Username already taken');
            }
        }
        
        return await userRepository.update(id, updateData);
    }
    
    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        const isValid = await user.verifyPassword(password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        
        const token = generateToken({ id: user.id, email: user.email });
        return { user: user.toJSON(), token };
    }
    
    async updateLastSeen(userId) {
        return await userRepository.updateLastSeen(userId);
    }
    
    async searchUsers(query) {
        if (!query || query.length < 2) {
            return [];
        }
        return await userRepository.search(query);
    }
}

export default new UserService();