import React, { createContext, useContext, useReducer } from 'react';

const CartStateContext = createContext();
const CartDispatchContext = createContext();

/**
 * A cart line is identified by (id, size): the same dish in a half and a full
 * portion are two separate lines. The previous reducer matched on `id` alone,
 * so adding a full portion of something already in the cart as a half silently
 * merged the two and produced a wrong total.
 */
const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD':
            return [
                ...state,
                {
                    id: action.id,
                    name: action.name,
                    qty: Number(action.qty),
                    size: action.size,
                    price: Number(action.price),
                    img: action.img
                }
            ];

        case 'UPDATE':
            return state.map((food) =>
                food.id === action.id && food.size === action.size
                    ? {
                          ...food,
                          qty: Number(food.qty) + Number(action.qty),
                          price: Number(food.price) + Number(action.price)
                      }
                    : food
            );

        case 'REMOVE':
            return state.filter((_, index) => index !== action.index);

        case 'DROP':
            return [];

        default:
            console.error(`Unknown cart action: ${action.type}`);
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, []);

    return (
        <CartDispatchContext.Provider value={dispatch}>
            <CartStateContext.Provider value={state}>{children}</CartStateContext.Provider>
        </CartDispatchContext.Provider>
    );
};

export const useCart = () => useContext(CartStateContext);
export const useDispatchCart = () => useContext(CartDispatchContext);
