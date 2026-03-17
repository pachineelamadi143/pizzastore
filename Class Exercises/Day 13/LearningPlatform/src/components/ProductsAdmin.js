import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, updateProduct } from '../features/products/productsSlice';

export default function ProductsAdmin() {
  const dispatch = useDispatch();
  const products = useSelector(s => s.products.items);
  const status = useSelector(s => s.products.status);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  function increasePrice(p) {
    dispatch(updateProduct({ ...p, price: p.price + 1 }));
  }

  return (
    <div className="card products-admin">
      <h3>Products Admin</h3>
      {status === 'loading' && <div>Loading...</div>}
      <ul style={{listStyle:'none',padding:0,margin:0}}>
        {products.map(p => (
          <li key={p.id} style={{display:'flex',justifyContent:'space-between',gap:10,padding:'8px 0',borderBottom:'1px dashed rgba(0,0,0,0.06)'}}>
            <span>{p.name} — ${p.price}</span>
            <div>
              <button onClick={() => increasePrice(p)}>Increase $</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
