import userService from './user.service.js';
import fs from 'fs';
import path from 'path';

class UserController {
  async getProfile(req, res) {
    try {
      res.json(req.user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
  
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      const updatedUser = await userService.updateUser(userId, updateData);
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message === 'Username already taken') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
  
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updatedUser = await userService.updateUser(req.user.id, { avatar: avatarUrl });
      
      res.json({ avatar: avatarUrl, user: updatedUser });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
  
  async deleteAvatar(req, res) {
    try {
      if (req.user.avatar) {
        const avatarPath = path.join(process.cwd(), req.user.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      
      const updatedUser = await userService.updateUser(req.user.id, { avatar: null });
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Delete avatar error:', error);
      res.status(500).json({ error: 'Failed to delete avatar' });
    }
  }
  
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
  
  async getUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Убираем чувствительные данные
    const userData = user.toJSON();
    res.json(userData);
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}
  
  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const users = await userService.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
}

export default new UserController();