import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../../shared/database/index.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
        name: 'unique_email',
        msg: 'Email already exists'
        },
        validate: {
        isEmail: true,
        notEmpty: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
        len: [0, 500]
        },
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'last_seen'
    },
    pin_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pin_code_expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  
    indexes: [
        {
            fields: ['email'],
            unique: true,
            name: 'idx_users_email',
        },
        {
            fields: ['username'],
            unique: true,
            name: 'idx_users_username',
        },
        {
            fields: ['last_seen'],
            name: 'idx_users_last_seen',
        },
        {
            fields: ['name'],
            name: 'idx_users_name',
        },
    ],
});

User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.pin_code;
    delete values.pin_code_expires;
    return values;
};

User.findByEmail = async function(email) {
    return await this.findOne({ where: { email } });
};

User.findByUsername = async function(username) {
    return await this.findOne({ where: { username } });
};


User.prototype.getLastSeenFormatted = function() {
  if (!this.last_seen) return 'недавно';
  
  const now = new Date();
  const last = new Date(this.last_seen);
  const diffMs = now - last;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return 'вчера';
  return `${diffDays} дн. назад`;
};

export default User;
export {User}