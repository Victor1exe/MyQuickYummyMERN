// import React from 'react'
// import Delete from '@material-ui/icons/Delete'
// import { useCart, useDispatchCart } from '../components/ContextReducer';
// export default function Cart() {
//   let data = useCart();
//   let dispatch = useDispatchCart();
//   if (data.length === 0) {
//     return (
//       <div>
//         <div className='m-5 w-100 text-center fs-3'>The Cart is Empty!</div>
//       </div>
//     )
//   }
//   // const handleRemove = (index)=>{
//   //   console.log(index)
//   //   dispatch({type:"REMOVE",index:index})
//   // }

//   const handleCheckOut = async () => {
//     let userEmail = localStorage.getItem("userEmail");
//     // console.log(data,localStorage.getItem("userEmail"),new Date())
//     let response = await fetch("http://localhost:5000/api/orderData", {
//       // credentials: 'include',
//       // Origin:"http://localhost:3000/login",
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         order_data: data,
//         email: userEmail,
//         order_date: new Date().toDateString()
//       })
//     });
//     console.log("Order Response", response)
//     if (response.status === 200) {
//       dispatch({ type: "DROP" })
//     }
//   }

//   let totalPrice = data.reduce((total, food) => total + food.price, 0)
//   return (
//     <div>

//       {console.log(data)}
//       <div className='container m-auto mt-5 table-responsive  table-responsive-sm table-responsive-md' style={{ height: '400px', overflow: 'scroll' }} >
//         <table className='table table-hover '>
//           <thead className=' text-success fs-4'>
//             <tr>
//               <th scope='col' >#</th>
//               <th scope='col' >Name</th>
//               <th scope='col' >Quantity</th>
//               <th scope='col' >Option</th>
//               <th scope='col' >Amount</th>
//               <th scope='col' ></th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((food, index) => (
//               <tr>
//                 <th scope='row' >{index + 1}</th>
//                 <td >{food.name}</td>
//                 <td>{food.qty}</td>
//                 <td>{food.size}</td>
//                 <td>{food.price}</td>
//                 <td ><button type="button" className="btn p-0"><Delete onClick={() => { dispatch({ type: "REMOVE", index: index }) }} /></button> </td></tr>
//             ))}
//           </tbody>
//         </table>
//         <div><h1 className='fs-2'>Total Price: {totalPrice}/-</h1></div>
//         <div>
//           <button className='btn bg-success mt-5 ' onClick={handleCheckOut} > Check Out </button>
//         </div>
//       </div>



//     </div>
//   )
// }

import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState } from 'react';
import { useCart, useDispatchCart } from '../components/ContextReducer';

