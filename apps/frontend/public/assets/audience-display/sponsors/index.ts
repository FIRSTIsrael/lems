const importImages = (requireContext: any) => {
  //TODO: RequireContext is not exported
  const images: { [key: string]: string } = {};
  requireContext.keys().map((item: string) => {
    images[item.replace('./', '')] = requireContext(item);
  });
  return images;
};

const sponsorImages = importImages(require.context('./', false, /\.(webp|svg)$/));

export default sponsorImages;
