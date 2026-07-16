import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map((image, index) => {
          return (
            <div
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden rounded-base bg-fog"
              id={image.id}
            >
              {!!image.url && (
                // Product photos are ALWAYS full color (img-product) — real
                // brand colors are load-bearing for trust (design §7).
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="img-product absolute inset-0"
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
