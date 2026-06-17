import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find((i) => i._id === action.item._id);
      if (exists) {
        return state.map((i) =>
          i._id === action.item._id
            ? { ...i, qty: Math.min(i.qty + 1, i.stock) }
            : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE':
      return state.filter((i) => i._id !== action.id);
    case 'UPDATE_QTY':
      return state.map((i) =>
        i._id === action.id ? { ...i, qty: Math.max(1, Math.min(action.qty, i.stock)) } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

// Safe parse — always returns an array
const getSavedCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cart'));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], getSavedCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const subtotal = Array.isArray(cart) ? cart.reduce((sum, i) => {
    const price = i.sellingPrice * (1 - (i.discount || 0) / 100);
    return sum + price * i.qty;
  }, 0) : 0;

  return (
    <CartContext.Provider value={{ cart: Array.isArray(cart) ? cart : [], dispatch, subtotal, itemCount: Array.isArray(cart) ? cart.length : 0 }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
