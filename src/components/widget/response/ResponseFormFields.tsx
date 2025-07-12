// src/components/widget/response/ResponseFormFields.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { FormField, FormData } from "@/types/form"; // Assuming you have these types defined

interface ResponseFormFieldsProps {
  fields: FormField[];
  formData: FormData;
  handleChange: (label: string, value: string | string[]) => void;
  handleCheckboxChange: (label: string, option: string) => void;
  handleFileChange: (label: string, file: File | null) => void;
  uploading: { [key: string]: boolean };
  getImageTakenDate: (label: string) => string | null;
  isReadOnly: boolean;
}

/**
 * ResponseFormFields Component
 *
 * This component is responsible for rendering the dynamic form fields
 * based on the provided field definitions. It handles various input types
 * including text, date, radio, checkboxes, and file/image uploads,
 * managing their display and user interaction.
 *
 * @param {ResponseFormFieldsProps} props The properties for the component.
 * @returns {JSX.Element} The JSX element for the form fields.
 */
const ResponseFormFields: React.FC<ResponseFormFieldsProps> = ({
  fields,
  formData,
  handleChange,
  handleCheckboxChange,
  handleFileChange,
  uploading,
  getImageTakenDate,
  isReadOnly,
}) => {
  return (
    <>
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label className="text-lg font-semibold text-foreground">
            {field.label}
            {field.required && !isReadOnly && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>

          {field.type === "Text" && (
            <Input
              placeholder={`Enter ${field.label}`}
              value={formData[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          )}

          {field.type === "Date" && (
            <Input
              type="date"
              value={formData[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          )}

          {/* Radio Buttons in 2 Columns */}
          {field.type === "Radio" && field.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {field.options.map((opt) => (
                <div key={opt} className="flex items-center gap-2 ml-2 mb-2">
                  <input
                    type="radio"
                    name={field.label}
                    value={opt}
                    checked={formData[field.label] === opt}
                    onChange={() => handleChange(field.label, opt)}
                    style={{ accentColor: "var(--primary)" }}
                    className="w-4 h-4"
                    required={field.required && !formData[field.label]}
                    disabled={isReadOnly}
                  />
                  <Label className="text-sm">{opt}</Label>
                </div>
              ))}
            </div>
          )}

          {/* Checkboxes in 2 Columns */}
          {field.type === "Checkbox" && field.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {field.options.map((opt) => (
                <div key={opt} className="flex items-center gap-2 ml-2 mb-2">
                  <input
                    type="checkbox"
                    checked={(formData[field.label] || []).includes(opt)}
                    onChange={() => handleCheckboxChange(field.label, opt)}
                    style={{ accentColor: "var(--primary)" }}
                    className="w-4 h-4 rounded"
                    disabled={isReadOnly}
                  />
                  <Label className="text-sm">{opt}</Label>
                </div>
              ))}
            </div>
          )}

          {(field.type === "Image Upload" || field.type === "File Upload") && (
            <div>
              {!isReadOnly && (
                <Input
                  type="file"
                  accept={
                    field.type === "Image Upload"
                      ? "image/*"
                      : ".pdf, .doc, .docx, .xls, .xlsx, .csv"
                  }
                  onChange={(e) =>
                    handleFileChange(field.label, e.target.files?.[0] || null)
                  }
                  disabled={uploading[field.label]}
                  required={field.required}
                />
              )}
              {uploading[field.label] && (
                <div className="flex items-center gap-2 mt-2">
                  <Spinner />
                  <p className="text-sm text-blue-500">
                    Uploading {field.type.toLowerCase()}...
                  </p>
                </div>
              )}
              {formData[field.label] && typeof formData[field.label] === "string" && (
                <div className="mt-2">
                  {/* Determine if the URL is for an image or a general file */}
                  {(() => {
                    const value = formData[field.label];
                    const originalFilenameInValues = formData[`${field.label}OriginalFilename`];
                    const filename = originalFilenameInValues || value.split("/").pop();

                    const isImageResource = value.includes("/image/upload/");
                    const isRawResource = value.includes("/raw/upload/");
                    const fileExtension = filename?.split('.').pop()?.toLowerCase();
                    const isPDF = fileExtension === 'pdf';
                    const isDocument = ['doc', 'docx', 'xls', 'xlsx', 'csv'].includes(fileExtension || '');


                    if (isImageResource && !isPDF) { // Display as image if it's an image resource and not a PDF
                      const transformedUrl = value.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto/"
                      );
                      return (
                        <div>
                          <img
                            src={transformedUrl}
                            alt={`Uploaded ${field.label}`}
                            className="max-w-full h-auto max-h-48 object-contain rounded-md"
                          />
                          <div className="mt-2 space-y-1">
                            {!isReadOnly && (
                              <p className="text-xs text-green-600">
                                ✓ Image uploaded successfully. Location data will be
                                extracted and saved when you submit the form.
                              </p>
                            )}
                            {getImageTakenDate(field.label) && (
                              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                                <svg
                                  className="w-4 h-4 text-blue-500 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <div>
                                  <p className="text-xs font-medium text-blue-700">
                                    Photo taken:
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    {getImageTakenDate(field.label)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } else if (isRawResource || isPDF || isDocument) { // Treat as downloadable file if raw, PDF, or other document
                      let downloadUrl = value;

                      // Use split and join for precise insertion of fl_attachment
                      const uploadSegment = isRawResource ? "/raw/upload/" : "/image/upload/"; // Determine correct segment to target
                      const parts = value.split(uploadSegment);

                      if (parts.length > 1) {
                        // Insert "fl_attachment/" right after the upload segment
                        downloadUrl = `${parts[0]}${uploadSegment}fl_attachment/${parts[1]}`;
                      }
                      // If uploadSegment isn't found, fallback to original value (shouldn't happen for Cloudinary URLs)


                      return (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-gray-600 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            ></path>
                          </svg>
                          <p className="text-sm text-blue-600">
                            <a
                              href={downloadUrl} // Use the transformed URL for download
                              download={filename} // This attribute suggests the filename
                              rel="noopener noreferrer" // Keep for security
                              className="underline hover:text-blue-800"
                            >
                              {filename}
                            </a>
                          </p>
                        </div>
                      );
                    }
                    // Default return if it's a string but not a recognized Cloudinary URL
                    return <p className="text-sm text-gray-700">{String(value)}</p>;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default ResponseFormFields;
