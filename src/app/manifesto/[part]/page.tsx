import { notFound } from 'next/navigation';
import { getPartBySlug, getAllSlugs } from '../content';
import { ManifestoPartClient } from './client';

type Props = {
  params: Promise<{ part: string }>;
};

export default async function ManifestoPartPage({ params }: Props) {
  const { part: slug } = await params;
  const part = getPartBySlug(slug);

  if (!part) {
    notFound();
  }

  return <ManifestoPartClient slug={slug} />;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ part: slug }));
}
