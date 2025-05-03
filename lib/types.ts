export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  folder: string
  tags: string[]
}

export interface Folder {
  id: string
  name: string
  path: string
}

export interface Tag {
  id: string
  name: string
}
