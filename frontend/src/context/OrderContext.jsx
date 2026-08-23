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
      setCartItems([]);
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
        const formattedItems = orderData.items.map((item) => ({
          order_item_id: item.id,
          menu_item: {
            id: item.menu_item,
            name: item.menu_item_name || 'Item',
            price: parseFloat(item.unit_price),
            image: item.menu_item_image || '',
          },
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          portion: item.portion || 'Full',
          notes: item.notes || '',
        }));
        setCartItems(formattedItems);
      } else {
        setActiveTableOrder(null);
        setCartItems([]);
        setCustomerName((prev) => prev || guestFromTable || '');
        setCustomerPhone('');
        setOrderNotes('');
      }
    } catch (err) {
      console.error('Error fetching active table order:', err);
      const guestFromTable = selectedTable?.active_reservation?.guest_name || selectedTable?.guest_name || '';
      setActiveTableOrder(null);
      setCartItems([]);
      setCustomerName((prev) => prev || guestFromTable || '');
      setCustomerPhone('');
      setOrderNotes('');
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
        (item) => item.menu_item.id === menuItem.id && item.portion === portion
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
    const targetItem = cartItems.find(
      (item) => item.menu_item.id === menuItemId && item.portion === portion
    );
    
    setCartItems((prev) =>
      prev.filter((item) => !(item.menu_item.id === menuItemId && item.portion === portion))
    );

    if (targetItem?.order_item_id) {
      try {
        await ordersApi.updateOrderItem(targetItem.order_item_id, { quantity: 0 });
      } catch (err) {
        console.error('Failed to remove order item on backend:', err);
      }
    }
  };

  const updateQuantity = async (menuItemId, portion, delta) => {
    let updatedQty = 0;
    let targetItem = null;

    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.menu_item.id === menuItemId && item.portion === portion) {
            targetItem = item;
            const newQty = item.quantity + delta;
            updatedQty = newQty;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });

    if (targetItem?.order_item_id) {
      try {
        await ordersApi.updateOrderItem(targetItem.order_item_id, { quantity: updatedQty });
      } catch (err) {
        console.error('Failed to update order item quantity on backend:', err);
      }
    }
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
    setActiveTableOrder(null);
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
      if (activeTableOrder && activeTableOrder.id) {
        const itemsPayload = cartItems.map((item) => ({
          menu_item: item.menu_item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          portion: item.portion,
          notes: item.notes,
        }));
        const res = await ordersApi.addItemsToOrder(activeTableOrder.id, itemsPayload);
        if (selectedTable?.id) {
          await loadActiveTableOrder(selectedTable.id);
        }
        return res;
      } else {
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
        if (orderType === 'dine_in' && selectedTable?.id) {
          await loadActiveTableOrder(selectedTable.id);
        }
        return createdOrder;
      }
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
