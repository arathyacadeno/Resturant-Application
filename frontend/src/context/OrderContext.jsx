import React, { createContext, useState, useContext } from 'react';
import { ordersApi } from '../api/ordersApi';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderType, setOrderType] = useState('dine_in'); // dine_in, takeaway, delivery, swiggy, zomato
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (menuItem, portion = 'Full') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.menu_item.id === menuItem.id && item.portion === portion
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            menu_item: menuItem,
            quantity: 1,
            unit_price: parseFloat(menuItem.price),
            portion,
            notes: '',
          },
        ];
      }
    });
  };

  const removeFromCart = (menuItemId, portion) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.menu_item.id === menuItemId && item.portion === portion))
    );
  };

  const updateQuantity = (menuItemId, portion, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.menu_item.id === menuItemId && item.portion === portion) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const updateItemNotes = (menuItemId, portion, notes) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.menu_item.id === menuItemId && item.portion === portion
          ? { ...item, notes }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    if (orderType === 'dine_in' && !selectedTable) {
      throw new Error('Please select a dining table for Dine-In orders');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        table: orderType === 'dine_in' ? (selectedTable?.id || null) : null,
        order_type: orderType,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: orderNotes,
        items: cartItems.map((item) => ({
          menu_item: item.menu_item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          portion: item.portion,
          notes: item.notes,
        })),
      };

      const createdOrder = await ordersApi.createOrder(payload);
      clearCart();
      return createdOrder;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        cartItems,
        selectedTable,
        setSelectedTable,
        orderType,
        setOrderType,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        orderNotes,
        setOrderNotes,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNotes,
        clearCart,
        subtotal,
        placeOrder,
        isSubmitting,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
