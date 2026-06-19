export interface KeyPoint { text: string }
export interface ContentSection { heading: string; body: string }
export interface CoursePage { imageUrl: string; alt: string }
export interface CourseModel3D { title: string; description?: string; src: string; viewer?: 'membre-superieur-v4' }
export interface Chapter {
  id: string
  title: string
  professor: string
  sourceUrl?: string
  sourceLabel?: string
  sourcePages?: CoursePage[]
  sourcePagesTitle?: string
  sourcePagesSubtitle?: string
  model3D?: 'thorax'
  models3D?: CourseModel3D[]
  keyPoints: KeyPoint[]
  sections: ContentSection[]
}
