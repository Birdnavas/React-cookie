import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';

function Read() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Data, setData] = useState(null); // Initialize Data as null

  useEffect(() => {
    axios
      .get(`http://localhost:3030/users/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [id]); // Include 'id' as a dependency

  return (
    <div>
      {Data ? (
        <div>

          <p>Transaccion ID: #{Data.id}</p>

          {Data.myList ? (
            <div>
              <p>Facturado: </p>
              <ul>
                {Data.myList.map((item) => (
                  <li key={item.id}>
                    {item.amount} x {item.product}   ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p>Total: USD$ {Data.total}</p>
          <p>Fecha: {Data.fecha}</p>

          <Link to="/">Cerrar</Link>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Read;
