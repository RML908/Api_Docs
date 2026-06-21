import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../DST_API_DOCS.Domain/constants/DomainConstants';

export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  isStrong(password: string): boolean {
    // Minimum 8 chars, at least one letter, one number
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  }
}
