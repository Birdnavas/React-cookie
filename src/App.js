import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [myList, setMyList] = useState([]);
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    const cookieValue = Cookies.get('myList');
    const parsedList = cookieValue ? JSON.parse(cookieValue) : [];
    setMyList(parsedList);
  }, []);

  useEffect(() => {
    // Calculate and update the total sum whenever myList changes
    const sum = myList.reduce((acc, row) => acc + row.price * row.amount, 0);
    setTotalSum(sum);
  }, [myList]);

  const addItem = () => {
    const id = myList.length + 1;
    const product = prompt('Enter a product:');
    const price = prompt('Enter a price:');
    const amount = prompt('Enter an amount:');
    if (product && price && amount) {
      const newRow = { id, product, price: parseFloat(price), amount: parseFloat(amount) };
      const updatedList = [...myList, newRow];
      setMyList(updatedList);
      Cookies.set('myList', JSON.stringify(updatedList), { expires: 7 });
    }
  };

  const removeItem = (id) => {
    const updatedList = myList.filter((item) => item.id !== id);
    setMyList(updatedList);
    Cookies.set('myList', JSON.stringify(updatedList), { expires: 7 });
  };

  const deleteAllItems = () => {
    setMyList([]);
    Cookies.remove('myList');
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {myList.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.product}</td>
              <td>{row.price}</td>
              <td>{row.amount}</td>
              <td>
                <button onClick={() => removeItem(row.id)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total: ${totalSum.toFixed(2)}</p> {/* Display the total sum */}
      <button onClick={addItem}>Add</button>
      <button onClick={deleteAllItems}>Clear</button>
    </div>
  );
}

export default App;
