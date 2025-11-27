export interface IContextService {
  setContextId(contextId: string): void;
  getContextId(): string | undefined;
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
}
