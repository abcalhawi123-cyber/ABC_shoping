import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const ex = state.find(i => i._id === action.item._id);
      if (ex) return state.map(i => i._id === action.item._id ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE': return state.filter(i => i._id !== action.id);
    case 'UPDATE_QTY': return state.map(i => i._id === action.id ? { ...i, qty: Math.max(1, Math.min(action.qty, i.stock)) } : i);
    case 'CLEAR': return [];
    default: return state;
  }
};

const load = () => { try { const s = JSON.parse(localStorage.getItem('cart')); return Array.isArray(s) ? s : []; } catch { return []; } };

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, [], load);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  const subtotal = cart.reduce((s, i) => s + i.sellingPrice * (1 - (i.discount || 0) / 100) * i.qty, 0);
  return <CartContext.Provider value={{ cart, dispatch, subtotal, itemCount: cart.length }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
