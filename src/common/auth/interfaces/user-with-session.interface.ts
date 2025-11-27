import type { SessionDoc } from '@/common/session/repository/entities/session.entity';
import type { UserDoc } from '@/common/user/repository/entities/user.entity';

export interface IUserWithSession extends UserDoc {
  session: SessionDoc;
}
