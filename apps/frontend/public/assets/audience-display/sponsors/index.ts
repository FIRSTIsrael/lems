const importImages = (requireContext: any) => {
  //RequireContext is not exported (webpack) so we ned to use any
  const images: { [key: string]: string } = {};
  requireContext.keys().map((item: string) => {
    images[item.replace('./', '')] = requireContext(item);
  });
  return images;
};

const sponsorImages = importImages(require.context('./', false, /\.(webp|svg)$/));

export default sponsorImages;
