import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositWithdrawForm from '../DepositWithdrawForm/DepositWithdrawForm';
import { PiHandDepositFill } from "react-icons/pi";
import { PiHandWithdrawFill } from "react-icons/pi";
import './Accounts.css';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshArchives, setRefreshArchives] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/archives/?archive_type=Account')
      .then(response => setArchivedAccounts(response.data || []))
      .catch(error => console.error('Error fetching archived accounts:', error));
  }, [refreshArchives]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/accounts/');
      setAccounts(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const openForm = (account, type) => {
    if (type === 'deposit' && account.shareCapital >= 1000000) {
      setErrorMessage('The account already has the maximum allowed share capital of 1,000,000.');
      return;
    } else if (type === 'withdraw' && account.shareCapital < 50000) {
      setErrorMessage('The account does not meet the minimum share capital requirement of 50,000 to allow a withdrawal.');
      return;
    }

    if (type === 'withdraw') {
      setModalContent({
        message: `Do you want to withdraw the full amount of ${Number(
          account.shareCapital
        ).toLocaleString()}? Notice: Your Account will be marked Inactive.`,
        onConfirm: () => {
          setSelectedAccount({ ...account, fullWithdrawal: account.shareCapital });
          setActionType(type);
          setShowForm(true);
          closeModal();
        },
      });
      setShowModal(true);
    } else {
      setSelectedAccount(account);
      setActionType(type);
      setShowForm(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedAccount(null);
    setActionType('');
  };

  const getAccountHolderName = (member) => {
    if (member && member.first_name && member.middle_name && member.last_name) {
      return `${member.first_name} ${member.middle_name} ${member.last_name}`;
    }
    return 'Account Holder Not Found';
  };

  const filteredAccounts = accounts.filter((account) => {
    const accountNumber = account.account_number.toString();
    const accountHolderName = getAccountHolderName(account.account_holder).toLowerCase();
    return (
      accountNumber.includes(searchQuery.toLowerCase()) ||
      accountHolderName.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bertss-container">
      <h2 className="bertss-header">ACCOUNTS</h2>

      {errorMessage && (
        <div className="bertss-modal-overlay">
          <div className="bertss-modal-content">
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="bertss-modal-button">
              Close
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div>
          <div className="bertss-search-container">
            <input
              type="text"
              placeholder="Search Accounts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bertss-search-input"
            />
          </div>

          <div className="bertss-table-container">
            <table className="bertss-table">
              <thead>
                <tr className="bertss-table-header">
                  <th>Account Number</th>
                  <th>Account Holder</th>
                  <th>Share Capital</th>
                  <th>Status</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.account_number} className="bertss-table-row">
                    <td className="bertss-table-cell">{account.account_number}</td>
                    <td className="bertss-table-cell">{getAccountHolderName(account.account_holder)}</td>
                    <td className="bertss-table-cell">{Number(account.shareCapital).toLocaleString()}</td>
                    <td className="bertss-table-cell">{account.status}</td>
                    <td className="bertss-action-container">
                      {account.status.toLowerCase() === 'active' ? (
                        <>
                          <button onClick={() => openForm(account, 'deposit')} className="bertss-button">
                            <PiHandDepositFill />
                            <span className="bertss-button-text">Deposit</span>
                          </button>
                          <button onClick={() => openForm(account, 'withdraw')} className="bertss-button">
                            <PiHandWithdrawFill /> 
                            <span className="bertss-button-text">Withdraw</span>
                          </button>
                        </>
                      ) : (
                        <button className="bertss-archive-button">
                          Move to Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <DepositWithdrawForm
          onClose={closeForm}
          account={selectedAccount}
          actionType={actionType}
          fetchAccounts={fetchAccounts}
          setError={setError}
        />
      )}

      {showModal && (
        <div className="bertss-modal-overlay">
          <div className="bertss-modal-content">
            <p>{modalContent.message}</p>
            <button onClick={modalContent.onConfirm} className="bertss-modal-button">Yes</button>
            <button onClick={closeModal} className="bertss-modal-button">No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
