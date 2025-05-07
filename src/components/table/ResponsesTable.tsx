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

const responses = [
  {
    date: "2025-04-30",
    "block": ["1", "2"],
    "terrain": "15",
    "farm-name": "Katipunan",
    "encoder-name": "Ronald Bahan",
    "upload-photo": "diseases/images/IMG_4256 - Jessve D. Daypuyart.jpeg",
    "types-of-diseases": "Mosaic virus",
    latitude: 7.08112500,
    longitude: 125.61072500,
  },
  {
    date: "2025-04-28",
    "block": ["3","1", "2"],
    "terrain": "16",
    "farm-name": "Golden Cacao",
    "encoder-name": "Jessica Reyes",
    "upload-photo": "diseases/images/img_4021.jpeg",
    "types-of-diseases": "Black Pod",
    latitude: 7.10200000,
    longitude: 125.61230000,
  },
];

export default function ResponsesTable() {
  return (
    <Table>
      <TableCaption>A list of recent cacao disease scan responses.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Encoder Name</TableHead>
          <TableHead>Farm Name</TableHead>
          <TableHead>Terrain</TableHead>
          <TableHead>Type of Disease</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Image Upload</TableHead>
          <TableHead>Blocks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {responses.map((res, index) => (
        <TableRow key={index}>
            <TableCell>{res.date}</TableCell>
            <TableCell>{res["encoder-name"]}</TableCell>
            <TableCell>{res["farm-name"]}</TableCell>
            <TableCell>{res.terrain}</TableCell>
            <TableCell>{res["types-of-diseases"]}</TableCell>
            <TableCell>{res.latitude}, {res.longitude}</TableCell>
            <TableCell>
            <a
                href={`/${res["upload-photo"]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block"
            >
                {res["upload-photo"].split("/").pop()}
            </a>
            </TableCell>
            <TableCell>{res.block.sort((a, b) => Number(a) - Number(b)).join(", ")}</TableCell>
        </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={8}>Total Responses: {responses.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
