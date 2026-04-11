import json
import requests
from web3 import Web3
from eth_account import Account
from django.conf import settings

# Contract Configuration
CONTRACT_ADDRESS = "0x9866F0236A5405d2A537FEC74086481feF2572c4"
RPC_URL = "https://rpc-amoy.polygon.technology/"

# Minimal ABI for common operations
ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "fundAgreement",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_seeker",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "createAgreement",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "markCompleted",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "address",
                "name": "seeker",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "AgreementCreated",
        "type": "event"
    }
]

def get_live_matic_price_inr():
    """
    Fetches the live price of 1 MATIC in INR using CoinGecko API.
    Provides a fallback hardcoded rate if the API fails.
    """
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=inr"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return float(data['matic-network']['inr'])
    except Exception as e:
        print(f"Failed to fetch live MATIC price: {str(e)}. Using fallback rate.")
        return 75.00 # Fallback rate (1 MATIC = 75 INR)

def fund_wallet_from_treasury(to_address, matic_amount):
    """
    Sends MATIC from the platform's Treasury wallet to a targeted wallet.
    Used to fund a user's Managed Wallet just-in-time for escrow funding.
    """
    treasury_key = getattr(settings, 'TREASURY_PRIVATE_KEY', None)
    if not treasury_key:
        raise ValueError("TREASURY_PRIVATE_KEY is not configured in settings.py")
        
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    treasury_account = Account.from_key(treasury_key)
    
    # Calculate amount in Wei (adding a tiny bit extra for gas Buffer: 0.005 MATIC)
    amount_with_gas_buffer = matic_amount + 0.005
    value_wei = w3.to_wei(amount_with_gas_buffer, 'ether')
    
    # Check treasury balance
    treasury_balance = w3.eth.get_balance(treasury_account.address)
    if treasury_balance < value_wei:
        if getattr(settings, 'DEBUG', False):
            print(f"[Treasury DEV Bypass] Treasury has {w3.from_wei(treasury_balance, 'ether')} MATIC but needs {amount_with_gas_buffer}. Simulating success to unblock testing.")
            return "0x_mock_treasury_tx", None
        raise ValueError(f"Treasury Wallet ({treasury_account.address}) has insufficient funds. Needs {amount_with_gas_buffer} MATIC.")

    print(f"[Treasury] Sending {amount_with_gas_buffer} MATIC to {to_address}...")
    
    tx = {
        'to': to_address,
        'value': value_wei,
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'nonce': w3.eth.get_transaction_count(treasury_account.address),
        'chainId': w3.eth.chain_id
    }
    
    try:
        signed_tx = w3.eth.account.sign_transaction(tx, treasury_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Wait for completion so the target wallet has the funds before proceeding
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"[Treasury] Transfer complete. TxHash: {tx_hash.hex()}")
        return tx_hash.hex(), receipt
    except Exception as e:
        if getattr(settings, 'DEBUG', False) and ("insufficient funds" in str(e).lower() or "exceeds" in str(e).lower() or "cap" in str(e).lower()):
            print(f"[Treasury DEV Bypass] Treasury transaction failed: {str(e)}. Simulating success.")
            return "0x_mock_treasury_tx", None
        raise e
def fund_agreement_on_chain(on_chain_id, matic_amount, private_key):
    """
    Signs and sends a fundAgreement transaction from the user's managed wallet.
    """
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = Account.from_key(private_key)
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

    # Convert MATIC to Wei
    value_wei = w3.to_wei(matic_amount, 'ether')

    # Build transaction
    tx = contract.functions.fundAgreement(int(on_chain_id)).build_transaction({
        'from': account.address,
        'value': value_wei,
        'gas': 65000,
        'gasPrice': w3.eth.gas_price,
        'nonce': w3.eth.get_transaction_count(account.address),
        'chainId': w3.eth.chain_id
    })

    # Sign and send
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Wait for receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex(), receipt

def create_agreement_on_chain(seeker_address, matic_amount, private_key):
    """
    Signs and sends a createAgreement transaction from the user's managed wallet.
    Returns the on_chain_id and receipt.
    """
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = Account.from_key(private_key)
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

    # Convert MATIC to Wei
    value_wei = w3.to_wei(matic_amount, 'ether')

    # Build transaction
    tx = contract.functions.createAgreement(
        w3.to_checksum_address(seeker_address), 
        value_wei
    ).build_transaction({
        'from': account.address,
        'gas': 65000,
        'gasPrice': w3.eth.gas_price,
        'nonce': w3.eth.get_transaction_count(account.address),
        'chainId': w3.eth.chain_id
    })

    # Sign and send
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Wait for receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Parse logs for on_chain_id
    on_chain_id = None
    for log in receipt.get('logs', []):
        try:
            # The ID is indexed, so it's in topics[1]
            if len(log['topics']) > 1:
                topic_hex = log['topics'][1]
                if isinstance(topic_hex, bytes):
                    on_chain_id = int.from_bytes(topic_hex, byteorder='big')
                else:
                    on_chain_id = int(topic_hex, 16)
                break
        except Exception:
            continue
            
    return on_chain_id, tx_hash.hex(), receipt

def complete_agreement_on_chain(on_chain_id, private_key):
    """
    Signs and sends the markCompleted transaction on the smart contract from the Provider's managed wallet.
    This tells the smart contract to physically release the locked MATIC to the Seeker.
    Returns the tx_hash and receipt.
    """
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = Account.from_key(private_key)
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

    tx = contract.functions.markCompleted(int(on_chain_id)).build_transaction({
        'from': account.address,
        'gas': 65000,
        'gasPrice': w3.eth.gas_price,
        'nonce': w3.eth.get_transaction_count(account.address),
        'chainId': w3.eth.chain_id
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Wait for receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex(), receipt

def withdraw_matic(private_key, target_address, matic_amount):
    """
    Sends pure MATIC from a managed wallet to an external physical wallet address.
    """
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = Account.from_key(private_key)
    
    value_wei = w3.to_wei(matic_amount, 'ether')
    
    # Check balance
    balance = w3.eth.get_balance(account.address)
    if balance < value_wei:
        if getattr(settings, 'DEBUG', False):
            print(f"[Withdraw DEV Bypass] Managed wallet has {w3.from_wei(balance, 'ether')} MATIC but needs {matic_amount}. Simulating success to unblock testing.")
            return "0x_mock_withdraw_tx", None
        raise ValueError(f"Insufficient funds for withdrawal. Balance: {w3.from_wei(balance, 'ether')} MATIC.")
        
    print(f"[Withdraw] Sending {matic_amount} MATIC from {account.address} to {target_address}...")
    
    tx = {
        'to': target_address,
        'value': value_wei,
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'nonce': w3.eth.get_transaction_count(account.address),
        'chainId': w3.eth.chain_id
    }
    
    try:
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"[Withdraw] Transfer complete. TxHash: {tx_hash.hex()}")
        return tx_hash.hex(), receipt
    except Exception as e:
        if getattr(settings, 'DEBUG', False) and ("insufficient funds" in str(e).lower() or "exceeds" in str(e).lower() or "cap" in str(e).lower()):
            print(f"[Withdraw DEV Bypass] Withdrawal failed: {str(e)}. Simulating success.")
            return "0x_mock_withdraw_tx", None
        raise e
