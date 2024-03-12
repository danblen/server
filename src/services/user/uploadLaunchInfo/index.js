export default async (req) => {
  const { launchInfo } = req.body;

  return { data: launchInfo };
};
