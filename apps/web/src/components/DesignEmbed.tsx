type DesignEmbedProps = {
  src: string;
  title: string;
};

/** Full-bleed wire of Claude design HTML artifacts into App Router pages. */
export function DesignEmbed({ src, title }: DesignEmbedProps) {
  return (
    <iframe
      src={src}
      title={title}
      className="h-[100dvh] w-full border-0 bg-white"
      allow="clipboard-write"
    />
  );
}
