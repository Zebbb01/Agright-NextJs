export const forms = [
    {
      id: '1',
      date: "2025-05-01",
      name: "Cacao Disease Survey",
      details: "Survey form for detecting and reporting cacao diseases across farm blocks.",
    },
    {
      id: '2',
      date: "2025-04-27",
      name: "Pest Monitoring Form",
      details: "Tracks presence of cacao pests like mirid bugs and pod borers.",
    },
    {
      id: '3',
      date: "2025-04-20",
      name: "Fertilizer Application Log",
      details: "Records date, type, and quantity of fertilizer used on each plot.",
    },
    {
      id: '4',
      date: "2025-04-15",
      name: "Soil Health Check",
      details: "Tests for pH, nutrients, and microbial activity in soil.",
    },
    {
      id: '5',
      date: "2025-04-10",
      name: "Weed Assessment",
      details: "Survey of weed species and coverage in fields.",
    },
    {
      id: '6',
      date: "2025-04-05",
      name: "Climate Observation",
      details: "Records rainfall and temperature trends.",
    },
  ];

  export const formOptions = [
    // Form ID 1: Cacao Disease Survey
    { id: '1', formId: '1', label: 'Encoder Name', type: 'Text' },
    { id: '2', formId: '1', label: 'Farm Name', type: 'Text' },
    { id: '3', formId: '1', label: 'Type of Disease', type: 'Radio', options: ['DieBack', 'Fusarium', 'Moscow'] },
    { id: '4', formId: '1', label: 'Block', type: 'Checkbox', options: ['1', '2', '3'] },
    { id: '5', formId: '1', label: 'Upload Photo', type: 'Image Upload' },
    { id: '6', formId: '1', label: 'Terrain', type: 'File Upload' },
    { id: '7', formId: '1', label: 'Date', type: 'Date' },
    { id: '8', formId: '1', label: 'Latitude', type: 'Text' },
    { id: '9', formId: '1', label: 'Longitude', type: 'Text' },
  
    // Form ID 2: Pest Monitoring Form
    { id: '10', formId: '2', label: 'Inspector Name', type: 'Text' },
    { id: '11', formId: '2', label: 'Pest Type', type: 'Checkbox', options: ['Mirid Bug', 'Pod Borer', 'Mealybug'] },
    { id: '12', formId: '2', label: 'Severity', type: 'Radio', options: ['Low', 'Medium', 'High'] },
    { id: '13', formId: '2', label: 'Affected Block', type: 'Text' },
    { id: '14', formId: '2', label: 'Photo Evidence', type: 'Image Upload' },
    { id: '15', formId: '2', label: 'Inspection Date', type: 'Date' },
  
    // Form ID 3: Fertilizer Application Log
    { id: '16', formId: '3', label: 'Applied By', type: 'Text' },
    { id: '17', formId: '3', label: 'Fertilizer Type', type: 'Radio', options: ['Urea', 'Compost', 'NPK'] },
    { id: '18', formId: '3', label: 'Quantity (kg)', type: 'Text' },
    { id: '19', formId: '3', label: 'Application Date', type: 'Date' },
    { id: '20', formId: '3', label: 'Target Block', type: 'Text' },
  
    // Form ID 4: Soil Health Check
    { id: '21', formId: '4', label: 'Sampled By', type: 'Text' },
    { id: '22', formId: '4', label: 'Soil pH', type: 'Text' },
    { id: '23', formId: '4', label: 'Nitrogen Level', type: 'Text' },
    { id: '24', formId: '4', label: 'Microbial Activity', type: 'Radio', options: ['Low', 'Normal', 'High'] },
    { id: '25', formId: '4', label: 'Sample Date', type: 'Date' },
  
    // Form ID 5: Weed Assessment
    { id: '26', formId: '5', label: 'Surveyor Name', type: 'Text' },
    { id: '27', formId: '5', label: 'Weed Species Found', type: 'Checkbox', options: ['Cogon Grass', 'Mimosa', 'Crabgrass'] },
    { id: '28', formId: '5', label: 'Coverage (%)', type: 'Text' },
    { id: '29', formId: '5', label: 'Assessment Date', type: 'Date' },
  
    // Form ID 6: Climate Observation
    { id: '30', formId: '6', label: 'Observer', type: 'Text' },
    { id: '31', formId: '6', label: 'Temperature (°C)', type: 'Text' },
    { id: '32', formId: '6', label: 'Rainfall (mm)', type: 'Text' },
    { id: '33', formId: '6', label: 'Observation Date', type: 'Date' },
  ];
  