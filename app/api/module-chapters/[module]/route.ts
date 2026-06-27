import { NextResponse } from 'next/server'
import { anatomieS1Chapters } from '@/lib/content/euromed-s1-anatomie'
import { anatomieS1ExtraChapters } from '@/lib/content/euromed-s1-anatomie-extra'
import { biologieS1Chapters } from '@/lib/content/euromed-s1-biologie'
import { chimieBiochimieS1Chapters } from '@/lib/content/euromed-s1-chimie-biochimie'
import { methodologieS1Chapters } from '@/lib/content/euromed-s1-methodologie'
import { santePubliqueS1Chapters } from '@/lib/content/euromed-s1-sante-publique'
import { anatomieS2Chapters } from '@/lib/content/euromed-s2-anatomie-2-s2'
import { biophysiqueS2Chapters } from '@/lib/content/euromed-s2-biophysique-s2'
import { histologieEmbryologieS2Chapters } from '@/lib/content/euromed-s2-histologie-embryologie-1-s2'
import { histoirePsychoSocioS2Chapters } from '@/lib/content/euromed-s2-histoire-psycho-socio-s2'
import { techniquesCommunicationS2Chapters } from '@/lib/content/euromed-s2-techniques-communication-s2'
import { cahierExamensS2Chapters } from '@/lib/content/euromed-s2-cahier-examens-s2'
import type { Chapter } from '@/lib/content/types'
import { getWordPressChapters } from '@/lib/wordpress'

export const dynamic = 'force-dynamic'

const moduleChapters = {
  'anatomie-1-s1': [...anatomieS1Chapters, ...anatomieS1ExtraChapters],
  'biologie-1-s1': biologieS1Chapters,
  'chimie-biochimie-1-s1': chimieBiochimieS1Chapters,
  'methodologie-1-s1': methodologieS1Chapters,
  'sante-publique-1-s1': santePubliqueS1Chapters,
  'anatomie-2-s2': anatomieS2Chapters,
  'biophysique-s2': biophysiqueS2Chapters,
  'histologie-embryologie-1-s2': histologieEmbryologieS2Chapters,
  'histoire-psycho-socio-s2': histoirePsychoSocioS2Chapters,
  'techniques-communication-s2': techniquesCommunicationS2Chapters,
  'cahier-examens-s2': cahierExamensS2Chapters,
}

function keepOnlyOriginalSupports(chapters: Chapter[]): Chapter[] {
  return chapters
    .filter((chapter) =>
      Boolean(
        chapter.sourceUrl ||
          chapter.sourcePages?.length ||
          chapter.models3D?.length ||
          chapter.model3D,
      ),
    )
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      professor: chapter.professor,
      sourceUrl: chapter.sourceUrl,
      sourceLabel: chapter.sourceLabel,
      sourcePages: chapter.sourcePages,
      sourcePagesTitle: chapter.sourcePages?.length ? 'Support de cours' : chapter.sourcePagesTitle,
      sourcePagesSubtitle: chapter.sourcePages?.length
        ? `${chapter.sourcePages.length} pages du support original`
        : chapter.sourcePagesSubtitle,
      model3D: chapter.model3D,
      models3D: chapter.models3D?.map((model) => ({
        title: model.title,
        src: model.src,
        viewer: model.viewer,
      })),
      keyPoints: [],
      sections: [],
    }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  const { module } = await params
  const staticChapters = moduleChapters[module as keyof typeof moduleChapters] ?? []
  const wordpressChapters = await getWordPressChapters(module)
  const chapters = keepOnlyOriginalSupports([...staticChapters, ...wordpressChapters])

  return NextResponse.json(
    { chapters },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
