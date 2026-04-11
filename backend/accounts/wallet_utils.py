from eth_account import Account
from cryptography.fernet import Fernet
import base64
import os
from django.conf import settings
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

def get_cipher():
    # Derive a fixed 32-byte key from Django's SECRET_KEY for Fernet
    password = settings.SECRET_KEY.encode()
    salt = b'skill_link_salt' # In production, this should be unique and stored securely
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    return Fernet(key)

def generate_new_wallet():
    """Generates a new Ethereum wallet."""
    # Enable Mnemonic generation if needed, but for now simple private key
    acct = Account.create()
    return acct.address, acct._private_key.hex()

def encrypt_private_key(private_key_hex):
    """Encrypts a private key using Fernet."""
    cipher = get_cipher()
    return cipher.encrypt(private_key_hex.encode()).decode()

def decrypt_private_key(encrypted_key_str):
    """Decrypts a private key using Fernet."""
    cipher = get_cipher()
    return cipher.decrypt(encrypted_key_str.encode()).decode()
