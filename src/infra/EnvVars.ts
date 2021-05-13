interface EnvVarOptions {
  allowEmptyString: boolean;
}

export class EnvVars {
  public static getString(
    envVarName: string,
    options: EnvVarOptions = { allowEmptyString: false }
  ): string {
    const value = process.env[envVarName];
    if (value === undefined) {
      throw new Error(`ENV VAR "${envVarName}" is not set`);
    }

    if (value === '' && !options.allowEmptyString) {
      throw new Error(`ENV VAR "${envVarName}" has empty value ""`);
    }

    return value;
  }

  public static getInteger(envVarName: string): number {
    const strValue = this.getString(envVarName);
    return EnvVars.parseIntOrThrow(envVarName, strValue);
  }

  public static getArray(envVarName: string): string[] {
    const strValue = this.getString(envVarName, { allowEmptyString: true });
    return this.parseArray(strValue);
  }

  public static getJson<T>(envVarName: string): T {
    const strValue = this.getString(envVarName);
    return JSON.parse(strValue) as unknown as T;
  }

  public static getOptionalJson<T>(envVarName: string, defaultValue: T): T {
    const strValue = this.getOptionalString(envVarName, '');
    if (!strValue) {
      return defaultValue;
    }
    return JSON.parse(strValue) as unknown as T;
  }

  public static getOptionalBool(envVarName: string, defaultValue: boolean = false): boolean {
    const value = process.env[envVarName];
    if (value === undefined) {
      return defaultValue;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    throw new Error(`Invalid value for ${envVarName}. Expected boolean, but got "${value}"`);
  }

  public static getOptionalInteger(envVarName: string, defaultValue: number): number {
    const value = process.env[envVarName];
    if (value === undefined) {
      return defaultValue;
    }
    return EnvVars.parseIntOrThrow(envVarName, value);
  }

  public static getOptionalString(envVarName: string, defaultValue: string): string {
    const value = process.env[envVarName];
    if (value === undefined) {
      return defaultValue;
    }
    return value;
  }

  public static getOptionalArray(envVarName: string, defaultValue: string[]): string[] {
    const value = process.env[envVarName];
    if (value === undefined) {
      return defaultValue;
    }
    return this.parseArray(value);
  }

  private static parseIntOrThrow(envVarName: string, value: string): number {
    const result = Number(value); // returns NaN when string is not a valid number
    if (Number.isNaN(result)) {
      throw new Error(`Invalid value for ${envVarName}. Expected integer, but got "${value}"`);
    }

    if (!Number.isInteger(result)) {
      throw new Error(`Invalid value for ${envVarName}. Expected integer, but got "${value}"`);
    }

    return result;
  }

  private static parseArray(arrayAsString: string): string[] {
    return arrayAsString.split(',').filter((item) => Boolean(item));
  }
}
