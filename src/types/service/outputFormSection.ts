export class EmailOutputFormSection {
  title?: string;
  description?: string;
  formItems: EmailOutputFormItem[];

  constructor(data: Partial<EmailOutputFormSection>) {
    this.title = data.title ?? '';
    this.description = data.description ?? '';
    this.formItems = data.formItems ?? [];
  }

  get allFormSectionItemPaths(): string[] {
    return this.formItems.map((item) => item.path);
  }

  get allRequiredFormSectionItemPaths(): string[] {
    return this.formItems
      .filter((item) => item.required)
      .map((item) => item.path);
  }
}

export interface EmailOutputFormItem {
  path: string;
  required?: boolean;
  placeholder?: string;
}
