import { Types } from 'mongoose';

export const DatabaseDefaultObjectId = () => new Types.ObjectId();

export { v4 as DatabaseDefaultUUID } from 'uuid';
