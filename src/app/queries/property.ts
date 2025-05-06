export const propertyQuery = `
  id,
  title,
  user_id,
  property_image (
    id,
    image_url
  ),
  user!property_user_id_fkey (
    id,
    name,
    email,
    image_url
  ),
  company!property_company_id_fkey (
    id,
    name,
    logo_url
  )
`;

export const favoriteQuery = `
  property(
    id,
    title,
    user_id,
    property_image (
      id,
      image_url
    ),
    user!property_user_id_fkey (
      id,
      name,
      email,
      image_url
    ),
    company!property_company_id_fkey (
      id,
      name,
      logo_url
    )
  )
`;
