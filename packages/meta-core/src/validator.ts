import Ajv from "ajv";
import addFormats from "ajv-formats";

export class MetaCoreValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  public validateLayer(layerSchema: object, data: object): { valid: boolean; errors: any[] } {
    const validate = this.ajv.compile(layerSchema);
    const valid = validate(data);
    return {
      valid: !!valid,
      errors: validate.errors || []
    };
  }
}
