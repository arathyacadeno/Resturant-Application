import React, { createContext, useState, useEffect, useContext } from 'react';
import { ordersApi } from '../api/ordersApi';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTableOrder, setActiveTableOrder] = useState(null);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(false);
  const [orderType, setOrderType] = useState('dine_in'); // dine_in, takeaway, delivery, swiggy, zomato
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadActiveTableOrder = async (tableId) => {
    if (!tableId) {
      setActiveTableOrder(null);
      return;
    }
    setLoadingActiveOrder(true);
    try {
      const orderData = await ordersApi.getActiveTableOrder(tableId);
      const guestFromTable = selectedTable?.active_reservation?.guest_name || selectedTable?.guest_name || '';

      if (orderData && orderData.id && Array.isArray(orderData.items)) {
        setActiveTableOrder(orderData);
        setCustomerName(orderData.customer_name || guestFromTable || '');
        setCustomerPhone(orderData.customer_phone || '');
      } else {
        setActiveTableOrder(null);
      }
    } catch (err) {
      console.error('Error fetching active table order metadata:', err);
      setActiveTableOrder(null);
    } finally {
      setLoadingActiveOrder(false);
    }
  };

  useEffect(() => {
    if (selectedTable?.id) {
      loadActiveTableOrder(selectedTable.id);
    } else {
      setActiveTableOrder(null);
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
    }
  }, [selectedTable?.id]);

  const addToCart = (menuItem, portion = 'Full') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.menu_item?.id) === String(menuItem.id) && item.portion === portion
      );

      let price = parseFloat(menuItem.price);
      if (portion === 'Half' && menuItem.half_price) {
        price = parseFloat(menuItem.half_price);
      } else if (portion === 'Half') {
        price = Math.round(parseFloat(menuItem.price) * 0.6);
      } else if (portion === 'Quarter' && menuItem.quarter_price) {
        price = parseFloat(menuItem.quarter_price);
      } else if (portion === 'Quarter') {
        price = Math.round(parseFloat(menuItem.price) * 0.35);
      }

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
            unit_price: price,
            portion,
            notes: '',
          },
        ];
      }
    });
  };

  const removeFromCart = async (menuItemId, portion) => {
    setCartItems((prev) =>
      prev.filter((item) => !(String(item.menu_item?.id) === String(menuItemId) && item.portion === portion))
    );
  };

  const updateQuantity = (menuItemId, portion, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (String(item.menu_item?.id) === String(menuItemId) && item.portion === portion) {
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
        String(item.menu_item?.id) === String(menuItemId) && item.portion === portion
          ? { ...item, notes }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedTable(null);
    setActiveTableOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const startNewOrderSession = (table) => {
    setSelectedTable(table);
    setCartItems([]);
    setActiveTableOrder(null);
    setCustomerName(table?.active_reservation?.guest_name || table?.guest_name || '');
    setCustomerPhone('');
    setOrderNotes('');
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    if (orderType === 'dine_in' && !selectedTable) {
      throw new Error('Please select a dining table for Dine-In orders');
    }

    setIsSubmitting(true);
    try {
      let createdOrder;
      const itemsPayload = cartItems.map((item) => ({
        menu_item: item.menu_item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        portion: item.portion,
        notes: item.notes,
      }));

      if (activeTableOrder && activeTableOrder.id) {
        createdOrder = await ordersApi.addItemsToOrder(activeTableOrder.id, itemsPayload);
      } else {
        const payload = {
          table: orderType === 'dine_in' ? (selectedTable?.id || null) : null,
          order_type: orderType,
          customer_name: customerName,
          customer_phone: customerPhone,
          notes: orderNotes,
          items: itemsPayload,
        };
        createdOrder = await ordersApi.createOrder(payload);
      }

      setCartItems([]);
      if (selectedTable?.id) {
        await loadActiveTableOrder(selectedTable.id);
      }
      return createdOrder;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        cartItems,
        hasDraftItems: cartItems.length > 0,
        selectedTable,
        setSelectedTable,
        startNewOrderSession,
        activeTableOrder,
        loadingActiveOrder,
        loadActiveTableOrder,
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
