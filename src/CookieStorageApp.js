import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CookieStorageApp = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    // Load data from cookies when the component mounts
    const storedData = Cookies.getJSON('userData') || [];
    setData(storedData);
  }, []);

  const handleAddData = () => {
    // Add new data to the array and store it in cookies
    const newData = { id, name };
    const updatedData = [...data, newData];
    Cookies.set('userData', updatedData);
    setData(updatedData);
    setId('');
    setName('');
  };

  return (
    <div>
      <h1>Cookie Storage App</h1>
      <div>
        <label>ID:</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button onClick={handleAddData}>Add Data</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CookieStorageApp;
