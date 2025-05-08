'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formOptions } from '@/data/form';

interface ResponsePanelProps {
  formId: string;
  setIsOpen: (open: boolean) => void;
}

export default function ResponsePanel({ formId, setIsOpen }: ResponsePanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fields = formOptions.filter(option => option.formId === formId);

  const handleChange = (label: string, value: any) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const handleCheckboxChange = (label: string, value: string) => {
    const existing: string[] = formData[label] || [];
    handleChange(
      label,
      existing.includes(value)
        ? existing.filter(v => v !== value)
        : [...existing, value]
    );
  };

  const handleFileChange = (label: string, file: File | null) => {
    handleChange(label, file);
  };

  const handleCreateResponse = () => {
    console.log('Response Submitted for Form ID', formId, formData);
    setFormData({});
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow-md mb-6">
      {fields.map(field => (
        <div key={field.id} className="space-y-2">
          <Label>{field.label}</Label>

          {field.type === 'Text' && (
            <Input
              placeholder={`Enter ${field.label}`}
              value={formData[field.label] || ''}
              onChange={e => handleChange(field.label, e.target.value)}
            />
          )}

          {field.type === 'Date' && (
            <Input
              type="date"
              value={formData[field.label] || ''}
              onChange={e => handleChange(field.label, e.target.value)}
            />
          )}

          {field.type === 'Radio' &&
            field.options?.map(opt => (
              <div key={opt} className="flex items-center gap-2 ml-2">
                <input
                  type="radio"
                  name={field.label}
                  value={opt}
                  checked={formData[field.label] === opt}
                  onChange={() => handleChange(field.label, opt)}
                />
                <Label className="text-sm">{opt}</Label>
              </div>
            ))}

          {field.type === 'Checkbox' &&
            field.options?.map(opt => (
              <div key={opt} className="flex items-center gap-2 ml-2">
                <input
                  type="checkbox"
                  checked={(formData[field.label] || []).includes(opt)}
                  onChange={() => handleCheckboxChange(field.label, opt)}
                />
                <Label className="text-sm">{opt}</Label>
              </div>
            ))}

          {(field.type === 'Image Upload' || field.type === 'File Upload') && (
            <Input
              type="file"
              accept={field.type === 'Image Upload' ? 'image/*' : '*'}
              onChange={e => handleFileChange(field.label, e.target.files?.[0] || null)}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreateResponse}>Save Response</Button>
      </div>
    </div>
  );
}
