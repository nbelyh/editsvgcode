// svg-schema.js is a large auto-generated data file, keep as JS
// Regenerate with: node scripts/generate-schema.cjs
declare module '../svg-schema' {
  interface SvgAttribute {
    name: string;
    detail?: string;
    description?: string;
    maxOccurs?: string;
    options?: string[] | null;
    deprecated?: boolean;
    colorAttribute?: boolean;
  }

  interface SvgElement {
    name: string;
    detail: string;
    description: string;
    deprecated?: boolean;
    elements?: string[];
    attributes?: SvgAttribute[];
  }

  interface PathCommand {
    name: string;
    insert: string;
    description: string;
  }

  interface SvgSchemaType {
    [elementName: string]: SvgElement;
    __pathCommands: PathCommand[];
    __colorNames: string[];
  }

  export const SvgSchema: SvgSchemaType;
}
