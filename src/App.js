import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import smartContractRegistro from "./registro.json";
import Web3 from "web3";
import "./App.css";
//https://www.learnbestcoding.com/post/40/reactjs-form-submit
function App() {

  const [Metamask, setMetamask] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [accountshow, setAccountshow] = useState(null);
  const [balanceshow, setBalanceshow] = useState(null);
  const [contract, setContract] = useState();
  const [ListarInformacion, setListarInformacion] = useState([]);

  const conectarWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      try {
        await window.ethereum.enable();

        const accounts = await web3Instance.eth.getAccounts();
        console.log(accounts[0]);

        setAccount(accounts[0]);
        setAccountshow(accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4));

        const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
        const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
        console.log(balanceEth);

        setBalance(balanceEth);
        setBalanceshow(balanceEth.slice(0, 5));

        const contractInstance = new web3Instance.eth.Contract(
          smartContractRegistro,
          smartContractRegistro && "0x693E83B448934631659bB4B0F4D2D8387aa85Dc1"
        );
        setContract(contractInstance);
      } catch (error) {
        console.error(error);
      }
    } else {
      setMetamask(false);
    }
  };

  const ListarRegistros = async () => {

    if (contract) {
      try {
        const Counter = await contract.methods.productCount().call();

        let arrayTarea = [];

        for (let i = 0; i <= Counter; i++) {
          const infotarea = await contract.methods.products(i).call();

          if (infotarea) {
            const tarea = {
              id: infotarea.id,
              name: infotarea.name,
              price: infotarea.price,
              description: infotarea.description,
            };
            //console.log(tarea);
            arrayTarea.push(tarea);
          }
        };
        //console.log(arrayTarea);
        setListarInformacion(arrayTarea);

      } catch (error) {
        console.error('Error al actualizar valor:', error);
      }
    }
  };

  useEffect(() => {
    ListarRegistros();
  }, [contract]);

  useEffect(() => {
    conectarWallet();
    async function Wallet() {
      if (typeof window.ethereum !== "undefined") {
        console.log("Wallet: SI.");
        setMetamask(true);
      } else {
        console.log("Wallet: NO");
      }
    }
    Wallet();
  }, []);

  const [myList, setMyList] = useState([]);
  const [formData, setFormData] = useState({ product: '', price: '', amount: '1' });
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    const cookieValue = Cookies.get('myList');
    const parsedList = cookieValue ? JSON.parse(cookieValue) : [];
    setMyList(parsedList);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(formData);
  };

  const addItem = () => {
    const id = myList.length + 1;
    const { product, price, amount } = formData;
    if (product && price && amount) { // Check if all fields are filled
      const newRow = { id, product, price, amount };
      const updatedList = [...myList, newRow];
      setMyList(updatedList);
      Cookies.set('myList', JSON.stringify(updatedList), { expires: 7 });
      // Clear the form after adding an item
      setFormData({ product: '', price: '', amount: '1' });
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

  useEffect(() => {
    // Calculate and update the total sum whenever myList changes
    const sum = myList.reduce((acc, row) => acc + row.price * row.amount, 0);
    setTotalSum(sum);
  }, [myList]);

  return (
    <div>

      <form>
        <label>
          Product:
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Price:
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Amount:
          <input type="number" name="amount" onChange={handleInputChange} />

        </label>
        <button type="button" onClick={addItem}>
          Add
        </button>
      </form>

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

      <button onClick={deleteAllItems}>Clear</button>
      <p>Total: ${totalSum.toFixed(2)}</p>

      {ListarInformacion.filter((item) => item.id > 0).map((item) => (

        <div className="card" key={item.id}>
          <div className="container">

            <form>
              Nombre
              <input size={4} type="text" name="product" value={item.name} onChange={handleInputChange} />
              Precio
              <input size={4} type="text" name="price" value={item.price} onChange={handleInputChange} />
              Cantidad
              <input size={4} type="text" name="amount" value={1} onChange={handleInputChange} />
              <button type="button" onClick={addItem}>Add</button>
            </form>

          </div>
        </div>

      ))}

    </div>
  );
}

export default App;
