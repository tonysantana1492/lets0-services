import type { IDocConfigInterface } from '@/common/app-config/interfaces/doc.config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'doc',
  (): IDocConfigInterface => ({
    name: `${process.env.APP_NAME} APIs Specification`,
    description: 'Section for describe whole APIs',
    version: '1.0',
    prefix: '/docs',
    user: process.env.SWAGGER_USER ?? '',
    password: process.env.SWAGGER_PASSWORD ?? '',
  }),
);
