/** Dependencies **/
import * as fs from 'fs';
import path from 'path';
import type { HelperDeclareSpec } from 'handlebars';

import { inline } from '@css-inline/css-inline';
import * as glob from 'glob';
import * as handlebars from 'handlebars';
import { get } from 'lodash';

/** Interfaces **/
import type { MailerOptions } from '../interfaces/mailer-options.interface';
import type { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface';
import type { TemplateAdapter } from '../interfaces/template-adapter.interface';

export class HandlebarsAdapter implements TemplateAdapter {
  private precompiledTemplates: Record<string, handlebars.TemplateDelegate> = {};

  private config: TemplateAdapterConfig = {
    inlineCssOptions: {},
    inlineCssEnabled: true,
  };

  constructor(helpers?: HelperDeclareSpec, config?: TemplateAdapterConfig) {
    handlebars.registerHelper('concat', (...args) => {
      args.pop();
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return args.join('');
    });
    handlebars.registerHelper(helpers || {});
    Object.assign(this.config, config);
  }

  public compile(mail: any, callback: any, mailerOptions: MailerOptions): void {
    const precompile = (template: any, precompileCallback: any, options: any) => {
      const templateBaseDir = get(options, 'dir', '');
      const templateExt = path.extname(template) || '.hbs';
      let templateName = path.basename(template, path.extname(template));
      const templateDir = path.isAbsolute(template)
        ? path.dirname(template)
        : path.join(templateBaseDir, path.dirname(template));
      const templatePath = path.join(templateDir, templateName + templateExt);
      templateName = path.relative(templateBaseDir, templatePath).replace(templateExt, '');

      if (!this.precompiledTemplates[templateName]) {
        try {
          const templateContent = fs.readFileSync(templatePath, 'utf8');

          this.precompiledTemplates[templateName] = handlebars.compile(
            templateContent,
            get(options, 'options', {}),
          );
        } catch (error) {
          return precompileCallback(error);
        }
      }

      return {
        templateExt,
        templateName,
        templateDir,
        templatePath,
      };
    };

    const { templateName } = precompile(mail.data.template, callback, mailerOptions.template);

    const runtimeOptions = get(mailerOptions, 'options', {
      partials: false,
      data: {},
    });

    if (runtimeOptions.partials) {
      const partialPath = path
        .join(runtimeOptions.partials.dir, '**', '*.hbs')
        .replaceAll('\\', '/');

      const files = glob.sync(partialPath);

      for (const file of files) {
        const { templateName: partialTemplateName, templatePath } = precompile(
          file,
          // eslint-disable-next-line @/no-empty-function
          () => {},
          runtimeOptions.partials,
        );
        const templateDir = path.relative(runtimeOptions.partials.dir, path.dirname(templatePath));
        handlebars.registerPartial(
          path.join(templateDir, partialTemplateName),
          fs.readFileSync(templatePath, 'utf8'),
        );
      }
    }

    const rendered = this.precompiledTemplates[templateName](mail.data.context, {
      ...runtimeOptions,
      partials: this.precompiledTemplates,
    });

    if (this.config.inlineCssEnabled) {
      try {
        mail.data.html = inline(rendered, this.config.inlineCssOptions);
      } catch (error) {
        callback(error);
      }
    } else {
      mail.data.html = rendered;
    }

    return callback();
  }
}
