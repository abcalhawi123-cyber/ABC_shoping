import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart item key now includes color to allow same product, different colors
const itemKey = item => item.selectedColor ? `${item._id}__${item.selectedColor}` : item._id;

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const key = itemKey(action.item);
      const ex = state.find(i => itemKey(i) === key);
      if (ex) return state.map(i => itemKey(i) === key ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i);
      return [...state, { ...action.item, qty: 1, _cartKey: key }];
    }
    case 'REMOVE': return state.filter(i => itemKey(i) !== action.id);
    case 'UPDATE_QTY': return state.map(i => itemKey(i) === action.id ? { ...i, qty: Math.max(1, Math.min(action.qty, i.stock)) } : i);
    case 'CLEAR': return [];
    default: return state;
  }
};

const load = () => { try { const s = JSON.parse(localStorage.getItem('cart')); return Array.isArray(s) ? s : []; } catch { return []; } };

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, [], load);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  const subtotal = cart.reduce((s, i) => s + i.sellingPrice * (1 - (i.discount || 0) / 100) * i.qty, 0);
  return <CartContext.Provider value={{ cart, dispatch, subtotal, itemCount: cart.length, itemKey }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
