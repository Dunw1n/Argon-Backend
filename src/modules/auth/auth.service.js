// src/modules/auth/auth.service.js
import bcrypt from 'bcryptjs';
import userRepository from '../users/user.repository.js';
import emailService from '../../shared/email/email.service.js';
import { generateToken } from '../../shared/utils/jwt.js';
import User from '../users/user.model.js';

class AuthService {
  generatePinCode() {
    return Math.floor(100000 + Math.random() * 1000000).toString();
  }
  
async register(userData) {
  const { email, password, name } = userData;
  
  console.log('📝 REGISTER START:', { email, password, name });
  
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email already exists');
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('🔐 Password hashed:', {
    original: password,
    originalLength: password.length,
    hash: hashedPassword,
    hashLength: hashedPassword.length
  });
  
  // Проверяем сразу
  const testVerify = await bcrypt.compare(password, hashedPassword);
  console.log('✅ Immediate verification test:', testVerify);
  
  const pinCode = this.generatePinCode();
  const pinCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  
  const user = await userRepository.create({
    email,
    password: hashedPassword,
    name,
    pin_code: pinCode,
    pin_code_expires: pinCodeExpires,
    is_verified: false,
  });
  
  console.log('✅ User created:', { id: user.id, email: user.email });
  
  // Проверяем сохраненный пароль
  const savedUser = await userRepository.findByEmail(email);
  console.log('🔐 Saved user password hash:', savedUser.password);
  
  const finalVerify = await bcrypt.compare(password, savedUser.password);
  console.log('✅ Final verification after save:', finalVerify);
  
  await emailService.sendPinCodeEmail(email, pinCode, true);
  
  return {
    message: 'Код подтверждения отправлен на почту',
    userId: user.id,
    requiresPin: true,
  };
}
  
  async login(email, password) {
    console.log('🔐 LOGIN START:', { email, password });
  
  const user = await userRepository.findByEmail(email);
  if (!user) {
    console.log('❌ User not found');
    throw new Error('Invalid credentials');
  }
  
  console.log('✅ User found:', {
    id: user.id,
    email: user.email,
    is_verified: user.is_verified,
    storedHash: user.password,
    hashLength: user.password?.length
  });
  
  // Проверяем через bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password);
  console.log('🔐 bcrypt.compare result:', isValidPassword);
  
  // Дополнительная проверка: хешируем введенный пароль и сравниваем
  const testHash = await bcrypt.hash(password, 10);
  console.log('Test hash of input password:', testHash);
  console.log('Direct comparison of hashes:', testHash === user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
    
    if (user.is_verified) {
      const token = generateToken({ userId: user.id, email: user.email });
      const userData = await userRepository.findById(user.id);
      
      return { user: userData, token, requiresPin: false };
    }
    
    const pinCode = this.generatePinCode();
    const pinCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    await user.update({
      pin_code: pinCode,
      pin_code_expires: pinCodeExpires,
    });
    
    await emailService.sendPinCodeEmail(email, pinCode, false);
    
    return {
      message: 'Код подтверждения отправлен на почту',
      userId: user.id,
      requiresPin: true,
    };
  }
  
  async verifyPin(userId, pinCode) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const fullUser = await User.findByPk(userId);
    
    if (fullUser.pin_code !== pinCode) {
      throw new Error('Неверный PIN-код');
    }
    
    if (new Date() > new Date(fullUser.pin_code_expires)) {
      throw new Error('PIN-код истек. Запросите новый');
    }
    
    await fullUser.update({
      is_verified: true,
      pin_code: null,
      pin_code_expires: null,
    });
    
    const token = generateToken({ userId: user.id, email: user.email });
    const userData = await userRepository.findById(userId);
    
    return { user: userData, token };
  }
  
  async resendPin(userId) {
    const fullUser = await User.findByPk(userId);
    if (!fullUser) {
      throw new Error('User not found');
    }
    
    const pinCode = this.generatePinCode();
    const pinCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    await fullUser.update({
      pin_code: pinCode,
      pin_code_expires: pinCodeExpires,
    });
    
    await emailService.sendPinCodeEmail(fullUser.email, pinCode, !fullUser.is_verified);
    
    return { message: 'Новый PIN-код отправлен на почту' };
  }
}

export default new AuthService();