import { useObjectUrl } from '@/hooks/use-object-url';
import { cn } from '@/lib/utils';

/** Photo (from a local Blob) or the default symbol for a card. */
export function CardPicture({
  image,
  emoji,
  alt,
  className,
  emojiClassName,
}: {
  image?: Blob;
  emoji?: string;
  alt: string;
  className?: string;
  emojiClassName?: string;
}) {
  const url = useObjectUrl(image);
  if (image && url) {
    return <img src={url} alt={alt} className={cn('h-full w-full object-cover', className)} draggable={false} />;
  }
  return (
    <span role="img" aria-label={alt} className={cn('leading-none select-none', emojiClassName)}>
      {emoji || '·'}
    </span>
  );
}
