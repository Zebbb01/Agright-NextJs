export default function ResponsesPage() {
    const responses = [
      { id: 1, form: 'Soil Survey', submitted: '2024-05-01', user: 'Juan Dela Cruz' },
      { id: 2, form: 'Crop Inspection', submitted: '2024-05-03', user: 'Maria Clara' },
    ];
  
    return (
      <>
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Form</th>
              <th className="border px-4 py-2">Submitted</th>
              <th className="border px-4 py-2">User</th>
            </tr>
          </thead>
          <tbody>
            {responses.map(resp => (
              <tr key={resp.id}>
                <td className="border px-4 py-2">{resp.form}</td>
                <td className="border px-4 py-2">{resp.submitted}</td>
                <td className="border px-4 py-2">{resp.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
  