export default function Cart({ darkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foodFacts, setFoodFacts] = useState([]);
  const [currentFact, setCurrentFact] = useState(0);
  let data = useCart();
  let dispatch = useDispatchCart();

  // Sample food facts
  const facts = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
    "The world's most expensive pizza costs $12,000 and takes 72 hours to make.",
    "Bananas are berries, but strawberries aren't.",
    "The fear of cooking is known as Mageirocophobia.",
    "Apples float because 25% of their volume is air.",
    "The world's largest chocolate bar weighed 12,770 pounds.",
    "Peanuts are not nuts - they're legumes.",
    "The most stolen food in the world is cheese.",
    "The color of a chili pepper is no indication of its spiciness.",
    "The average person eats about 35 tons of food in their lifetime."
  ];

  useEffect(() => {
    // Set up food facts rotation
    setFoodFacts(facts);
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 5000);

    return () => clearInterval(factInterval);
  }, []);

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      let userEmail = localStorage.getItem("userEmail");
      let response = await fetch("http://localhost:5000/api/orderData", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_data: data,
          email: userEmail,
          order_date: new Date().toDateString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status === 200) {
        dispatch({ type: "DROP" });
      }
    } catch (err) {
      setError(err.message);
      console.error("Checkout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  let totalPrice = data.reduce((total, food) => total + food.price, 0);

  if (data.length === 0) {
    return (
      <div className={`cart-container ${darkMode ? 'dark' : ''}`}>
        <div className="no-items-container">
          <h1 className="no-items-title">Your cart is empty</h1>
          <div className="crying-emoji" role="img" aria-label="Crying emoji">
            😭
          </div>
          <div className="food-facts-section">
            <h2>Did You Know?</h2>
            <div className="food-fact-card">
              <p>{foodFacts[currentFact]}</p>
            </div>
            <div className="happy-emoji" role="img" aria-label="Happy emoji">
              😋
            </div>
          </div>
        </div>

        <style jsx>{`
          .cart-container {
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            transition: var(--transition);
            padding-top: 2rem;
          }

          .no-items-container {
            text-align: center;
            padding: 2rem;
            animation: fadeIn 1s ease-out;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }

          .no-items-title {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: var(--text-color);
          }

          .crying-emoji {
            font-size: 10rem;
            animation: shakeHead 2s infinite, bounce 2s infinite;
          }

          .food-facts-section {
            margin-top: 4rem;
            text-align: center;
            animation: fadeIn 1s ease-out;
          }

          .food-facts-section h2 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
          }

          .food-fact-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            box-shadow: var(--shadow);
            font-size: 1.2rem;
            line-height: 1.6;
            transition: var(--transition);
          }

          .happy-emoji {
            font-size: 5rem;
            margin-top: 2rem;
            display: inline-block;
            animation: jump 2s infinite, rotate 5s infinite;
          }

          /* Dark mode specific styles */
          .dark .food-fact-card {
            background: rgba(30, 30, 30, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes shakeHead {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes jump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }

          @keyframes rotate {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }

          @media (max-width: 768px) {
            .no-items-title {
              font-size: 2rem;
            }
            
            .crying-emoji {
              font-size: 8rem;
            }
          }

          @media (max-width: 480px) {
            .no-items-title {
              font-size: 1.8rem;
            }
            
            .crying-emoji {
              font-size: 6rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`cart-container ${darkMode ? 'dark' : ''}`}>
      <div className="container cart-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i> Processing your order...
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        ) : (
          <>
            <h1 className="cart-title">Your Shopping Cart</h1>
            <div className="cart-table-container">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Size</th>
                    <th scope="col">Price</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((food, index) => (
                    <tr key={index} className="cart-item">
                      <td>{index + 1}</td>
                      <td className="food-name">{food.name}</td>
                      <td>{food.qty}</td>
                      <td>{food.size}</td>
                      <td className="price">₹{food.price}/-</td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => { dispatch({ type: "REMOVE", index: index }) }}
                          aria-label="Remove item"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cart-summary">
              <div className="total-price">
                <h2>Total: ₹{totalPrice}/-</h2>
              </div>
              <button 
                className="checkout-btn" 
                onClick={handleCheckOut}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>

            <div className="food-facts-section">
              <h2>Did You Know?</h2>
              <div className="food-fact-card">
                <p>{foodFacts[currentFact]}</p>
              </div>
              <div className="happy-emoji" role="img" aria-label="Happy emoji">
                😋
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .cart-container {
          background-color: var(--bg-color);
          color: var(--text-color);
          min-height: 100vh;
          transition: var(--transition);
          padding: 2rem 0;
        }

        .cart-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .loading-spinner,
        .error-message {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
        }

        .error-message {
          color: #dc3545;
        }

        .cart-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          color: var(--primary-color);
          animation: fadeInDown 1s ease-out;
        }

        .cart-table-container {
          margin: 2rem 0;
          overflow-x: auto;
        }

        .cart-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        .cart-table th {
          background-color: var(--primary-color);
          color: white;
          padding: 1rem;
          text-align: left;
        }

        .cart-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .cart-item:hover {
          background-color: var(--hover-bg);
          transition: var(--transition);
        }

        .food-name {
          font-weight: 600;
          color: var(--text-color);
        }

        .price {
          font-weight: bold;
          color: var(--primary-color);
        }

        .delete-btn {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 0.5rem;
          transition: var(--transition);
        }

        .delete-btn:hover {
          transform: scale(1.2);
        }

        .cart-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: var(--shadow);
          animation: fadeInUp 0.5s ease-out;
        }

        .total-price h2 {
          margin: 0;
          color: var(--text-color);
        }

        .checkout-btn {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .checkout-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .checkout-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .food-facts-section {
          margin-top: 4rem;
          text-align: center;
          animation: fadeIn 1s ease-out;
        }

        .food-facts-section h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: var(--primary-color);
        }

        .food-fact-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: var(--shadow);
          font-size: 1.2rem;
          line-height: 1.6;
          transition: var(--transition);
        }

        .happy-emoji {
          font-size: 5rem;
          margin-top: 2rem;
          display: inline-block;
          animation: jump 2s infinite, rotate 5s infinite;
        }

        /* Dark mode specific styles */
        .dark .cart-table th {
          background-color: var(--dark-primary);
        }

        .dark .cart-table td {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .dark .cart-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .dark .cart-summary,
        .dark .food-fact-card {
          background: rgba(30, 30, 30, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .cart-title {
            font-size: 2rem;
          }
          
          .cart-summary {
            flex-direction: column;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .cart-title {
            font-size: 1.8rem;
          }
          
          .cart-table th, 
          .cart-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}