import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import smartContractRegistro from "./registro.json";
import Web3 from "web3";
import "./App.css";

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
  const [totalSum, setTotalSum] = useState(0);

  const [results, setResults] = useState([]);

  useEffect(() => {
    const cookieValue = Cookies.get('myList');
    const parsedList = cookieValue ? JSON.parse(cookieValue) : [];
    setMyList(parsedList);
  }, []);

  useEffect(() => {
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

        {ListarInformacion.filter((item) => item.id > 0).map((item) => (

          <div className="card" key={item.id}>
            <div className="container">
              <h4><b>{item.name}</b></h4> 
              <p>{item.price}</p>
              <button onClick={addItem}>Add</button>
            </div>
          </div>

        ))}

    </div>
  );
}

export default App;
