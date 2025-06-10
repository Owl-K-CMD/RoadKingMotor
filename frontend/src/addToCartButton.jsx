import React from "react"

const Addtocart = ({ cartItems = [], onClose }) => {

    const grandTotal = cartItems.reduce((total, item) => {
      const Price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;

      return total + (Price * quantity);
    }, 0)


  return (


    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee',
        marginBottom: '10px'
      }}>
        <h2 style={{ margin: 0 }}>My Cart</h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            aria-label="Close cart"
          >
            &times;
          </button>
        )}
      </div>
      {cartItems && cartItems.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flexGrow: 1 }}>
          {cartItems.map((item, index) => (
            <li key={item._id || index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Model: {item.model}</p>
              <p style={{ margin: 0 }}>Price: {item.price} rwf</p>
              <p style={{ margin: 0 }}>Quantity: {item.quantity}</p>
              <p style={{ margin: 0 }}>Total: {Number(item.price) * Number(item.quantity)} rwf</p>
            </li>
          ))}
        </ul>

      ) : (
        <p style={{ textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Your cart is empty.</p>
      )}
      {cartItems && cartItems.length > 0 && (
<div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #333', textAlign: 'right' }}>
              <h3 style={{ margin: 0, fontSize: '1.2em' }}>
            Grand Total: {grandTotal.toLocaleString()} rwf
          </h3>
        </div> 
    )}

    </div>
  
  )
}

export default Addtocart