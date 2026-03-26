interface MapEmbedProps {
  address: string;
}

export default function MapEmbed({ address }: MapEmbedProps) {
  const query = encodeURIComponent(address);

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-border">
      <iframe
        src={`https://www.openstreetmap.org/search?query=${query}#map=15`}
        title={`Map showing ${address}`}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
