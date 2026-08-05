import Image from "next/image";

type MarketingPhotoProps = {
  alt: string;
  label: string;
  src: string;
};

export function MarketingPhoto({ alt, label, src }: MarketingPhotoProps) {
  return (
    <figure className="hs-copy-media">
      <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 360px" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}
