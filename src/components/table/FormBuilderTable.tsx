"use client";

import {
Table,
TableBody,
TableCaption,
TableCell,
TableFooter,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";

const forms = [
{
date: "2025-05-01",
name: "Cacao Disease Survey",
details: "Survey form for detecting and reporting cacao diseases across farm blocks.",
},
{
date: "2025-04-27",
name: "Pest Monitoring Form",
details: "Tracks presence of cacao pests like mirid bugs and pod borers.",
},
{
date: "2025-04-20",
name: "Fertilizer Application Log",
details: "Records date, type, and quantity of fertilizer used on each plot.",
},
];

export default function FormBuilderTable() {
return (
<Table>
<TableCaption>A list of recent form definitions created in the system.</TableCaption>
<TableHeader>
<TableRow>
<TableHead>Date</TableHead>
<TableHead>Form Name</TableHead>
<TableHead>Details</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{forms.map((form, index) => (
<TableRow key={index}>
<TableCell>{form.date}</TableCell>
<TableCell>{form.name}</TableCell>
<TableCell>{form.details}</TableCell>
</TableRow>
))}
</TableBody>
<TableFooter>
<TableRow>
<TableCell colSpan={3}>Total Forms: {forms.length}</TableCell>
</TableRow>
</TableFooter>
</Table>
);
}