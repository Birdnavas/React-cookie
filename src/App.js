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
      const newRow = { id, product, price, amount: parseInt(amount, 10) };
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

  const handleAddButtonClick = (itemId) => {
    // Do something with the itemId, 
    console.log(`Item with ID ${itemId} added`);
    {
      ListarInformacion.filter((item) => item.id == itemId).map((item) => (

        setFormData({ product: item.name, price: item.price, amount: '1' })


      ))
    };

  };

  function handleSubmit(e) {
    e.preventDefault();
    console.log('You clicked submit.');
    console.log(formData)
    addItem();
  }


  const estadoInicialProductos = {
    name: "",
    description: "",
    stock: "",
    expirationDate: "",
    price: "",
  };

  const registrarInformacion = async (e) => {
    e.preventDefault();
    console.log(producto);

    try {
      const result = await contract.methods
        .addProduct(
          producto.name,
          producto.description,
          producto.stock,
          producto.expirationDate,
          producto.price,
        )
        .send({ from: account });
      console.log(result);
    } catch (error) {
      console.error(error);

    }
    ListarRegistros();
  };

  const ManejarFormulario = ({ target: { name, value } }) => {
    console.log(name, value);
    setProducto({ ...producto, [name]: value });
  };

  const [producto, setProducto] = useState(estadoInicialProductos);

  const updateAmount = (id, increment) => {
    const updatedList = myList.map((item) => {
      if (item.id === id) {
        const newAmount = increment ? item.amount + 1 : item.amount - 1;
      const amount = newAmount >= 1 ? newAmount : 1;
        return {
          ...item, amount,
          //amount: increment ? item.amount += 1 : item.amount -= 1,
        };
      }
      return item;
    });
    setMyList(updatedList);
    Cookies.set('myList', JSON.stringify(updatedList), { expires: 7 });
  };

  return (
    <div>

      <form onSubmit={registrarInformacion}>
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-[#3853DA] text-white">
              <th className="px-4 py-2 text-lg">NOMBRE</th>
              <th className="px-4 py-2 text-lg ">DESCRIPCION</th>
              <th className="px-4 py-2 text-lg ">EXISTENCIAS</th>
              <th className="px-4 py-2 text-lg">CADUCIDAD</th>
              <th className="px-4 py-2 text-lg">PRECIO</th>
            </tr>
          </thead>
          <tbody>
            <td className="px-4 py-2 border border-black">
              <input
                type="text"
                id="name"
                name="name"
                onChange={ManejarFormulario}
                value={producto.name}
                className="w-full p-2"
              />
            </td>

            <td className="px-4 py-2 border border-black">
              <input
                type="text"
                id="description"
                name="description"
                onChange={ManejarFormulario}
                value={producto.description}
                className="w-full p-2 "
              />
            </td>

            <td className="px-4 py-2 border border-black">
              <input
                type="number"
                id="stock"
                name="stock"
                onChange={ManejarFormulario}
                value={producto.stock}
                className="w-full p-2 "
              />
            </td>

            <td className="px-4 py-2 border border-black">
              <input
                type="text"
                id="expirationDate"
                name="expirationDate"
                onChange={ManejarFormulario}
                value={producto.expirationDate}
                className="w-full p-2"
              />
            </td>

            <td className="px-4 py-2 border border-black">
              <input
                type="number"
                id="price"
                name="price"
                onChange={ManejarFormulario}
                value={producto.price}
                className="w-full p-2 "
              />
            </td>

            <td className="px-4 py-2 border ">
              <button
                className="block bg-[#FFD658] rounded-[10px] p-4 text-xl font-sans font-medium"
                type="submit"
              >
                AÑADIR
              </button>
            </td>
          </tbody>
        </table>
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
                <button onClick={() => updateAmount(row.id, false)}>-</button>
                <button onClick={() => updateAmount(row.id, true)}>+</button>
                <button onClick={() => removeItem(row.id)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={deleteAllItems}>Clear</button>
      <p>Total: ${totalSum.toFixed(2)}</p>

      {ListarInformacion.filter((item) => item.id > 0).map((item) => (

        <form onSubmit={handleSubmit}>
          {item.name}<br></br>
          {item.price}<br></br>
          <button onClick={() => handleAddButtonClick(item.id)}>Add</button>
        </form>

      ))}

    </div>
  );
}

export default App;
