export interface Settings {
  readonly catlight: CatLightSettings;
  readonly http: HttpSettings;
}

export interface CatLightSettings {
  readonly installationId: string;
}

export interface HttpSettings {
  readonly port: number;
}
