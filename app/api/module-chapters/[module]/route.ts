import { NextResponse } from 'next/server'
import { anatomieS1Chapters } from '@/lib/content/euromed-s1-anatomie'
import { anatomieS1ExtraChapters } from '@/lib/content/euromed-s1-anatomie-extra'
import { biologieS1Chapters } from '@/lib/content/euromed-s1-biologie'
import { chimieBiochimieS1Chapters } from '@/lib/content/euromed-s1-chimie-biochimie'
import { methodologieS1Chapters } from '@/lib/content/euromed-s1-methodologie'
import { santePubliqueS1Chapters } from '@/lib/content/euromed-s1-sante-publique'

export const dynamic = 'force-dynamic'

const moduleChapters = {
  'anatomie-1-s1': [...anatomieS1Chapters, ...anatomieS1ExtraChapters],
  'biologie-1-s1': biologieS1Chapters,
  'chimie-biochimie-1-s1': chimieBiochimieS1Chapters,
  'methodologie-1-s1': methodologieS1Chapters,
  'sante-publique-1-s1': santePubliqueS1Chapters,
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  const { module } = await params
  const chapters = moduleChapters[module as keyof typeof moduleChapters] ?? []

  return NextResponse.json(
    { chapters },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
