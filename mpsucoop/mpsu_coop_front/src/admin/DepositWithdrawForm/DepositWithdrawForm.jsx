import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepositWithdrawForm.css'; // Import the external CSS

// ErrorModal Component
const ErrorModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Cleanup the timer when the component is unmounted or the message changes
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="bertsss-overlay">
      <div className="bertsss-modal">
        <div className="bertsss-message">{message}</div>
      </div>
    </div>
  );
};


function DepositWithdrawForm({ account, actionType, onClose, fetchAccounts, setError }) {
  const [amount, setAmount] = useState('');
  const [formattedShareCapital, setFormattedShareCapital] = useState('');
  const [isInactive, setIsInactive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // New state for error modal

  const formatAmount = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    setFormattedShareCapital(formatAmount(account.shareCapital || 0));
    setIsInactive(account.status === 'Inactive');
  }, [account]);

  const handleChange = (e) => {
    const formattedAmount = e.target.value
      .replace(/\D/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(formattedAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isInactive) {
      setErrorMessage('Account is inactive. Cannot perform transactions.');
      return;
    }
  
    let numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    if (actionType === 'deposit') {
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setErrorMessage('Invalid amount for deposit.');
        return;
      }
      if (numericAmount < 50000) {
        setErrorMessage('Sorry! You cannot deposit an amount below the minimum required Share Capital of 50,000.');
        return;
      }
      
      if (numericAmount > 1000000) {
        setErrorMessage('Sorry! Transaction cannot proceed, you have already reached the maximum Share Capital limit of 1,000,000.');
        return;
      }      
    }

    if (actionType === 'withdraw') {
      numericAmount = account.shareCapital;
      if (numericAmount <= 0) {
        setErrorMessage('Insufficient funds to withdraw.');
        return;
      }
    }
  
    try {
      const endpoint =
        actionType === 'deposit'
          ? `http://localhost:8000/accounts/${account.account_number}/deposit/`
          : `http://localhost:8000/accounts/${account.account_number}/withdraw/`;
  
      const response = await axios.post(
        endpoint,
        { amount: numericAmount.toString() },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log("Response:", response);  // Log the response
  
      if (actionType === 'withdraw') {
        const remainingShareCapital = account.shareCapital - numericAmount;
  
        if (remainingShareCapital <= 0) {
          await axios.patch(`http://localhost:8000/accounts/${account.account_number}/`, {
            status: 'inactive',
          });
          setIsInactive(true);
        }
      }
  
      fetchAccounts();
      onClose();
    } catch (err) {
      if (err.response) {
        console.error("Error response data:", err.response.data);
        setErrorMessage(err.response?.data?.error || 'An error occurred while processing your request.');
      } else {
        setErrorMessage('An error occurred while processing your request.');
      }
    }
  };

  return (
    <div>
      <h2 className="bertsss-header">
        {actionType === 'deposit' ? 'Deposit' : 'Withdraw'}
      </h2>
      <div className="bertsss-shareCapital">
        <h3>Share Capital</h3>
        <p className="bertsss-shareCapitalAmount">
          {formattedShareCapital}
        </p>
      </div>
      {isInactive ? (
        <div className="bertsss-inactiveMessage">
          <h3>Thank You!</h3>
          <p>Your account is inactive. No further actions are available.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bertsss-form">
          {actionType === 'deposit' && (
            <label>
              Amount:
              <input
                type="text"
                value={amount}
                onChange={handleChange}
                required
                className="bertsss-input"
              />
            </label>
          )}
          <div className="bertsss-buttonContainer">
            <button type="submit" className="bertsss-button">
              {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bertsss-cancelButton"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {errorMessage && (
        <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
    </div>
  );
}

export default DepositWithdrawForm;

