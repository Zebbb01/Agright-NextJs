// lib/constants/prismaIncludes.ts
export const responseInclude = {
  user: true,
  form: true,
  imageUpload: {
    // Removed the conflicting 'include: { location: true }'
    select: { // All selections for imageUpload and its nested relations go here
      id: true,
      secureUrl: true,
      originalFilename: true,
      location: { // This correctly selects fields from the nested location
        select: {
          latitude: true,
          longitude: true,
          takenAt: true,
        },
      },
    },
  },
};
