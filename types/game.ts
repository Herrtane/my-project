export interface Game {
  appid: number;
  name: string;
  thumbnailUrl: string;
  priceInitial: number;
  priceFinal: number;
  discountPercent: number;
  reviewPercent: number | null;
  reviewCount: number;
  tags: string[];
}
