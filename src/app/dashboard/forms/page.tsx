export default function FormsPage() {
    const forms = [
      { id: 1, name: 'Soil Survey Form', created: '2024-04-01' },
      { id: 2, name: 'Crop Inspection Form', created: '2024-04-12' },
    ];
  
    return (
      <>
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Date Created</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id}>
                <td className="border px-4 py-2">{form.name}</td>
                <td className="border px-4 py-2">{form.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
  