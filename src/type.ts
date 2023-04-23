
export interface result {
  projectName?: string
  sameProjectDir?: boolean
  pickPresets?: string
}

export interface presets {
  title: string
  value: string
}

export interface executeType extends result {
  git?: string
  defaultProjectName: string
}
