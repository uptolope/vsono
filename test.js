const cookie = 'fa7f3196c967622f305da9a742a3610c244599d7665b0ac92524e9e0cd5889a1%7Cca7cd908e9659cf351be744edc56e070f23b29e2c6bb09bf2ebbdbf65f8c5106';

fetch('http://localhost:3000/api/dashboard/stats', { 
  credentials: 'include',
  headers: {
    'Cookie': cookie
  }
})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error('Error:', e))
