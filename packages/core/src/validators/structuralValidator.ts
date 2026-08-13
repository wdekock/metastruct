import Ajv2020, { ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { Violation } from '../laws/types.js';

const ajv = new Ajv2020.default({ allErrors: true, strict: false });
addFormats.default(ajv);

export class StructuralValidator {
  private validators: Map<string, ValidateFunction> = new Map();

  public registerSchema(schemaId: string, schemaObj: object): void {
    const validate = ajv.compile(schemaObj);
    this.validators.set(schemaId, validate);
  }

  public validate(schemaId: string, data: unknown, specType: Violation['specType']): Violation[] {
    const validate = this.validators.get(schemaId);
    if (!validate) {
      throw new Error(`Schema ID '${schemaId}' is not registered in StructuralValidator.`);
    }

    const valid = validate(data);
    if (valid) return [];

    return (validate.errors || []).map((err) => ({
      code: 'STR-001',
      path: err.instancePath || '/',
      message: err.message || 'Structural validation failed',
      specType,
    }));
  }
}