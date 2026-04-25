// src/modules/users/user.repository.js
import User from './user.model.js';

class UserRepository {
    async findById(id, includeSensitive = false) {
        const attributes = includeSensitive 
            ? ['id', 'email', 'name', 'avatar', 'last_seen', 'username', 'phone', 'bio', 'birthday', 'pin_code', 'pin_code_expires', 'is_verified']
            : ['id', 'email', 'name', 'avatar', 'last_seen', 'username', 'phone', 'bio', 'birthday'];
            
        return await User.findByPk(id, { attributes });
    }
  
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }
  
    async findByUsername(username) {
        return await User.findOne({ where: { username } });
    }
  
    async create(userData) {
        return await User.create(userData);
    }
  
    async update(id, userData) {
        const user = await this.findById(id, true);
        if (!user) return null;
        return await user.update(userData);
    }
  
    async updateLastSeen(id) {
        return await User.update(
            { last_seen: new Date() },
            { where: { id } }
        );
    }
  
    async search(query, limit = 20) {
        const { Op } = await import('sequelize');
        return await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } },
                    { username: { [Op.like]: `%${query}%` } }
                ]
            },
            attributes: { exclude: ['password', 'pin_code', 'pin_code_expires'] },
            limit,
        });
    }
}

export default new UserRepository();