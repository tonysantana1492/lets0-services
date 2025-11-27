import type { IUserWithSession } from '@/common/auth/interfaces/user-with-session.interface';
import type { IRequestDefault } from '@/common/request/interfaces/request.interface';

export interface IRequestWithUser extends IRequestDefault {
  user: IUserWithSession;
}
