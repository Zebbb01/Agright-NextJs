"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { forms } from "@/data/form";

export default function FormSelector() {
  const router = useRouter();

  const handleSelectForm = (formId: string) => {
    router.push(`/dashboard/responses?formId=${formId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">
        Choose a Form to Respond
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {forms.map((form) => (
          <Card
            key={form.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => handleSelectForm(form.id)}
          >
            <CardContent className="p-6">
              <h3 className="font-medium text-lg">{form.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
