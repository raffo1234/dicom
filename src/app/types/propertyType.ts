type Typology = {
  name: string;
  description: string;
  price: string;
  size: string;
  stock: string;
  bathroom_count: string;
  bedroom_count: string;
};

export type PropertyType = {
  id: string;
  title: string;
  user_id: string;
  bathroom_count?: string;
  bedroom_count?: string;
  description?: string;
  phase?: string;
  delivery_at?: Date | number | string;
  price?: string;
  location?: string;
  property_image?: {
    id: string;
    image_url: string;
  }[];
  user: {
    id: string;
    name: string;
    email: string;
    image_url: string;
  };
  company: {
    id: string;
    name: string;
    logo_url: string;
  };
  typologies?: Typology[];
};
