export enum PropertyState {
  DRAFT = "BORRADOR",
  PENDING = "EN REVISIÓN",
  ACTIVE = "PUBLICADO",
}

export enum PropertyType {
  APARTMENT = "DEPARTAMENTOS",
  HOUSE = "CASAS",
}

export enum PropertyPhase {
  PLANOS = "PLANOS",
  CONSTRUCCION = "EN CONSTRUCCIÓN",
  READY = "ENTREGA INMEDIATA",
}

export enum Permissions {
  GENERAR_REPORTE = "GENERAR_REPORTE",
  VER_DICOMS = "VER_DICOMS",
  ADMINISTRAR_USUARIOS = "ADMINISTRAR_USUARIOS",
  CARGAR_DICOM = "CARGAR_DICOM",
}

export enum PropertyCurrency {
  SOLES = "SOLES",
  DOLARES = "DOLARES",
}
