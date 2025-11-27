declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Module {
      hot?: {
        accept(): void;
        dispose(callback: (data: any) => void): void;
      };
    }
  }
}

export {};
