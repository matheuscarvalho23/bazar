import { BadRequestException } from '@nestjs/common'
import type { CreateProductImageDto } from '../dto/create-product-image.dto'
import type { INormalizedProductImage } from '../interfaces/normalized-product-image.interface'

/**
 * Normalize and validate product image ordering and main-image flags.
 *
 * @param images - Product image DTOs : CreateProductImageDto[]
 *
 * @returns Normalized product images : INormalizedProductImage[]
 */
export function normalizeImages(images: CreateProductImageDto[]): INormalizedProductImage[] {
  if (images.length === 0) {
    throw new BadRequestException('At least one product image is required')
  }

  const indexedImages = images.map((image, index) => ({
    url: image.url.trim(),
    sortOrder: image.sortOrder ?? index,
    isMain: image.isMain ?? false,
    index,
  }))
  const sortedImages = indexedImages
    .sort(
      (leftImage, rightImage) =>
        leftImage.sortOrder - rightImage.sortOrder || leftImage.index - rightImage.index,
    )
    .map((image, index) => ({
      url: image.url,
      sortOrder: index,
      isMain: image.isMain,
    }))
  const mainImagesCount = sortedImages.filter((image) => image.isMain).length

  if (mainImagesCount > 1) {
    throw new BadRequestException('Only one main image is allowed')
  }

  if (mainImagesCount === 0 && sortedImages.length > 0) {
    sortedImages[0].isMain = true
  }

  return sortedImages
}
