export interface Settings {
  readonly catlight: CatLightSettings;
  readonly http: HttpSettings;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CatLightSettings {}

export interface HttpSettings {
  readonly port: number;
}
