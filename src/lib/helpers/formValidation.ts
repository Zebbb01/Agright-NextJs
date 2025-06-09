// lib/helpers/formValidation.ts (or similar)
import { prisma } from "@/lib/prisma"; // Assuming prisma is accessible

export async function validateFormValues(formId: number, values: Record<string, any>) {
  const formFields = await prisma.formOption.findMany({
    where: { formId: formId },
  });

  const errors: string[] = [];

  for (const field of formFields) {
    if (field.required) {
      const value = values[field.label];
      let isEmpty = false;

      if (field.type === "Checkbox") {
        isEmpty = !Array.isArray(value) || value.length === 0;
      } else if (field.type === "Image Upload" || field.type === "File Upload") {
        isEmpty = typeof value !== 'string' || value.trim() === '';
      } else {
        isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
      }

      if (isEmpty) {
        errors.push(`'${field.label}' is a required field.`);
      }
    }
  }
  return errors; // Return array of errors
}
