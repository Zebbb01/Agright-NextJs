// lib/constants/prismaIncludes.ts
export const responseInclude = {
  user: true,
  form: true,
  imageUpload: {
    include: {
      location: true,
    },
  },
};
